import type { NextConfig } from "next";

const config: NextConfig = {
  // Mastra + pg must run as plain Node modules, not bundled.
  serverExternalPackages: ["@mastra/core", "@mastra/memory", "@mastra/pg", "pg"],
};

export default config;
