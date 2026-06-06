import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the dev-only double-mount; it races with the MapLibre GL lifecycle
  // (map created → torn down → recreated before 'load' fires reliably).
  reactStrictMode: false,
};

export default nextConfig;
