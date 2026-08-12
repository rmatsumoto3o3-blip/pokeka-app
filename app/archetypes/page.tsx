import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { unstable_cache } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import PublicHeader from '@/components/PublicHeader'

export const revalidate = 14400

export const metadata: Metadata = {
    title: 'ポケカ 環境デッキ採用率・使用率ランキング【直近2ヶ月】| PokéLix（ポケリス）',
    description: 'ポケモンカードの環境デッキを大会データから集計した採用率（使用率）ランキング。各アーキタイプのデッキ数・優勝数・シェアを一覧で比較。気になるデッキの採用カード・構築もチェックできます。',
    keywords: ['ポケカ 採用率', 'ポケカ 使用率', 'ポケカ シェア率', 'ポケカ 環境', 'ポケカ 環境デッキ', 'ポケカ ランキング', 'ポケモンカード 環境', 'ポケカ tier'],
    alternates: { canonical: 'https://www.pokelix.jp/archetypes' },
    openGraph: {
        title: 'ポケカ 環境デッキ採用率・使用率ランキング | PokéLix（ポケリス）',
        description: '大会データから集計したポケカ環境デッキの採用率ランキング。',
    },
}

// アーキタイプ別「デッキ数(ALL)」「優勝数(優勝)」を集計statsから取得（TOPと同一ロジック）。
// 個別デッキを削除しても匿名集計 archetype_card_stats は残るためランキングは維持される。
const getCachedArchetypeStats = unstable_cache(
    async () => {
        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const deckCounts: Record<string, number> = {}
        const winCounts: Record<string, number> = {}
        const ranks: [string, Record<string, number>][] = [['ALL', deckCounts], ['優勝', winCounts]]
        for (const [rank, target] of ranks) {
            for (let offset = 0; offset < 30000; offset += 1000) {
                const { data } = await supabase
                    .from('archetype_card_stats')
                    .select('archetype_id,total_decks')
                    .eq('event_rank', rank)
                    .range(offset, offset + 999)
                if (!data || data.length === 0) break
                data.forEach(r => {
                    if (r.archetype_id && !(r.archetype_id in target)) target[r.archetype_id] = r.total_decks || 0
                })
                if (data.length < 1000) break
            }
        }
        return { deckCounts, winCounts }
    },
    ['archetype-counts-hub-v1'],
    { revalidate: 14400 }
)

const getCachedArchetypes = unstable_cache(
    async () => {
        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const { data } = await supabase
            .from('deck_archetypes')
            .select('id, name, cover_image_url')
        return data || []
    },
    ['archetypes-list-hub-v1'],
    { revalidate: 14400 }
)

export default async function ArchetypesHubPage() {
    const [archetypes, stats] = await Promise.all([
        getCachedArchetypes(),
        getCachedArchetypeStats(),
    ])
    const { deckCounts, winCounts } = stats

    const totalDecks = Object.values(deckCounts).reduce((a, b) => a + b, 0) || 1

    const ranked = archetypes
        .map((a: any) => ({
            ...a,
            deckCount: deckCounts[a.id] || 0,
            winCount: winCounts[a.id] || 0,
            share: ((deckCounts[a.id] || 0) / totalDecks) * 100,
        }))
        .filter(a => a.deckCount > 0)
        .sort((a, b) => b.deckCount - a.deckCount)

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'ポケカ 環境デッキ採用率ランキング',
        itemListElement: ranked.slice(0, 30).map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: a.name,
            url: `https://www.pokelix.jp/archetypes/${encodeURIComponent(a.name)}`,
        })),
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <PublicHeader />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                        ポケカ 環境デッキ 採用率・使用率ランキング
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base">
                        直近2ヶ月の全国の大会入賞デッキ（{totalDecks.toLocaleString()}件）から集計した、環境デッキのシェア（使用率）と優勝数のランキングです。各デッキの採用カード・構築も確認できます。
                    </p>
                </div>

                {ranked.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">集計データを準備中です。</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                        {ranked.map((a, i) => (
                            <Link
                                key={a.id}
                                href={`/archetypes/${encodeURIComponent(a.name)}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 transition"
                            >
                                <span className={`w-7 text-center font-extrabold shrink-0 ${
                                    i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300'
                                }`}>
                                    {i + 1}
                                </span>
                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center relative">
                                    {a.cover_image_url ? (
                                        <Image src={a.cover_image_url} alt={a.name} fill sizes="48px" className="object-cover" />
                                    ) : (
                                        <span className="text-xl">⚡️</span>
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{a.name}</p>
                                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(a.share, 100)}%` }} />
                                    </div>
                                </div>
                                <div className="text-right shrink-0 w-24">
                                    <p className="font-bold text-blue-600">{a.share.toFixed(1)}%</p>
                                    <p className="text-[11px] text-gray-400">
                                        {a.deckCount}件{a.winCount > 0 ? ` / 優勝${a.winCount}` : ''}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <p className="mt-4 text-xs text-gray-400">
                    ※使用率は直近2ヶ月の大会入賞デッキに占める各アーキタイプの割合です。データは毎日更新されます。
                </p>
            </main>
        </div>
    )
}
