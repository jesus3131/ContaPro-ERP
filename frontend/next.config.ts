import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api/v1'}/:path*`,
      },
    ]
  },
}

export default nextConfig
