import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@/types": path.resolve(import.meta.dirname, "lib/types"),
    },
  },
});
