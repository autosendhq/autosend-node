import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpClient } from "../http/client.js";

describe("HttpClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  it("should create client with default options", () => {
    const client = new HttpClient({ apiKey: "test-key" });
    expect(client).toBeDefined();
  });

  it("should make successful GET request", async () => {
    const mockResponse = { id: "123", email: "test@example.com" };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const client = new HttpClient({ apiKey: "test-key" });
    const result = await client.get("/contacts/123");

    expect(result).toEqual({
      success: true,
      data: mockResponse,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.autosend.com/contacts/123",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("should make successful POST request with body", async () => {
    const mockResponse = { emailId: "email-123" };
    const requestBody = {
      from: { email: "sender@example.com" },
      to: { email: "recipient@example.com" },
      subject: "Test",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const client = new HttpClient({ apiKey: "test-key" });
    const result = await client.post("/mails/send", requestBody);

    expect(result).toEqual({
      success: true,
      data: mockResponse,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.autosend.com/mails/send",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(requestBody),
      })
    );
  });

  it("should make successful DELETE request", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ deleted: true }),
    });

    const client = new HttpClient({ apiKey: "test-key" });
    const result = await client.delete("/contacts/123");

    expect(result).toEqual({
      success: true,
      data: { deleted: true },
    });
  });

  it("should handle HTTP error response with JSON error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({ message: "Invalid email" })),
    });

    const client = new HttpClient({ apiKey: "test-key", maxRetries: 1 });
    const result = await client.post("/mails/send", {});

    expect(result).toEqual({
      success: false,
      error: "Invalid email",
      statusCode: 400,
    });
  });

  it("should handle HTTP error response with plain text error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });

    const client = new HttpClient({ apiKey: "test-key", maxRetries: 1 });
    const result = await client.get("/contacts");

    expect(result).toEqual({
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    });
  });

  it("should use custom base URL", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const client = new HttpClient({
      apiKey: "test-key",
      baseUrl: "https://custom.api.com",
    });
    await client.get("/test");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://custom.api.com/test",
      expect.anything()
    );
  });

  it("should handle network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const client = new HttpClient({ apiKey: "test-key", maxRetries: 1 });
    const result = await client.get("/test");

    expect(result).toEqual({
      success: false,
      error: "Network error",
      statusCode: 0,
    });
  });

  it("should retry on 429 status", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          text: () => Promise.resolve("Rate limited"),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: "123" }),
      });
    });

    const client = new HttpClient({ apiKey: "test-key", maxRetries: 2 });
    const resultPromise = client.get("/test");

    // Advance timers for retry delay
    await vi.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;

    expect(callCount).toBe(2);
    expect(result.success).toBe(true);
  });

  it("should retry on 500 status", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Server error"),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: "123" }),
      });
    });

    const client = new HttpClient({ apiKey: "test-key", maxRetries: 2 });
    const resultPromise = client.get("/test");

    await vi.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;

    expect(callCount).toBe(2);
    expect(result.success).toBe(true);
  });

  it("should not retry on 400 status", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad request"),
      });
    });

    const client = new HttpClient({ apiKey: "test-key", maxRetries: 3 });
    const result = await client.get("/test");

    expect(callCount).toBe(1);
    expect(result.success).toBe(false);
  });

  it("should log requests in debug mode", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    const client = new HttpClient({ apiKey: "test-key", debug: true });
    await client.get("/test");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should handle empty error response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve(""),
    });

    const client = new HttpClient({ apiKey: "test-key", maxRetries: 1 });
    const result = await client.get("/test");

    expect(result).toEqual({
      success: false,
      error: "HTTP 500",
      statusCode: 500,
    });
  });
});
