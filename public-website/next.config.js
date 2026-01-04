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
  // Allow external images from yaraspace.cz
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yaraspace.cz',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig

