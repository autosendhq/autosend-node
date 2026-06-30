import { describe, it, expect, vi, afterEach } from "vitest";

// Mock the optional peer so these tests need no React/react-dom installed.
// The render mock returns a deterministic HTML string we can assert on.
const renderMock = vi.fn(() => "<p>rendered-html</p>");
vi.mock("@react-email/render", () => ({ render: renderMock }));

import { Autosend } from "../core/client.js";
import { Resend } from "../adapters/resend/index.js";

function captureFetchBody() {
  let body: any;
  global.fetch = vi.fn().mockImplementation((_url, options) => {
    body = JSON.parse(options.body);
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ emailId: "email-123" }),
    });
  });
  return () => body;
}

describe("react: support", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    renderMock.mockClear();
  });

  // A stand-in for a React element; the mocked render ignores its shape.
  const fakeElement = { $$typeof: "react.element", type: "Email" };

  describe("native client", () => {
    it("renders `react` to `html` on emails.send and strips `react`", async () => {
      const getBody = captureFetchBody();
      const client = new Autosend("test-api-key");

      await client.emails.send({
        from: { email: "a@example.com" },
        to: { email: "b@example.com" },
        subject: "Test",
        react: fakeElement,
      });

      expect(renderMock).toHaveBeenCalledTimes(1);
      expect(getBody().html).toBe("<p>rendered-html</p>");
      expect(getBody().react).toBeUndefined();
    });

    it("renders `react` once on emails.bulk", async () => {
      const getBody = captureFetchBody();
      const client = new Autosend("test-api-key");

      await client.emails.bulk({
        from: { email: "a@example.com" },
        subject: "Test",
        react: fakeElement,
        recipients: [{ email: "1@example.com" }, { email: "2@example.com" }],
      });

      expect(renderMock).toHaveBeenCalledTimes(1);
      expect(getBody().html).toBe("<p>rendered-html</p>");
      expect(getBody().react).toBeUndefined();
    });

    it("prefers an explicit `html` over `react`", async () => {
      const getBody = captureFetchBody();
      const client = new Autosend("test-api-key");

      await client.emails.send({
        from: { email: "a@example.com" },
        to: { email: "b@example.com" },
        subject: "Test",
        html: "<p>explicit</p>",
        react: fakeElement,
      });

      expect(renderMock).not.toHaveBeenCalled();
      expect(getBody().html).toBe("<p>explicit</p>");
    });
  });

  describe("resend adapter", () => {
    it("renders `react` to `html` on a single send", async () => {
      const getBody = captureFetchBody();
      const client = new Resend("test-api-key");

      await client.emails.send({
        from: "a@example.com",
        to: "b@example.com",
        subject: "Test",
        react: fakeElement,
      });

      expect(renderMock).toHaveBeenCalledTimes(1);
      expect(getBody().html).toBe("<p>rendered-html</p>");
    });

    it("renders `react` once when routed to bulk (to is an array)", async () => {
      const getBody = captureFetchBody();
      const client = new Resend("test-api-key");

      await client.emails.send({
        from: "a@example.com",
        to: ["1@example.com", "2@example.com"],
        subject: "Test",
        react: fakeElement,
      });

      expect(renderMock).toHaveBeenCalledTimes(1);
      expect(getBody().html).toBe("<p>rendered-html</p>");
    });
  });
});
