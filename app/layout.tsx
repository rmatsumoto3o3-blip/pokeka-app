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

export const metadata: Metadata = {
  title: "PokéLix（ポケリス）| ポケカ環境分析・初手確率シミュレーター",
  description: "ポケモンカードの環境考察、デッキ分析、初手確率シミュレーター（PTCGL対応）。データに基づいたポケカ戦略をサポートする次世代の分析プラットフォームです。",
  metadataBase: new URL('https://pokelix.jp'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${dotGothic16.variable} antialiased`}
      >
        {/* Google AdSense (Verification) */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2951381820280282"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

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
