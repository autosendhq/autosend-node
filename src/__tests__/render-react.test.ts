import { describe, it, expect, vi } from "vitest";
import { renderReact } from "../core/render-react.js";
import { Autosend } from "../core/client.js";

// Force the lazy import to fail so the test is deterministic regardless of whether
// @react-email/render happens to be installed/hoisted in the tree. The success
// path (render -> html) is covered in react-support.test.ts via a working mock.
vi.mock("@react-email/render", () => {
  throw new Error("Cannot find module '@react-email/render'");
});

describe("renderReact", () => {
  it("throws a clear error when @react-email/render cannot be loaded", async () => {
    await expect(renderReact({ any: true })).rejects.toThrow(
      "Failed to render React component. Make sure to install `@react-email/render` or `@react-email/components`."
    );
  });
});

describe("native client when react rendering fails", () => {
  const fakeElement = { $$typeof: "react.element" };

  it("emails.send returns { success: false } instead of throwing", async () => {
    const client = new Autosend("test-api-key");
    const result = await client.emails.send({
      from: { email: "a@example.com" },
      to: { email: "b@example.com" },
      subject: "Test",
      react: fakeElement,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to render React component");
  });

  it("emails.bulk returns { success: false } instead of throwing", async () => {
    const client = new Autosend("test-api-key");
    const result = await client.emails.bulk({
      from: { email: "a@example.com" },
      subject: "Test",
      react: fakeElement,
      recipients: [{ email: "1@example.com" }],
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to render React component");
  });
});
