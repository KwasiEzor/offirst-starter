import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // Enable experimental features as needed
  experimental: {
    reactCompiler: false,
  },
}

export default withPayload(nextConfig)
