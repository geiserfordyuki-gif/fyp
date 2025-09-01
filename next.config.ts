import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Allow production builds even if ESLint errors are present
    ignoreDuringBuilds: true,
  },
}

export default nextConfig