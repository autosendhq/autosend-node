import { describe, it, expect } from "vitest";
import { renderReact } from "../core/render-react.js";

// No mock here: @react-email/render is not installed in this package, so the
// lazy import genuinely fails and should surface the actionable install error.
// The success path (render -> html) is covered in react-support.test.ts via a
// mocked @react-email/render.
describe("renderReact", () => {
  it("throws a clear error when @react-email/render is not installed", async () => {
    await expect(renderReact({ any: true })).rejects.toThrow(
      "Failed to render React component. Make sure to install `@react-email/render` or `@react-email/components`."
    );
  });
});
