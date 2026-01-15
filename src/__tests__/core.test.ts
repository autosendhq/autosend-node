import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Autosend } from "../core/client.js";

describe("Autosend", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should create client with API key", () => {
      const client = new Autosend("test-api-key");
      expect(client).toBeDefined();
      expect(client.emails).toBeDefined();
      expect(client.contacts).toBeDefined();
    });

    it("should accept optional configuration", () => {
      const client = new Autosend("test-api-key", {
        baseUrl: "https://custom.api.com",
        timeout: 5000,
        debug: true,
      });
      expect(client).toBeDefined();
    });
  });

  describe("emails.send", () => {
    it("should send email successfully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ emailId: "email-123" }),
      });

      const client = new Autosend("test-api-key");
      const result = await client.emails.send({
        from: { email: "sender@example.com" },
        to: { email: "recipient@example.com" },
        subject: "Test Email",
        html: "<p>Hello</p>",
      });

      expect(result).toEqual({
        success: true,
        data: { emailId: "email-123" },
      });
    });

    it("should handle send error", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ message: "Invalid email address" })),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.emails.send({
        from: { email: "invalid" },
        to: { email: "recipient@example.com" },
        subject: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid email address");
    });
  });

  describe("emails.bulk", () => {
    it("should send bulk emails successfully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ emailIds: ["email-1", "email-2"] }),
      });

      const client = new Autosend("test-api-key");
      const result = await client.emails.bulk({
        emails: [
          {
            from: { email: "sender@example.com" },
            to: { email: "recipient1@example.com" },
            subject: "Test 1",
          },
          {
            from: { email: "sender@example.com" },
            to: { email: "recipient2@example.com" },
            subject: "Test 2",
          },
        ],
      });

      expect(result).toEqual({
        success: true,
        data: { emailIds: ["email-1", "email-2"] },
      });
    });
  });

  describe("contacts.create", () => {
    it("should create contact successfully", async () => {
      const mockContact = {
        id: "contact-123",
        email: "new@example.com",
        firstName: "John",
        lastName: "Doe",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockContact),
      });

      const client = new Autosend("test-api-key");
      const result = await client.contacts.create({
        email: "new@example.com",
        firstName: "John",
        lastName: "Doe",
      });

      expect(result).toEqual({
        success: true,
        data: mockContact,
      });
    });
  });

  describe("contacts.get", () => {
    it("should get contact successfully", async () => {
      const mockContact = {
        id: "contact-123",
        email: "test@example.com",
        firstName: "John",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockContact),
      });

      const client = new Autosend("test-api-key");
      const result = await client.contacts.get("contact-123");

      expect(result).toEqual({
        success: true,
        data: mockContact,
      });
    });

    it("should handle contact not found", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Contact not found"),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.contacts.get("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Contact not found");
    });
  });

  describe("contacts.delete", () => {
    it("should delete contact successfully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ deleted: true }),
      });

      const client = new Autosend("test-api-key");
      const result = await client.contacts.delete("contact-123");

      expect(result).toEqual({ success: true });
    });
  });

  describe("contacts.upsert", () => {
    it("should upsert contact successfully", async () => {
      const mockContact = {
        id: "contact-123",
        email: "test@example.com",
        firstName: "Updated",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockContact),
      });

      const client = new Autosend("test-api-key");
      const result = await client.contacts.upsert({
        email: "test@example.com",
        firstName: "Updated",
      });

      expect(result).toEqual({
        success: true,
        data: mockContact,
      });
    });

    it("should handle upsert failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Invalid data"),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.contacts.upsert({
        email: "invalid",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("emails.bulk error handling", () => {
    it("should handle bulk send failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Invalid data"),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.emails.bulk({
        emails: [],
      });

      expect(result.success).toBe(false);
    });
  });

  describe("contacts.create error handling", () => {
    it("should handle create failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Invalid email"),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.contacts.create({
        email: "invalid",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("contacts.delete error handling", () => {
    it("should handle delete failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not found"),
      });

      const client = new Autosend("test-api-key", { maxRetries: 1 });
      const result = await client.contacts.delete("nonexistent");

      expect(result.success).toBe(false);
    });
  });
});
