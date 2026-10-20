const { createDefaultPreset } = require("ts-jest");

/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    ...createDefaultPreset({ tsconfig: "./tsconfig.json" }).transform,
  },
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  // Declare the repo's catalog before any test imports a template module — the
  // entry (src/index.ts) does the same, and a template defined without its
  // label / description / tags would fail the definition-time conventions.
  setupFiles: ["<rootDir>/src/catalog.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
