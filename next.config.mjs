/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "*.myshopify.com" },
      { protocol: "https", hostname: "pjvogtsleqosgl0a.public.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    qualities: [75, 85, 90],
    minimumCacheTTL: 2678400, // 31 days: keep optimized images cached at the edge
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
  async redirects() {
    return [
      // The Journal was removed; send old links to the home page
      { source: "/journal", destination: "/home", permanent: true },
      { source: "/journal/:id", destination: "/home", permanent: true },
      // Google indexed the free Vercel address before hhara.com was connected; send it to the real domain.
      // /api is left out so any webhook still pointed at the old address keeps working.
      {
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "hhara-store-headless.vercel.app" }],
        destination: "https://www.hhara.com/:path",
        permanent: true,
      },
      // site.hhara.com is Shopify's store address, so the logo on Shopify checkout links there.
      // Send it to the headless store. Temporary on purpose: once the store moves from /home to "/" at launch,
      // change the first destination to "https://www.hhara.com/" and browsers won't have cached the old one.
      {
        source: "/",
        has: [{ type: "host", value: "site.hhara.com" }],
        destination: "https://www.hhara.com/home",
        permanent: false,
      },
      {
        source: "/:path((?!api/).+)",
        has: [{ type: "host", value: "site.hhara.com" }],
        destination: "https://www.hhara.com/:path",
        permanent: false,
      },
    ];
  },
  experimental: { optimizeCss: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
