import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import LandingPage from '@/components/LandingPage'

// アーキタイプ別カード採用率を24時間キャッシュ（GASが毎日8時に更新するだけなので十分）
const getCachedAnalytics = unstable_cache(
  async () => {
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .from('archetype_card_stats')
      .select('*')
      .eq('event_rank', 'ALL')

    const byArchetype: Record<string, any[]> = {}
    if (data) {
      data.forEach(stat => {
        if (!byArchetype[stat.archetype_id]) byArchetype[stat.archetype_id] = []
        byArchetype[stat.archetype_id].push({
          id: stat.card_name,
          card_name: stat.card_name,
          image_url: stat.image_url,
          category: mapCategory(stat.supertype, stat.subtypes),
          adoption_quantity: stat.adoption_count > 0 ? (stat.total_qty / stat.adoption_count).toFixed(1) : '0.0',
          adoption_rate: stat.total_decks > 0 ? ((stat.adoption_count / stat.total_decks) * 100).toFixed(1) : '0.0',
        })
      })
      Object.keys(byArchetype).forEach(id => {
        byArchetype[id].sort((a, b) => Number(b.adoption_rate) - Number(a.adoption_rate))
      })
    }
    return byArchetype
  },
  ['archetype-analytics'],
  { revalidate: 86400 } // 24時間キャッシュ
)

function mapCategory(supertype: string, subtypes?: string[]): string {
  if (supertype === 'Pokémon') return 'Pokemon'
  if (supertype === 'Energy') return 'Energy'
  const sub = subtypes?.[0] || ''
  if (sub === 'Supporter') return 'Supporter'
  if (sub === 'Stadium') return 'Stadium'
  if (sub === 'Pokémon Tool') return 'Tool'
  return 'Goods'
}

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
  // 記事・アーキタイプは60秒ISR、採用率データは24時間キャッシュで並列取得
  const [
    { data: archetypes },
    { data: articles },
    analyticsData,
  ] = await Promise.all([
    supabase.from('deck_archetypes').select('*').order('display_order', { ascending: true }).order('name', { ascending: true }),
    supabase.from('articles').select('*').eq('is_published', true).order('published_at', { ascending: false, nullsFirst: false }).limit(5),
    getCachedAnalytics(),
  ])
  const decks: any[] = []

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'このサイトはどのようなサービスですか？', acceptedAnswer: { '@type': 'Answer', text: 'スマホやPCのブラウザから、無料でポケモンカードのデッキ構築や検証ができる「ポケカ デッキシミュレーター」ツールです。' } },
      { '@type': 'Question', name: 'スマホでも使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、スマートフォン・タブレット・PCすべてのブラウザに対応しています。アプリのインストールは不要です。' } },
      { '@type': 'Question', name: 'ログイン（アカウント登録）をしないと使えませんか？', acceptedAnswer: { '@type': 'Answer', text: 'いいえ、ログインなしでも基本的なシミュレーター機能はどなたでも自由にご利用いただけます。' } },
      { '@type': 'Question', name: 'アカウント登録（ログイン）をすると何ができますか？', acceptedAnswer: { '@type': 'Answer', text: 'ログインしていただくことで、自分だけの専用ダッシュボードが使えるようになり、作成したデッキの保存やお気に入り登録、より詳細な分析機能などが解放されます。' } },
      { '@type': 'Question', name: '作成したデッキを使って一人で練習することはできますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、当サイトには「ひとり回し」機能を搭載しています。対戦相手がいないときでも、デッキの動かし方や初手の確率、コンボのつながりなどを検証・練習していただけます。' } },
      { '@type': 'Question', name: '収録されているカードのデータや採用率は確認できますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい、最新のカードデータに対応しており、各デッキにおけるカード採用率などもチェックしながらデッキビルドを進めることが可能です。' } },
      { '@type': 'Question', name: '確率計算はどのくらい正確ですか？', acceptedAnswer: { '@type': 'Answer', text: 'モンテカルロ法による10万回シミュレーションを採用しており、±0.1%以内の高精度で計算しています。' } },
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LandingPage
        decks={decks || []}
        archetypes={archetypes || []}
        articles={articles || []}
        analyticsData={analyticsData}
      />
    </>
  )
}
