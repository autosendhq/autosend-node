// @react-email/render is an OPTIONAL peer dependency, imported lazily so that
// consumers who never pass a `react` field pull in zero React code. A plain
// string-literal specifier lets bundlers (webpack, Vite, etc.) handle the
// dynamic import without any extra configuration, and Node caches the module —
// this mirrors how the `resend` SDK loads it, so it works as a drop-in.

/**
 * Render a React element to an HTML string using `@react-email/render`.
 *
 * The module is imported lazily; if it is not installed a clear, actionable
 * error is thrown.
 */
export async function renderReact(react: unknown): Promise<string> {
  let render: (element: unknown, options?: unknown) => string | Promise<string>;

  try {
    // @ts-ignore -- optional peer dependency; may be absent at build time and is
    // resolved at runtime only when the `react` field is actually used.
    ({ render } = await import("@react-email/render"));
  } catch {
    throw new Error(
      "Failed to render React component. Make sure to install `@react-email/render` or `@react-email/components`."
    );
  }

  return render(react);
}
