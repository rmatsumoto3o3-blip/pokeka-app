import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import LandingPage from '@/components/LandingPage'
import { getFeaturedCardsWithStatsAction, getDeckDataAction } from '@/app/actions'
import { byEventDateDesc, eventDateSortKey } from '@/lib/eventDate'
import { loadMergedPokemonEnvDecks } from '@/lib/pokemonEnvDecks'
import { loadEventsDB, loadDeckIndex, loadArchetypeMapDB } from '@/lib/cityStore'
import { resolveArchetypeFromRep } from '@/lib/city'

// 環境デッキ（Firebase・トップ最上部用）。Supabaseを使わずに常時表示。
type EnvDeckTop = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }
// 既存の環境デッキ（Firebase/pokemon）＋ シティリーグ（Supabase由来）を合体して取得。
async function getEnvDecksForTop(): Promise<EnvDeckTop[]> {
  return loadMergedPokemonEnvDecks()
}

// 使用率ランキング：環境デッキ（今の大会＝environmentDecks）から集計。
// 上の環境デッキ一覧と数字が一致する。deckArchive(履歴)は読まない＝軽い。
type UsageRow = { archetype: string; total: number; win: number }
function buildUsageRanking(decks: EnvDeckTop[]): UsageRow[] {
  const map = new Map<string, { total: number; win: number }>()
  for (const d of decks) {
    const a = (d.archetype || '').trim()
    if (!a) continue
    const cur = map.get(a) || { total: 0, win: 0 }
    cur.total += 1
    if (d.rank === '優勝') cur.win += 1
    map.set(a, cur)
  }
  return Array.from(map.entries())
    .map(([archetype, v]) => ({ archetype, total: v.total, win: v.win }))
    .sort((x, y) => y.total - x.total)
}

// 環境Tier表用：使用率上位アーキタイプに代表カード画像を付ける（環境デッキのコードを展開）。
// 上位14件だけ・1アーキタイプ1デッキ展開（キャッシュ済み）・24hキャッシュで軽量。
export type TierMeta = { archetype: string; deckCount: number; winCount: number; share: number; image: string | null }
const getTierMetasCached = unstable_cache(
  async (): Promise<TierMeta[]> => {
    try {
      const decks = await loadMergedPokemonEnvDecks()
      const total = decks.length || 1
      const g = new Map<string, { deckCount: number; winCount: number; code: string }>()
      for (const d of decks) {
        const a = (d.archetype || '').trim()
        if (!a) continue
        const cur = g.get(a) || { deckCount: 0, winCount: 0, code: '' }
        cur.deckCount += 1
        if (d.rank === '優勝') cur.winCount += 1
        if (!cur.code && d.deckCode) cur.code = d.deckCode
        g.set(a, cur)
      }
      const top = Array.from(g.entries()).sort((x, y) => y[1].deckCount - x[1].deckCount).slice(0, 14)
      return await Promise.all(top.map(async ([archetype, v]): Promise<TierMeta> => {
        let image: string | null = null
        try {
          const res = await getDeckDataAction(v.code)
          if (res.success && res.data) {
            // アーキタイプ名の主役カードを優先（"ガルーラBOX"→"ガルーラ" 等、接尾辞を落として部分一致）
            const core = archetype.replace(/BOX|ＢＯＸ|デッキ|ex|EX|\s+/gi, '').trim()
            const pick =
              (core ? res.data.find(c => c.imageUrl && c.supertype === 'Pokémon' && c.name.includes(core)) : undefined)
              || res.data.find(c => c.imageUrl && c.supertype === 'Pokémon')
              || res.data.find(c => c.imageUrl)
            image = pick?.imageUrl || null
          }
        } catch { /* skip */ }
        return { archetype, deckCount: v.deckCount, winCount: v.winCount, share: (v.deckCount / total) * 100, image }
      }))
    } catch { return [] }
  },
  ['tier-metas-pokemon-v2'],
  { revalidate: 3600 },
)

// 注目カード採用率（1時間キャッシュ）
const getCachedFeaturedCards = unstable_cache(
  async () => {
    const res = await getFeaturedCardsWithStatsAction()
    if (!res.success || !res.data) return []
    return res.data
      .map(c => ({ card_name: c.card_name, current_adoption_rate: c.current_adoption_rate }))
      .sort((a, b) => b.current_adoption_rate - a.current_adoption_rate)
  },
  ['featured-cards'],
  { revalidate: 3600 }
)

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
  ['archetype-analytics-v2'],
  { revalidate: 14400 } // 4時間キャッシュ
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

// ※ 旧Tier表の集計元（archetype_card_stats＝7/31凍結、deck_records＝同期停止中）は廃止。
//   いまは現環境マージ（Firebase環境デッキ＋シティリーグ）からTier表・分布をライブ算出する
//   （page本体の buildLiveTierRankings 参照）。シティ結果もそのまま反映される。

// TOPの「環境・優勝デッキ集」用：featured_decks の優勝デッキを新しい順に取得（1時間キャッシュ）
const getCachedFeaturedWinnerDecks = unstable_cache(
  async () => {
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .from('featured_decks')
      .select('id, deck_code, archetype_id, event_date, created_at')
      .eq('event_rank', '優勝')
      .order('created_at', { ascending: false })
      .limit(40)
    // 大会日(event_date)の新しい順に並べ替えてから上位8件（年なし文字列を created_at 基準で年推定）
    return (data || []).slice().sort(byEventDateDesc).slice(0, 8)
  },
  ['featured-winner-decks-v1'],
  { revalidate: 3600 }
)

// TOPの「環境・優勝デッキ集」用：シティリーグ(city_events)の優勝デッキを新しい順に取得。
// featured_decks が止まっても日次のシティ結果で最新の優勝デッキを出す。
// archetype名は deck_archetypes の id に紐づけ（カバー画像・名称表示のため）。
type WinnerDeck = { id: string; deck_code: string | null; archetype_id: string | null; event_date: string | null; source?: 'featured' | 'city' }
const getCityWinnerDecks = unstable_cache(
  async (): Promise<WinnerDeck[]> => {
    const [events, idx, map] = await Promise.all([loadEventsDB(), loadDeckIndex(), loadArchetypeMapDB()])
    const sb = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: archRows } = await sb.from('deck_archetypes').select('id, name')
    const nameToId = new Map<string, string>((archRows || []).map((a: { id: string; name: string }) => [a.name, a.id]))
    const fmt = (d: string) => /^\d{8}$/.test(d) ? `${+d.slice(4, 6)}/${+d.slice(6, 8)}` : d
    const out: WinnerDeck[] = []
    const seen = new Set<string>()
    for (const ev of events) { // events は date 降順
      if (ev.league !== 'オープン') continue
      for (const r of ev.results) {
        if (r.rank !== 1 || !r.deck_id || seen.has(r.deck_id)) continue
        seen.add(r.deck_id)
        const name = resolveArchetypeFromRep(r.deck_id, idx.reps[r.deck_id], map)
        const archId = name ? nameToId.get(name) ?? null : null
        out.push({ id: r.deck_id, deck_code: r.deck_id, archetype_id: archId, event_date: fmt(ev.date), source: 'city' })
      }
    }
    return out
  },
  ['city-winner-decks-v1'],
  { revalidate: 3600, tags: ['city-data'] }
)

// シティ優勝（最新・現行環境）を優先し、不足分を featured_decks で補完。重複はdeck_codeで排除。
function mergeWinnerDecks(city: WinnerDeck[], featured: WinnerDeck[]): WinnerDeck[] {
  const seen = new Set<string>()
  const merged: WinnerDeck[] = []
  for (const d of [...city.map(d => ({ ...d, source: 'city' as const })), ...featured.map(d => ({ ...d, source: 'featured' as const }))]) {
    if (!d.deck_code || seen.has(d.deck_code)) continue
    seen.add(d.deck_code)
    merged.push(d)
  }
  return merged.slice().sort(byEventDateDesc).slice(0, 8)
}

// 直近2ヶ月の採用カードデータがあるアーキタイプID（リンク表示の404回避用、24時間キャッシュ）
const getCachedRecentArchetypeIds = unstable_cache(
  async () => {
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    // Supabaseのmax-rows(1000)制限があるためページングで全行取得
    const ids = new Set<string>()
    for (let offset = 0; offset < 10000; offset += 1000) {
      const { data } = await supabase
        .from('archetype_cards_recent')
        .select('archetype_id')
        .range(offset, offset + 999)
      if (!data || data.length === 0) break
      data.forEach(r => { if (r.archetype_id) ids.add(r.archetype_id) })
      if (data.length < 1000) break
    }
    return Array.from(ids)
  },
  ['recent-archetype-ids-v2'],
  { revalidate: 14400 }
)

export const metadata: Metadata = {
  title: 'PokéLix（ポケリス）| ポケカ デッキシミュレーター・初手確率',
  description: 'ポケモンカードのデッキシミュレーター。環境デッキ採用率・初手確率・一人回し練習が無料で使えるサイト。デッキコードを入力するだけで初手7枚の確率、サイド落ちリスクをモンテカルロ法で即計算（「ポケカ シュミレーター」とも呼ばれます）。',
  keywords: ['ポケカ シミュレーター', 'ポケカ シュミレーター', 'ポケカ デッキシミュレーター', 'ポケカ', 'ポケモンカード', '確率シミュレーター', '初手確率', 'サイド落ち', '一人回し', 'デッキ分析', '環境デッキ', 'ポケリス'],
  openGraph: {
    title: 'PokéLix（ポケリス）| ポケカ デッキシミュレーター・初手確率',
    description: 'ポケモンカードのデッキシミュレーター。環境デッキ採用率・初手確率・一人回し練習が無料で使えるサイト。',
    url: 'https://www.pokelix.jp',
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
    canonical: 'https://www.pokelix.jp',
  },
}

// Incremental Static Regeneration (ISR)
// Revalidate this page content at most once every 60 seconds
export const revalidate = 21600

export default async function Home() {
  // 公開読み取りは cookie 非依存の anon クライアント（lib/supabase）を使用。
  // これにより本ページは真のISR（revalidate=3600）として静的配信され、毎リクエストの動的レンダリング＝Fluid Active CPU を回避する。
  // 記事・アーキタイプは60秒ISR、採用率データは24時間キャッシュで並列取得
  const [
    { data: archetypes },
    { data: articles },
    analyticsData,
    recentArchetypeIds,
    featuredCards,
    featuredWinnerDecks,
    cityWinnerDecks,
  ] = await Promise.all([
    supabase.from('deck_archetypes').select('*').order('display_order', { ascending: true }).order('name', { ascending: true }),
    supabase.from('articles').select('*').eq('is_published', true).order('published_at', { ascending: false, nullsFirst: false }).limit(5),
    getCachedAnalytics(),
    getCachedRecentArchetypeIds(),
    getCachedFeaturedCards(),
    getCachedFeaturedWinnerDecks(),
    getCityWinnerDecks(),
  ])

  // 環境・優勝デッキ集：シティ（最新）を優先し、不足分だけ featured で補完
  const winnerDecks = mergeWinnerDecks(cityWinnerDecks, featuredWinnerDecks as WinnerDeck[])

  const envDecks = await getEnvDecksForTop()
  const usageRanking = buildUsageRanking(envDecks)
  const tierMetas = await getTierMetasCached()

  // Tier表・分布・優勝数は「現環境マージ（Firebase環境デッキ＋シティリーグ）」からライブ算出。
  // 旧集計stats（7/31凍結）・deck_records（同期停止中）は使わないので、シティ結果まで反映される。
  // Tier表の描画は archetype_id キーで動くため、アーキタイプ名→id（deck_archetypes）に変換する。
  const nameToId = new Map<string, string>()
  for (const a of (archetypes || [])) {
    const nm = (a.name || '').trim()
    if (nm && !nameToId.has(nm)) nameToId.set(nm, a.id)
  }
  const RECENT_MS = 14 * 24 * 60 * 60 * 1000
  const nowMs = Date.now()
  const weeklyRanking: Record<string, number> = {} // 全期間（マージ全件）
  const recentRanking: Record<string, number> = {} // 直近2週間（大会日基準）
  const winCounts: Record<string, number> = {}      // 優勝数（分布ドーナツ用）
  for (const d of envDecks) {
    const id = nameToId.get((d.archetype || '').trim())
    if (!id) continue
    weeklyRanking[id] = (weeklyRanking[id] || 0) + 1
    if (d.rank === '優勝') winCounts[id] = (winCounts[id] || 0) + 1
    if (nowMs - eventDateSortKey(d.eventDate) <= RECENT_MS) recentRanking[id] = (recentRanking[id] || 0) + 1
  }

  // デッキ数が多い順にアーキタイプをソート
  const sortedArchetypes = [...(archetypes || [])].sort(
    (a, b) => (weeklyRanking[b.id] || 0) - (weeklyRanking[a.id] || 0)
  )

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
        envDecks={envDecks}
        usageRanking={usageRanking}
        usageTotalDecks={envDecks.length}
        tierMetas={tierMetas}
        archetypes={sortedArchetypes}
        articles={articles || []}
        analyticsData={analyticsData}
        recentArchetypeIds={recentArchetypeIds}
        weeklyRanking={weeklyRanking}
        recentRanking={recentRanking}
        winCounts={winCounts}
        winnerDecks={winnerDecks}
        featuredCards={featuredCards}
      />
    </>
  )
}
