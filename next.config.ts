import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow fetching from ffzstore API
  env: {
    FFZSTORE_BASE_URL: process.env.FFZSTORE_BASE_URL ?? "https://api.ffzstore.com",
  },
};

export default nextConfig;
