import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Press_Start_2P, DotGothic16 } from "next/font/google"; // Import pixel font
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start-2p",
  subsets: ["latin"],
});

const dotGothic16 = DotGothic16({
  weight: "400",
  variable: "--font-dotgothic-16",
  subsets: ["latin"],
});

import AdSenseScript from "@/components/AdSenseScript";

export const metadata: Metadata = {
  metadataBase: new URL('https://pokelix.jp'),
  title: {
    default: 'PokéLix（ポケリス）| ポケカ環境分析・確率シミュレーター',
    template: '%s | PokéLix（ポケリス）',
  },
  description: 'ポケモンカードのデッキシミュレーター。環境デッキ採用率・初手確率・一人回し練習が無料。デッキコードを入力するだけで初手7枚の確率とサイド落ちリスクを即計算（「ポケカ シュミレーター」とも呼ばれます）。',
  keywords: ['ポケカ シミュレーター', 'ポケカ シュミレーター', 'ポケカ デッキシミュレーター', 'ポケカ', 'ポケモンカード', '確率シミュレーター', '初手確率', 'サイド落ち', '一人回し', 'デッキ分析', '環境デッキ', 'ポケカ 確率'],
  authors: [{ name: 'PokéLix' }],
  creator: 'PokéLix',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.pokelix.jp',
    siteName: 'PokéLix（ポケリス）',
    title: 'PokéLix（ポケリス）| ポケカ環境分析・確率シミュレーター',
    description: 'ポケモンカードの環境デッキ採用率・初手確率シミュレーター・一人回し練習が無料で使えるサイト。',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'PokéLix（ポケリス）| ポケカ環境分析・確率シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pokelix_jp',
    title: 'PokéLix（ポケリス）| ポケカ環境分析・確率シミュレーター',
    description: 'ポケモンカードの環境デッキ採用率・初手確率シミュレーター・一人回し練習が無料で使えるサイト。',
    images: ['/api/og'],
  },
  verification: {
    google: 'mp3mL3f3HiJ52h62eZFS1zU4PGNVyJPDpcE_gYU16rM',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="google-site-verification" content="mp3mL3f3HiJ52h62eZFS1zU4PGNVyJPDpcE_gYU16rM" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${dotGothic16.variable} antialiased`}
      >
        <AdSenseScript />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2JW6DYQYSD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-2JW6DYQYSD');
            gtag('config', 'G-P0FYS2RRM2');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
