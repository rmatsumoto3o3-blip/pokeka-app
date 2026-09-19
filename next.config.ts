import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // デッキ写真読み取りで画像base64を送るため、Server Actionの上限を引き上げ（既定1MB）
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
  images: {
    // Image Optimizationの変換回数(無料枠5K)超過＋Fluid CPU浪費対策。
    // 変換を無効化＝変換回数0・最適化CPU削減。リモート画像はVercelを経由せず直配信になり転送も減る。
    unoptimized: true,
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
