import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Plain Node environment — no DOM needed for an API.
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
