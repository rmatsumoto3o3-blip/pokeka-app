import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import { getUnionArenaArchetypesAction, getUnionArenaDeckRecordsAction } from '@/app/actions'

export const metadata: Metadata = {
    title: 'ユニアリ 環境・優勝デッキ一覧 | PokéLix（ポケリス）',
    description: '大会で結果を残したユニアリ（ユニオンアリーナ）のデッキをアーキタイプ別にまとめています。',
}

export const revalidate = 60

export default async function UnionArenaDecksPage() {
    const [archetypesRes, decksRes] = await Promise.all([
        getUnionArenaArchetypesAction(),
        getUnionArenaDeckRecordsAction(),
    ])
    const archetypes = archetypesRes.data || []
    const decks = decksRes.data || []
    const archetypeMap = new Map(archetypes.map((a: any) => [a.id, a]))

    const grouped: Record<string, any[]> = {}
    decks.forEach((d: any) => {
        const key = d.archetype_id && archetypeMap.has(d.archetype_id) ? d.archetype_id : 'others'
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
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-2">環境・優勝デッキ一覧</h1>
                        <p className="text-gray-600 text-sm md:text-base">大会で結果を残したユニアリのデッキをアーキタイプ別にまとめています。</p>
                    </div>

                    {decks.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">大会デッキデータはまだありません。データ収集が始まり次第、順次表示されます。</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([archId, archDecks]) => {
                            const arch = archId === 'others' ? { name: 'その他', cover_image_url: null } : archetypeMap.get(archId)
                            return (
                                <section key={archId} className="mb-8">
                                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                                        {arch?.name || 'その他'}
                                        <span className="text-sm font-normal text-gray-400">{archDecks.length}件</span>
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {archDecks.map((d: any) => (
                                            <Link key={d.id} href={`/unionarena/decks/${d.id}`} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                                                <div className="relative aspect-square bg-gray-100">
                                                    {d.thumbnail_url ? (
                                                        <Image src={d.thumbnail_url} alt={d.deck_name || arch?.name || ''} fill className="object-contain" unoptimized />
                                                    ) : arch?.cover_image_url ? (
                                                        <Image src={arch.cover_image_url} alt={arch.name} fill className="object-contain p-2" unoptimized />
                                                    ) : null}
                                                    {d.event_rank && (
                                                        <span className="absolute top-1 left-1 text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded">{d.event_rank}</span>
                                                    )}
                                                    {d.color && (
                                                        <span className="absolute top-1 right-1 text-[10px] font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded">{d.color}</span>
                                                    )}
                                                </div>
                                                <div className="px-2.5 py-2">
                                                    <p className="text-xs font-medium text-gray-800 truncate">{d.event_location || d.deck_code}</p>
                                                    <p className="text-[11px] text-gray-400">{d.event_date}</p>
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
