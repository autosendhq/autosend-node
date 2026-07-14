import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Autosend } from "../core/client.js";
import { InboundMessageStatus } from "../core/types.js";

describe("InboundEmails", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  it("exposes inboundEmails on the client", () => {
    const client = new Autosend("test-api-key");
    expect(client.inboundEmails).toBeDefined();
  });

  describe("inboundEmails.list", () => {
    it("lists messages and returns items + pagination", async () => {
      const payload = {
        items: [
          {
            id: "60d5ec49f1b2c72d9c8b1234",
            messageId: "<abc@mail>",
            domainName: "example.com",
            from: { email: "sender@example.com", name: "Sender" },
            to: [{ email: "inbox@example.com", name: null }],
            cc: [],
            subject: "Hello",
            status: "PROCESSED",
            attachmentCount: 0,
            receivedAt: "2026-01-01T00:00:00Z",
          },
        ],
        pagination: { page: 1, limit: 50, total: 1, pages: 1 },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: payload }),
      });

      const client = new Autosend("test-api-key");
      const result = await client.inboundEmails.list();

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(1);
      expect(result.data?.items[0].status).toBe(InboundMessageStatus.Processed);
      expect(result.data?.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 1,
        pages: 1,
      });
    });

    it("serializes filter/pagination options into the query string", async () => {
      let calledUrl = "";
      global.fetch = vi.fn().mockImplementation((url: string) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: { items: [], pagination: { page: 2, limit: 25, total: 0, pages: 0 } },
            }),
        });
      });

      const client = new Autosend("test-api-key");
      await client.inboundEmails.list({
        from: "sender@example.com",
        search: "invoice",
        page: 2,
        limit: 25,
      });

      expect(calledUrl).toContain("/inbound/messages?");
      expect(calledUrl).toContain("from=sender%40example.com");
      expect(calledUrl).toContain("search=invoice");
      expect(calledUrl).toContain("page=2");
      expect(calledUrl).toContain("limit=25");
    });

    it("omits undefined/empty query params", async () => {
      let calledUrl = "";
      global.fetch = vi.fn().mockImplementation((url: string) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: { items: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } },
            }),
        });
      });

      const client = new Autosend("test-api-key");
      await client.inboundEmails.list({ from: "", search: undefined, page: 1 });

      expect(calledUrl).not.toContain("from=");
      expect(calledUrl).not.toContain("search=");
      expect(calledUrl).toContain("page=1");
    });

    it("surfaces errors with statusCode", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ message: "Invalid value" })),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.inboundEmails.list({ limit: 9999 });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid value");
      expect(result.statusCode).toBe(400);
    });
  });

  describe("inboundEmails.get", () => {
    it("gets a message by id", async () => {
      const message = {
        id: "60d5ec49f1b2c72d9c8b1234",
        messageId: "<abc@mail>",
        domainName: "example.com",
        from: { email: "sender@example.com", name: "Sender" },
        to: [{ email: "inbox@example.com", name: null }],
        cc: [],
        bcc: [],
        replyTo: [],
        subject: "Hello",
        text: "hi",
        html: "<p>hi</p>",
        attachments: [],
        headers: {},
        spamVerdict: "PASS",
        virusVerdict: "PASS",
        spfVerdict: "PASS",
        dkimVerdict: "PASS",
        dmarcVerdict: "PASS",
        status: "PROCESSED",
        threadId: "thread-1",
        inReplyTo: null,
        inReplyToEmailActivityId: null,
        inReplyToInboundEmailId: null,
        receivedAt: "2026-01-01T00:00:00Z",
      };

      let calledUrl = "";
      global.fetch = vi.fn().mockImplementation((url: string) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: message }),
        });
      });

      const client = new Autosend("test-api-key");
      const result = await client.inboundEmails.get("60d5ec49f1b2c72d9c8b1234");

      expect(calledUrl).toContain("/inbound/messages/60d5ec49f1b2c72d9c8b1234");
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("60d5ec49f1b2c72d9c8b1234");
      expect(result.data?.subject).toBe("Hello");
    });

    it("handles not found", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ message: "Inbound email not found" })),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.inboundEmails.get("missing");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Inbound email not found");
      expect(result.statusCode).toBe(404);
    });
  });

  describe("inboundEmails.getAttachmentDownloadUrl", () => {
    it("returns the signed download URL and metadata", async () => {
      const payload = {
        attachmentId: "60d5ec49f1b2c72d9c8b9999",
        filename: "invoice.pdf",
        contentType: "application/pdf",
        size: 12345,
        downloadUrl: "https://s3.example.com/signed?token=abc",
        expiresIn: 900,
      };

      let calledUrl = "";
      global.fetch = vi.fn().mockImplementation((url: string) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: payload }),
        });
      });

      const client = new Autosend("test-api-key");
      const result = await client.inboundEmails.getAttachmentDownloadUrl(
        "60d5ec49f1b2c72d9c8b1234",
        0
      );

      expect(calledUrl).toContain(
        "/inbound/messages/60d5ec49f1b2c72d9c8b1234/attachments/0"
      );
      expect(result.success).toBe(true);
      expect(result.data?.downloadUrl).toBe(
        "https://s3.example.com/signed?token=abc"
      );
      expect(result.data?.expiresIn).toBe(900);
      expect(result.data?.filename).toBe("invoice.pdf");
    });

    it("accepts an attachmentId string ref", async () => {
      let calledUrl = "";
      global.fetch = vi.fn().mockImplementation((url: string) => {
        calledUrl = url;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                attachmentId: "60d5ec49f1b2c72d9c8b9999",
                filename: "file.txt",
                contentType: "text/plain",
                size: 10,
                downloadUrl: "https://s3.example.com/signed",
                expiresIn: 900,
              },
            }),
        });
      });

      const client = new Autosend("test-api-key");
      await client.inboundEmails.getAttachmentDownloadUrl(
        "60d5ec49f1b2c72d9c8b1234",
        "60d5ec49f1b2c72d9c8b9999"
      );

      expect(calledUrl).toContain(
        "/inbound/messages/60d5ec49f1b2c72d9c8b1234/attachments/60d5ec49f1b2c72d9c8b9999"
      );
    });

    it("surfaces not found with statusCode", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () =>
          Promise.resolve(JSON.stringify({ message: "Attachment not found" })),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.inboundEmails.getAttachmentDownloadUrl(
        "60d5ec49f1b2c72d9c8b1234",
        99
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Attachment not found");
      expect(result.statusCode).toBe(404);
    });
  });

  describe("inboundEmails.reply", () => {
    it("replies to a message", async () => {
      let calledUrl = "";
      let body: any;
      global.fetch = vi.fn().mockImplementation((url: string, options: any) => {
        calledUrl = url;
        body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 202,
          json: () =>
            Promise.resolve({
              success: true,
              message: "Reply queued",
              data: {
                emailId: "email-123",
                message: "Reply queued",
                status: "QUEUED",
                totalRecipients: 1,
              },
            }),
        });
      });

      const client = new Autosend("test-api-key");
      const result = await client.inboundEmails.reply("60d5ec49f1b2c72d9c8b1234", {
        from: { email: "support@example.com", name: "Support" },
        subject: "Re: Hello",
        html: "<p>Thanks for reaching out</p>",
      });

      expect(calledUrl).toContain("/inbound/messages/60d5ec49f1b2c72d9c8b1234/reply");
      expect(body.from.email).toBe("support@example.com");
      expect(result.success).toBe(true);
      expect(result.data?.emailId).toBe("email-123");
      expect(result.data?.status).toBe("QUEUED");
      expect(result.data?.totalRecipients).toBe(1);
    });

    it("surfaces reply errors with statusCode", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ message: "Domain not verified" })),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.inboundEmails.reply("60d5ec49f1b2c72d9c8b1234", {
        from: { email: "support@unverified.com" },
        text: "hi",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Domain not verified");
      expect(result.statusCode).toBe(400);
    });
  });
});
