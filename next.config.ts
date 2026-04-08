import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker/AWS deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
