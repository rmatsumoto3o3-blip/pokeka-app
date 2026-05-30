import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '初手確率シミュレーター',
  description: 'ポケカの初手確率を無料でシミュレーション。デッキコードを入力するだけで、初手7枚に欲しいカードが来る確率・サイド落ちリスクをモンテカルロ法（10万回試行）で即計算。',
  keywords: ['ポケカ 確率シミュレーター', '初手確率', 'ポケモンカード 確率', 'サイド落ち 確率', 'デッキコード 確率', 'ポケカ シミュレーター', 'ポケカ 初動'],
  openGraph: {
    title: '初手確率シミュレーター | PokéLix（ポケリス）',
    description: 'デッキコードを入力するだけで初手7枚の確率・サイド落ちリスクを即計算。モンテカルロ法で10万回シミュレーション。',
    url: 'https://www.pokelix.jp/simulator',
    siteName: 'PokéLix（ポケリス）',
    locale: 'ja_JP',
    type: 'website',
    images: [{ url: '/api/og?title=初手確率シミュレーター&desc=デッキコードを入力するだけで初手確率・サイド落ちリスクを即計算', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '初手確率シミュレーター | PokéLix（ポケリス）',
    description: 'デッキコードを入力するだけで初手7枚の確率・サイド落ちリスクを即計算。',
    images: ['/api/og?title=初手確率シミュレーター&desc=デッキコードを入力するだけで初手確率・サイド落ちリスクを即計算'],
  },
  alternates: {
    canonical: 'https://pokelix.jp/simulator',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ポケカ初手確率シミュレーター | PokéLix',
  url: 'https://pokelix.jp/simulator',
  description: 'ポケモンカードの初手確率・サイド落ちリスクをモンテカルロ法で計算する無料シミュレーター。デッキコードを入力するだけで即計算。',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  inLanguage: 'ja',
  keywords: 'ポケカ,確率シミュレーター,初手確率,サイド落ち,ポケモンカード',
}

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
