import { describe, it, expect } from "vitest";
import {
  parseEmailAddress,
  parseEmailAddresses,
  toAutosendRequest,
  toResendResponse,
  mapHttpStatusToResendError,
} from "../adapters/resend/transforms.js";

describe("parseEmailAddress", () => {
  it("should parse email with name in angle brackets", () => {
    const result = parseEmailAddress("John Doe <john@example.com>");
    expect(result).toEqual({ name: "John Doe", email: "john@example.com" });
  });

  it("should parse plain email address", () => {
    const result = parseEmailAddress("john@example.com");
    expect(result).toEqual({ email: "john@example.com" });
  });

  it("should trim whitespace from email", () => {
    const result = parseEmailAddress("  john@example.com  ");
    expect(result).toEqual({ email: "john@example.com" });
  });

  it("should handle name with special characters", () => {
    const result = parseEmailAddress("John O'Brien <john@example.com>");
    expect(result).toEqual({ name: "John O'Brien", email: "john@example.com" });
  });

  it("should handle company-style names", () => {
    const result = parseEmailAddress("Acme Inc. <noreply@acme.com>");
    expect(result).toEqual({ name: "Acme Inc.", email: "noreply@acme.com" });
  });
});

describe("parseEmailAddresses", () => {
  it("should parse a single email string", () => {
    const result = parseEmailAddresses("john@example.com");
    expect(result).toEqual([{ email: "john@example.com" }]);
  });

  it("should parse an array of emails", () => {
    const result = parseEmailAddresses([
      "john@example.com",
      "Jane Doe <jane@example.com>",
    ]);
    expect(result).toEqual([
      { email: "john@example.com" },
      { name: "Jane Doe", email: "jane@example.com" },
    ]);
  });

  it("should handle empty array", () => {
    const result = parseEmailAddresses([]);
    expect(result).toEqual([]);
  });
});

describe("toAutosendRequest", () => {
  it("should transform basic Resend request to Autosend format", () => {
    const result = toAutosendRequest({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
    });

    expect(result).toEqual({
      from: { email: "sender@example.com" },
      to: { email: "recipient@example.com" },
      subject: "Test Subject",
      html: "<p>Hello</p>",
    });
  });

  it("should transform request with name in from address", () => {
    const result = toAutosendRequest({
      from: "Sender Name <sender@example.com>",
      to: "recipient@example.com",
      subject: "Test",
    });

    expect(result.from).toEqual({
      name: "Sender Name",
      email: "sender@example.com",
    });
  });

  it("should transform request with multiple recipients", () => {
    const result = toAutosendRequest({
      from: "sender@example.com",
      to: ["one@example.com", "two@example.com"],
      subject: "Test",
    });

    expect(result.to).toEqual([
      { email: "one@example.com" },
      { email: "two@example.com" },
    ]);
  });

  it("should include text content when provided", () => {
    const result = toAutosendRequest({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test",
      text: "Plain text content",
    });

    expect(result.text).toBe("Plain text content");
  });

  it("should transform cc addresses", () => {
    const result = toAutosendRequest({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test",
      cc: ["cc1@example.com", "cc2@example.com"],
    });

    expect(result.cc).toEqual([
      { email: "cc1@example.com" },
      { email: "cc2@example.com" },
    ]);
  });

  it("should transform bcc addresses", () => {
    const result = toAutosendRequest({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test",
      bcc: "bcc@example.com",
    });

    expect(result.bcc).toEqual([{ email: "bcc@example.com" }]);
  });

  it("should transform replyTo address", () => {
    const result = toAutosendRequest({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test",
      replyTo: "reply@example.com",
    });

    expect(result.replyTo).toEqual({ email: "reply@example.com" });
  });

  it("should handle single recipient as array with one element", () => {
    const result = toAutosendRequest({
      from: "sender@example.com",
      to: ["single@example.com"],
      subject: "Test",
    });

    expect(result.to).toEqual({ email: "single@example.com" });
  });

  it("should transform variables to dynamicData", () => {
    const result = toAutosendRequest({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test",
      html: "<p>Hello {{name}}</p>",
      variables: { name: "John", orderTotal: 99.99 },
    });

    expect(result.dynamicData).toEqual({ name: "John", orderTotal: 99.99 });
  });

  it("should not include dynamicData when variables not provided", () => {
    const result = toAutosendRequest({
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test",
    });

    expect(result.dynamicData).toBeUndefined();
  });
});

describe("toResendResponse", () => {
  it("should transform successful Autosend response", () => {
    const result = toResendResponse({
      success: true,
      data: { emailId: "email-123" },
    });

    expect(result).toEqual({
      data: { id: "email-123" },
      error: null,
    });
  });

  it("should transform failed Autosend response", () => {
    const result = toResendResponse({
      success: false,
      error: "Invalid email address",
    });

    expect(result).toEqual({
      data: null,
      error: {
        message: "Invalid email address",
        name: "api_error",
      },
    });
  });

  it("should handle missing error message", () => {
    const result = toResendResponse({
      success: false,
    });

    expect(result).toEqual({
      data: null,
      error: {
        message: "Unknown error",
        name: "api_error",
      },
    });
  });
});

describe("mapHttpStatusToResendError", () => {
  it("should map 400 to validation_error", () => {
    const result = mapHttpStatusToResendError(400, "Bad request");
    expect(result).toEqual({
      name: "validation_error",
      message: "Bad request",
      statusCode: 400,
    });
  });

  it("should map 401 to missing_api_key", () => {
    const result = mapHttpStatusToResendError(401, "Unauthorized");
    expect(result).toEqual({
      name: "missing_api_key",
      message: "Unauthorized",
      statusCode: 401,
    });
  });

  it("should map 403 to invalid_api_key", () => {
    const result = mapHttpStatusToResendError(403, "Forbidden");
    expect(result).toEqual({
      name: "invalid_api_key",
      message: "Forbidden",
      statusCode: 403,
    });
  });

  it("should map 404 to not_found", () => {
    const result = mapHttpStatusToResendError(404, "Not found");
    expect(result).toEqual({
      name: "not_found",
      message: "Not found",
      statusCode: 404,
    });
  });

  it("should map 422 to validation_error", () => {
    const result = mapHttpStatusToResendError(422, "Unprocessable entity");
    expect(result).toEqual({
      name: "validation_error",
      message: "Unprocessable entity",
      statusCode: 422,
    });
  });

  it("should map 429 to rate_limit_exceeded", () => {
    const result = mapHttpStatusToResendError(429, "Too many requests");
    expect(result).toEqual({
      name: "rate_limit_exceeded",
      message: "Too many requests",
      statusCode: 429,
    });
  });

  it("should map 500 to internal_server_error", () => {
    const result = mapHttpStatusToResendError(500, "Server error");
    expect(result).toEqual({
      name: "internal_server_error",
      message: "Server error",
      statusCode: 500,
    });
  });

  it("should map unknown status to application_error", () => {
    const result = mapHttpStatusToResendError(418, "I'm a teapot");
    expect(result).toEqual({
      name: "application_error",
      message: "I'm a teapot",
      statusCode: 418,
    });
  });
});
