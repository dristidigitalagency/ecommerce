import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
    domains: [
      "images.unsplash.com",
      "media.columbia.com",
      "encrypted-tbn0.gstatic.com",
      "communityclothing.co.uk",
    ],
  },
};

export default nextConfig;
