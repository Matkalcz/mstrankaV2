/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Removed for testing
  images: {
    unoptimized: true
  },
  // Disable problematic experimental features
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig