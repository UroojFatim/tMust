/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/api/inventory/images/**",
      },
      {
        protocol: "https",
        hostname: "tmust.com",
        pathname: "/api/inventory/images/**",
      },
    ],
  },
};

module.exports = nextConfig;
