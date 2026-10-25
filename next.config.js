/** @type {import('next').NextConfig} */
const nextConfig = {
  // CHANGED: serve modern formats + cache optimized images for a year
  // ("Improve image delivery" / "Serve images in next-gen formats").
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/api/inventory/images/**",
      },
      {
        protocol: "https",
        hostname: "tmustt.com",
        pathname: "/api/inventory/images/**",
      },
    ],
  },

  // CHANGED: long-lived caching for static /public media
  // ("Use efficient cache lifetimes"). Files here are swapped only on deploy;
  // if you ever reuse a filename for new content, bump the path or query string.
  async headers() {
    return [
      {
        source:
          "/:path*.(mp4|webm|mov|png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=604800",
          },
        ],
      },
      // CHANGED: baseline security headers (HSTS / COOP / clickjacking / MIME)
      // for the "Trust and Safety" best-practices audits. Kept CSP out because a
      // strict policy needs per-project allow-listing of Stripe + inline JSON-LD.
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
