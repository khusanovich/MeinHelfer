import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone is required for Docker; Netlify uses its own adapter
  ...(process.env.NETLIFY ? {} : { output: "standalone" }),
};

export default nextConfig;
