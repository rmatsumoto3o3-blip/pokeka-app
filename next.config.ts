import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // デッキ写真読み取りで画像base64を送るため、Server Actionの上限を引き上げ（既定1MB）
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ovsqbhtxulnoekugwtxh.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.pokemon-card.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.tcgdex.net',
      },
      {
        protocol: 'https',
        hostname: 'www.unionarena-tcg.com',
      },
      {
        protocol: 'https',
        hostname: 'files.bandai-tcg-plus.com',
      },
    ],
  },
};

export default nextConfig;
