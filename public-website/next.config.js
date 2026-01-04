/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    BOOKING_API_URL: process.env.BOOKING_API_URL || 'http://localhost:4110',
  },
  // Skip static generation for dynamic routes
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig

