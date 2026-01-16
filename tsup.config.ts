import { defineConfig } from "tsup";

export default defineConfig([
  // CJS build
  {
    entry: ["src/index.ts", "src/adapters/resend/index.ts"],
    format: ["cjs"],
    dts: true,
    clean: true,
    outDir: "dist/cjs",
  },
  // ESM build
  {
    entry: ["src/index.ts", "src/adapters/resend/index.ts"],
    format: ["esm"],
    dts: true,
    outDir: "dist/esm",
  },
]);
