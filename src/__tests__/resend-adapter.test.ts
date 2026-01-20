import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Resend } from "../adapters/resend/index.js";

describe("Resend Adapter", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.RESEND_API_KEY;

  beforeEach(() => {
    vi.useFakeTimers();
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
    if (originalEnv) {
      process.env.RESEND_API_KEY = originalEnv;
    }
  });

  describe("constructor", () => {
    it("should create client with API key", () => {
      const client = new Resend("test-api-key");
      expect(client).toBeDefined();
      expect(client.emails).toBeDefined();
      expect(client.contacts).toBeDefined();
    });

    it("should use environment variable if no key provided", () => {
      process.env.RESEND_API_KEY = "env-api-key";
      const client = new Resend();
      expect(client).toBeDefined();
    });

    it("should throw error if no API key available", () => {
      expect(() => new Resend()).toThrow("Missing API key");
    });

    it("should accept options", () => {
      const client = new Resend("test-api-key", {
        baseUrl: "https://custom.api.com",
        timeout: 5000,
        debug: true,
      });
      expect(client).toBeDefined();
    });
  });

  describe("emails.send", () => {
    it("should send email with Resend format and return Resend response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ emailId: "email-123" }),
      });

      const client = new Resend("test-api-key");
      const result = await client.emails.send({
        from: "Sender Name <sender@example.com>",
        to: "recipient@example.com",
        subject: "Test Email",
        html: "<p>Hello World</p>",
      });

      expect(result).toEqual({
        data: { id: "email-123" },
        error: null,
      });
    });

    it("should transform from address with name", async () => {
      let capturedBody: unknown;
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        capturedBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ emailId: "email-123" }),
        });
      });

      const client = new Resend("test-api-key");
      await client.emails.send({
        from: "John Doe <john@example.com>",
        to: "recipient@example.com",
        subject: "Test",
      });

      expect(capturedBody).toMatchObject({
        from: { name: "John Doe", email: "john@example.com" },
      });
    });

    it("should handle multiple recipients", async () => {
      let capturedBody: unknown;
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        capturedBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ emailId: "email-123" }),
        });
      });

      const client = new Resend("test-api-key");
      await client.emails.send({
        from: "sender@example.com",
        to: ["one@example.com", "two@example.com"],
        subject: "Test",
      });

      expect(capturedBody).toMatchObject({
        recipients: [{ email: "one@example.com" }, { email: "two@example.com" }],
      });
    });

    it("should return error response on failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ message: "Invalid email" })),
      });

      const client = new Resend("test-api-key", { timeout: 1000 });
      const result = await client.emails.send({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test",
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Invalid email");
    });

    it("should warn about unsupported tags", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ emailId: "email-123" }),
      });

      const client = new Resend("test-api-key");
      await client.emails.send({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test",
        tags: [{ name: "campaign", value: "test" }],
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Autosend: tags are not supported and will be ignored"
      );
      consoleSpy.mockRestore();
    });

    it("should warn about unsupported attachments", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ emailId: "email-123" }),
      });

      const client = new Resend("test-api-key");
      await client.emails.send({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test",
        attachments: [{ filename: "test.pdf", content: "base64content" }],
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Autosend: attachments are not currently supported"
      );
      consoleSpy.mockRestore();
    });

    it("should warn about unsupported headers", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ emailId: "email-123" }),
      });

      const client = new Resend("test-api-key");
      await client.emails.send({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test",
        headers: { "X-Custom-Header": "value" },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Autosend: custom headers are not supported and will be ignored"
      );
      consoleSpy.mockRestore();
    });

    it("should warn about unsupported scheduledAt", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ emailId: "email-123" }),
      });

      const client = new Resend("test-api-key");
      await client.emails.send({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test",
        scheduledAt: "2024-12-25T00:00:00Z",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Autosend: scheduledAt is not supported and will be ignored"
      );
      consoleSpy.mockRestore();
    });

    it("should handle cc and bcc", async () => {
      let capturedBody: unknown;
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        capturedBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ emailId: "email-123" }),
        });
      });

      const client = new Resend("test-api-key");
      await client.emails.send({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test",
        cc: "cc@example.com",
        bcc: ["bcc1@example.com", "bcc2@example.com"],
      });

      expect(capturedBody).toMatchObject({
        cc: [{ email: "cc@example.com" }],
        bcc: [{ email: "bcc1@example.com" }, { email: "bcc2@example.com" }],
      });
    });

    it("should handle replyTo", async () => {
      let capturedBody: unknown;
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        capturedBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ emailId: "email-123" }),
        });
      });

      const client = new Resend("test-api-key");
      await client.emails.send({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test",
        replyTo: "Reply Person <reply@example.com>",
      });

      expect(capturedBody).toMatchObject({
        replyTo: { name: "Reply Person", email: "reply@example.com" },
      });
    });
  });

  describe("contacts.create", () => {
    it("should create contact and return Resend format with id only", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "contact-123",
            email: "new@example.com",
            firstName: "John",
            lastName: "Doe",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          }),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.create({
        email: "new@example.com",
        firstName: "John",
        lastName: "Doe",
      });

      expect(result).toEqual({
        data: { id: "contact-123" },
        error: null,
      });
    });

    it("should create contact with properties", async () => {
      let capturedBody: unknown;
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        capturedBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              id: "contact-123",
              email: "new@example.com",
              firstName: "John",
              customFields: { company: "Acme", tier: 1 },
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z",
            }),
        });
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.create({
        email: "new@example.com",
        firstName: "John",
        properties: { company: "Acme", tier: 1 },
      });

      expect(capturedBody).toMatchObject({
        email: "new@example.com",
        customFields: { company: "Acme", tier: 1 },
      });
      expect(result.data).toEqual({ id: "contact-123" });
    });

    it("should create contact with listIds", async () => {
      let capturedBody: unknown;
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        capturedBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              id: "contact-123",
              email: "new@example.com",
              firstName: "John",
              listIds: ["list-1", "list-2"],
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z",
            }),
        });
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.create({
        email: "new@example.com",
        firstName: "John",
        listIds: ["list-1", "list-2"],
      });

      expect(capturedBody).toMatchObject({
        email: "new@example.com",
        listIds: ["list-1", "list-2"],
      });
      expect(result.data).toEqual({ id: "contact-123" });
    });

    it("should create contact with audienceId (ignored)", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "contact-123",
            email: "new@example.com",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          }),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.create({
        email: "new@example.com",
        audienceId: "audience-123",
      });

      expect(result.data).toEqual({ id: "contact-123" });
    });
  });

  describe("contacts.get", () => {
    it("should get contact by string ID", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "contact-123",
            email: "test@example.com",
            firstName: "John",
            lastName: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          }),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.get("contact-123");

      expect(result).toEqual({
        data: {
          id: "contact-123",
          email: "test@example.com",
          firstName: "John",
          lastName: null,
          createdAt: "2024-01-01T00:00:00Z",
          unsubscribed: false,
          properties: undefined,
        },
        error: null,
      });
    });

    it("should get contact by object with id", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "contact-123",
            email: "test@example.com",
            firstName: "John",
            lastName: null,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          }),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.get({ id: "contact-123" });

      expect(result.data?.id).toBe("contact-123");
    });

    it("should get contact with properties", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "contact-123",
            email: "test@example.com",
            firstName: "John",
            lastName: null,
            customFields: { company: "Acme", tier: 2 },
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          }),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.get("contact-123");

      expect(result.data?.properties).toEqual({ company: "Acme", tier: 2 });
    });

    it("should get contact with listIds", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "contact-123",
            email: "test@example.com",
            firstName: "John",
            lastName: null,
            listIds: ["list-1", "list-2"],
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          }),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.get("contact-123");

      expect(result.data?.listIds).toEqual(["list-1", "list-2"]);
    });

    it("should return error for email-based lookup", async () => {
      const client = new Resend("test-api-key");
      const result = await client.contacts.get({ email: "test@example.com" });

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe("validation_error");
      expect(result.error?.message).toContain("Email-based lookup is not supported");
    });

    it("should return error for not found contact", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Contact not found"),
      });

      const client = new Resend("test-api-key", { timeout: 1000 });
      const result = await client.contacts.get("nonexistent");

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe("not_found");
    });
  });

  describe("contacts.update", () => {
    it("should update contact by email and return id", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "contact-123",
            email: "updated@example.com",
            firstName: "Jane",
            lastName: "Doe",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z",
          }),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.update({
        email: "updated@example.com",
        firstName: "Jane",
      });

      expect(result.data).toEqual({ id: "contact-123" });
    });

    it("should update contact with properties", async () => {
      let capturedBody: unknown;
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        capturedBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              id: "contact-123",
              email: "user@example.com",
              firstName: "John",
              customFields: { tier: "pro", level: 5 },
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-02T00:00:00Z",
            }),
        });
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.update({
        email: "user@example.com",
        properties: { tier: "pro", level: 5 },
      });

      expect(capturedBody).toMatchObject({
        email: "user@example.com",
        customFields: { tier: "pro", level: 5 },
      });
      expect(result.data).toEqual({ id: "contact-123" });
    });

    it("should update contact with listIds", async () => {
      let capturedBody: unknown;
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        capturedBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              id: "contact-123",
              email: "user@example.com",
              firstName: "John",
              listIds: ["list-1", "list-2"],
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-02T00:00:00Z",
            }),
        });
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.update({
        email: "user@example.com",
        listIds: ["list-1", "list-2"],
      });

      expect(capturedBody).toMatchObject({
        email: "user@example.com",
        listIds: ["list-1", "list-2"],
      });
      expect(result.data).toEqual({ id: "contact-123" });
    });

    it("should return error if email not provided", async () => {
      const client = new Resend("test-api-key");
      const result = await client.contacts.update({
        firstName: "Jane",
      });

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe("validation_error");
      expect(result.error?.message).toBe("Email is required for update");
    });
  });

  describe("contacts.remove", () => {
    it("should remove contact by string ID", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ deleted: true }),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.remove("contact-123");

      expect(result).toEqual({
        data: { deleted: true, contact: "contact-123" },
        error: null,
      });
    });

    it("should remove contact by object with id", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ deleted: true }),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.remove({ id: "contact-123" });

      expect(result.data?.deleted).toBe(true);
      expect(result.data?.contact).toBe("contact-123");
    });

    it("should return error for email-based removal", async () => {
      const client = new Resend("test-api-key");
      const result = await client.contacts.remove({ email: "test@example.com" });

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe("validation_error");
      expect(result.error?.message).toContain("Email-based removal is not supported");
    });
  });

  describe("error handling (with real timers)", () => {
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useFakeTimers();
    });

    it("should return error on delete failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad request"),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.remove("contact-123");

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should handle thrown error in emails.send", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

      const client = new Resend("test-api-key");
      const result = await client.emails.send({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test",
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Network failure");
    });

    it("should handle non-Error thrown object", async () => {
      global.fetch = vi.fn().mockRejectedValue("string error");

      const client = new Resend("test-api-key");
      const result = await client.emails.send({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test",
      });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe("Unknown error");
    });

    it("should handle create error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad request"),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.create({
        email: "test@example.com",
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should handle create thrown error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const client = new Resend("test-api-key");
      const result = await client.contacts.create({
        email: "test@example.com",
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Network error");
    });

    it("should handle get thrown error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const client = new Resend("test-api-key");
      const result = await client.contacts.get("contact-123");

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should handle update error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad request"),
      });

      const client = new Resend("test-api-key");
      const result = await client.contacts.update({
        email: "test@example.com",
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should handle update thrown error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const client = new Resend("test-api-key");
      const result = await client.contacts.update({
        email: "test@example.com",
      });

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should handle remove thrown error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const client = new Resend("test-api-key");
      const result = await client.contacts.remove("contact-123");

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });
});
