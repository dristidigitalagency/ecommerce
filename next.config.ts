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
      "dristi-himalayanthread-assets-803991062503-ap-south-1-an.s3.ap-south-1.amazonaws.com"
    ],
    unoptimized: true,
  },
};

export default nextConfig;
