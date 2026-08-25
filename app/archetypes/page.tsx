import type { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import PublicHeader from '@/components/PublicHeader'
import { getFirebaseDb } from '@/lib/firebase/admin'

// 採用率・使用率ランキング一覧。環境デッキ(environmentDecks)由来・Supabase不使用。
// トップの使用率ランキング／採用率詳細と同じ源なので数字が一致し、詳細も404にならない。

export const revalidate = 3600

export const metadata: Metadata = {
    title: 'ポケカ 採用率・使用率ランキング（環境デッキ）',
    description: 'ポケモンカードの環境デッキを大会データから集計した使用率ランキング。各アーキタイプのデッキ数・優勝数・シェアを一覧で比較。気になるデッキの採用カード・構築もチェックできます。',
    keywords: ['ポケカ 採用率', 'ポケカ 使用率', 'ポケカ シェア率', 'ポケカ 環境', 'ポケカ 環境デッキ', 'ポケカ ランキング', 'ポケモンカード 環境', 'ポケカ tier'],
    alternates: { canonical: 'https://www.pokelix.jp/archetypes' },
    openGraph: {
        title: 'ポケカ 環境デッキ採用率・使用率ランキング | PokéLix（ポケリス）',
        description: '大会データから集計したポケカ環境デッキの使用率ランキング。',
    },
}

type EnvDeck = { archetype?: string; rank?: string }
type Ranked = { name: string; deckCount: number; winCount: number; share: number }

const getRankingCached = unstable_cache(
    async (): Promise<{ ranked: Ranked[]; totalDecks: number }> => {
        try {
            const db = getFirebaseDb()
            if (!db) return { ranked: [], totalDecks: 0 }
            const snap = await db.collection('environmentDecks').doc('pokemon').get()
            const decks = (snap.exists ? (snap.data()?.decks) : []) as EnvDeck[] || []
            const map = new Map<string, { deckCount: number; winCount: number }>()
            for (const d of decks) {
                const a = (d.archetype || '').trim()
                if (!a) continue
                const cur = map.get(a) || { deckCount: 0, winCount: 0 }
                cur.deckCount += 1
                if (d.rank === '優勝') cur.winCount += 1
                map.set(a, cur)
            }
            const totalDecks = decks.length
            const denom = totalDecks || 1
            const ranked = Array.from(map.entries())
                .map(([name, v]) => ({ name, deckCount: v.deckCount, winCount: v.winCount, share: (v.deckCount / denom) * 100 }))
                .sort((a, b) => b.deckCount - a.deckCount)
            return { ranked, totalDecks }
        } catch { return { ranked: [], totalDecks: 0 } }
    },
    ['archetypes-hub-env-v1'],
    { revalidate: 3600 },
)

export default async function ArchetypesHubPage() {
    const { ranked, totalDecks } = await getRankingCached()

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'ポケカ 環境デッキ採用率・使用率ランキング',
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
                        直近の全国の大会入賞デッキ（{totalDecks.toLocaleString()}件）から集計した、環境デッキのシェア（使用率）と優勝数のランキングです。各デッキ名から採用カード・構築（採用率）も確認できます。
                    </p>
                </div>

                {ranked.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">現在表示できるデータがありません。少し時間をおいて再度お試しください。</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                        {ranked.map((a, i) => (
                            <Link
                                key={a.name}
                                href={`/archetypes/${encodeURIComponent(a.name)}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 transition"
                            >
                                <span className={`w-7 text-center font-extrabold shrink-0 ${
                                    i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300'
                                }`}>
                                    {i + 1}
                                </span>
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
                    ※使用率は直近の大会入賞デッキに占める各アーキタイプの割合です。データは毎日更新されます。
                </p>
            </main>
        </div>
    )
}
