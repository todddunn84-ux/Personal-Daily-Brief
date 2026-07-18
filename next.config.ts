import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker/AWS deployment
  eslint: {
    // Lint runs via `npm run lint` and CI — never as part of the deploy build,
    // so a lint error can't turn into a failed production deploy.
    ignoreDuringBuilds: true,
  },
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
