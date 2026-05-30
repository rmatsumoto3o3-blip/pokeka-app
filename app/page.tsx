import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import LandingPage from '@/components/LandingPage'

export const metadata: Metadata = {
  title: 'PokéLix（ポケリス）| ポケカ環境分析・初手確率シミュレーター',
  description: 'ポケモンカードの環境デッキ採用率・初手確率シミュレーター・一人回し練習が無料で使えるサイト。デッキコードを入力するだけで初手7枚の確率、サイド落ちリスクをモンテカルロ法で即計算。',
  keywords: ['ポケカ', 'ポケモンカード', '確率シミュレーター', '初手確率', 'サイド落ち', '一人回し', 'デッキ分析', '環境デッキ', 'ポケリス'],
  openGraph: {
    title: 'PokéLix（ポケリス）| ポケカ環境分析・初手確率シミュレーター',
    description: 'ポケモンカードの環境デッキ採用率・初手確率シミュレーター・一人回し練習が無料で使えるサイト。',
    url: 'https://pokelix.jp',
    siteName: 'PokéLix（ポケリス）',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PokéLix（ポケリス）| ポケカ環境分析・初手確率シミュレーター',
    description: 'ポケモンカードの環境デッキ採用率・初手確率シミュレーター・一人回し練習が無料で使えるサイト。',
  },
  alternates: {
    canonical: 'https://pokelix.jp',
  },
}

// Incremental Static Regeneration (ISR)
// Revalidate this page content at most once every 60 seconds
export const revalidate = 60

export default async function Home() {
  const supabase = await createClient()
  // Fetch data concurrently for better performance
  const [
    { data: archetypes },
    { data: articles }
  ] = await Promise.all([
    supabase.from('deck_archetypes').select('*').order('display_order', { ascending: true }).order('name', { ascending: true }),
    supabase.from('articles').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(5)
  ])
  const decks: any[] = []

  return (
    <LandingPage
      decks={decks || []}
      archetypes={archetypes || []}
      articles={articles || []}
    />
  )
}
