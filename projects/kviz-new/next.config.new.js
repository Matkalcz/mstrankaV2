/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Removed for testing
  images: {
    unoptimized: true
  },
  // Ensure static files are served correctly
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Static file handling
  experimental: {
    // Enable better static file serving
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig