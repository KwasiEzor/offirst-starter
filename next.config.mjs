import { withPayload } from '@payloadcms/next/withPayload'
import withPWAInit from '@ducanh2912/next-pwa'
import { runtimeCaching } from './src/lib/pwa/runtime-caching.mjs'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',

  // WatermelonDB requires this to avoid bundling issues
  serverExternalPackages: ['@nozbe/watermelondb'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Strict mode for better React debugging
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Use the explicit `pnpm lint` script instead of Next's deprecated build-time lint path.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable experimental features as needed
  experimental: {
    reactCompiler: false,
  },
}

export default withPWA(withPayload(nextConfig))
