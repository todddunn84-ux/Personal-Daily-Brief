import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Standalone output is only for the Docker/AWS path (see Dockerfile, which
  // sets DOCKER_BUILD=1). Vercel manages its own output format.
  ...(process.env.DOCKER_BUILD ? { output: 'standalone' as const } : {}),
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
