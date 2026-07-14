import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import UnionArenaDeckIcon from '@/components/UnionArenaDeckIcon'
import { getUnionArenaSeriesAction, getUnionArenaRecommendedDecksAction } from '@/app/actions'

export const metadata: Metadata = {
    title: 'ユニアリ タイトル別おすすめデッキ | PokéLix（ポケリス）',
    description: 'ユニオンアリーナの参加タイトル（アニメ・ゲーム作品）ごとの公式おすすめデッキ一覧。',
}

export const revalidate = 3600

export default async function UnionArenaTitlesPage() {
    const [seriesRes, decksRes] = await Promise.all([
        getUnionArenaSeriesAction(),
        getUnionArenaRecommendedDecksAction(),
    ])
    const seriesList = seriesRes.data || []
    const decks = decksRes.data || []

    const grouped: Record<string, any[]> = {}
    decks.forEach((d: any) => {
        const key = d.tag_code || 'others'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(d)
    })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PublicHeader game="unionarena" />
            <main className="flex-grow pt-8 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <Link href="/unionarena" className="text-sm text-blue-600 hover:text-blue-800 font-medium">← TOPに戻る</Link>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-2">タイトル別おすすめデッキ</h1>
                        <p className="text-gray-600 text-sm md:text-base">参加タイトル（アニメ・ゲーム作品）ごとの公式おすすめデッキです。大会結果とは別の、公式が公開しているサンプルデッキです。</p>
                    </div>

                    {seriesList.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">シリーズデータはまだありません。</p>
                        </div>
                    ) : (
                        seriesList.map((s: any) => {
                            const seriesDecks = grouped[s.tag_code] || []
                            if (seriesDecks.length === 0) return null
                            return (
                                <section key={s.tag_code} className="mb-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        {s.logo_url && (
                                            <div className="relative w-24 h-10 shrink-0">
                                                <Image src={s.logo_url} alt={s.name} fill className="object-contain" unoptimized />
                                            </div>
                                        )}
                                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            {s.name}
                                            <span className="text-sm font-normal text-gray-400">{seriesDecks.length}件</span>
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {seriesDecks.map((d: any) => (
                                            <Link
                                                key={d.id}
                                                href={`/unionarena/titles/${d.id}`}
                                                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
                                            >
                                                <div className="relative aspect-square bg-gray-100">
                                                    <UnionArenaDeckIcon
                                                        deckCode={d.deck_code}
                                                        fallbackUrl={d.image_url}
                                                        alt={d.deck_name || s.name}
                                                        className="absolute inset-0 w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="px-2.5 py-2">
                                                    <p className="text-xs font-medium text-gray-800 truncate">{d.deck_name || s.name}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )
                        })
                    )}
                </div>
            </main>
            <Footer game="unionarena" />
        </div>
    )
}
