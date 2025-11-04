/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Skip generating static error pages to avoid build issues
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Moved from experimental in Next.js 15
  skipMiddlewareUrlNormalize: true,
  // Skip static generation for error pages
  generateStaticParams: false,
  output: 'standalone',
};

module.exports = nextConfig;
