import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Global Deck Simulator (PTCGL)',
  description: 'Analyze your Pokémon TCG deck\'s opening hand probability and prize card risk using PTCGL export format. Free simulator supporting English card names with Monte Carlo simulation (100,000 trials).',
  keywords: ['pokemon tcg simulator', 'ptcgl deck simulator', 'opening hand probability', 'prize card risk', 'pokemon card probability', 'deck analysis', 'ポケカ 英語 シミュレーター'],
  openGraph: {
    title: 'Global Deck Simulator (PTCGL) | PokéLix',
    description: 'Analyze your Pokémon TCG deck\'s opening hand probability and prize card risk. Free PTCGL format simulator.',
    url: 'https://pokelix.jp/global-simulator',
    siteName: 'PokéLix（ポケリス）',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Deck Simulator (PTCGL) | PokéLix',
    description: 'Analyze your Pokémon TCG deck\'s opening hand probability and prize card risk. Free PTCGL format simulator.',
  },
  alternates: {
    canonical: 'https://pokelix.jp/global-simulator',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Pokémon TCG Global Deck Simulator | PokéLix',
  url: 'https://pokelix.jp/global-simulator',
  description: 'Free Pokémon TCG opening hand probability and prize card risk simulator. Paste your PTCGL deck list and get instant Monte Carlo analysis.',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  inLanguage: 'en',
  keywords: 'pokemon tcg,deck simulator,opening hand probability,prize card,PTCGL',
}

export default function GlobalSimulatorLayout({ children }: { children: React.ReactNode }) {
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
