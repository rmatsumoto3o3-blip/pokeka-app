import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ポケカ一人回し練習',
  description: 'ポケモンカードの一人回し・デッキ練習が無料でできるシミュレーター。デッキコードを入力してドロー・バトル展開を再現。初手事故率や展開の安定性を実戦形式で確認しよう。',
  keywords: ['ポケカ 一人回し', 'ポケモンカード 練習', 'デッキ 一人回し', 'ポケカ 事前練習', 'ポケカ シミュレーター', 'ポケモンカード ソリティア', 'ポケカ 一人練習'],
  openGraph: {
    title: 'ポケカ一人回し練習 | PokéLix（ポケリス）',
    description: 'ポケモンカードの一人回し・デッキ練習が無料でできるシミュレーター。初手事故率や展開の安定性を実戦形式で確認。',
    url: 'https://pokelix.jp/practice',
    siteName: 'PokéLix（ポケリス）',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ポケカ一人回し練習 | PokéLix（ポケリス）',
    description: 'ポケモンカードの一人回し・デッキ練習が無料でできるシミュレーター。',
  },
  alternates: {
    canonical: 'https://pokelix.jp/practice',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ポケカ一人回し練習シミュレーター | PokéLix',
  url: 'https://pokelix.jp/practice',
  description: 'ポケモンカードの一人回し・デッキ練習が無料でできるシミュレーター。デッキコードを入力してドロー・バトル展開を実戦形式で再現。',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  inLanguage: 'ja',
  keywords: 'ポケカ 一人回し,ポケモンカード 練習,デッキシミュレーター',
}

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
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
