/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {

    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.example.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.shopify.com" }
    ]
  },
  typedRoutes: false
};

export default nextConfig;
