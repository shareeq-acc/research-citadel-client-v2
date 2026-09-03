import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle under .next/standalone, with only the
  // node_modules actually reached at runtime traced into it. Without this the
  // container image has to carry the full dependency tree — a few hundred MB
  // of build-time tooling that never runs in production.
  output: "standalone",
};

export default nextConfig;
