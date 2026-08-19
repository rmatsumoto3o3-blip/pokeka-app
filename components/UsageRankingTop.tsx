import Link from 'next/link'

// 使用率ランキング（deckArchive 由来・Supabase不使用）。page.tsx がサーバー側で集計して渡す。

type RankRow = { archetype: string; total: number; win: number }

export default function UsageRankingTop({ ranking, totalDecks }: { ranking: RankRow[]; totalDecks: number }) {
    if (!ranking || ranking.length === 0) return null
    const top = ranking.slice(0, 12)
    const max = top[0]?.total || 1

    return (
        <section className="bg-white border-b border-[#eef1f6]">
            <div className="max-w-[1080px] mx-auto px-5 py-5">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-blue-500 rounded-full" />使用率ランキング
                    </h2>
                    <span className="text-[11px] text-gray-400">直近の大会 {totalDecks.toLocaleString()}デッキ</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">直近の大会入賞デッキでの使用数（多い順）。数字はデッキ数／うち優勝数。</p>

                <div className="space-y-1.5">
                    {top.map((r, i) => {
                        const rate = totalDecks > 0 ? (r.total / totalDecks) * 100 : 0
                        return (
                            <div key={r.archetype} className="flex items-center gap-3">
                                <span className={`w-6 text-right text-sm font-black ${i < 3 ? 'text-blue-600' : 'text-gray-400'}`}>{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <Link href={`/archetypes/${encodeURIComponent(r.archetype)}`} className="text-sm font-bold text-gray-900 truncate hover:text-blue-600 hover:underline">{r.archetype}</Link>
                                        <span className="text-xs text-gray-500 shrink-0">
                                            {r.total.toLocaleString()}件<span className="text-gray-300"> / </span><span className="text-amber-600 font-bold">優勝{r.win}</span>
                                        </span>
                                    </div>
                                    <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(2, (r.total / max) * 100)}%` }} />
                                    </div>
                                </div>
                                <span className="w-12 text-right text-[11px] text-gray-400 shrink-0">{rate.toFixed(1)}%</span>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-3 text-right">
                    <Link href="/env" className="text-sm text-blue-600 font-semibold">環境デッキを見る ›</Link>
                </div>
            </div>
        </section>
    )
}
