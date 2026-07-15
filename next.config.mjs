/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {

    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.example.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.shopify.com" }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  typedRoutes: false,
  productionBrowserSourceMaps: true
};

export default nextConfig;
