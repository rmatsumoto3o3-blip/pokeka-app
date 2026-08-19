'use client'

import Link from 'next/link'

// 使用率ランキング（環境デッキ集計・Supabase不使用）。
// 左：環境Tier（代表カード画像グリッド／S〜B）、右：使用率ランキング（バー）。スマホは縦積み。

type RankRow = { archetype: string; total: number; win: number }
type TierMeta = { archetype: string; deckCount: number; winCount: number; share: number; image: string | null }

const TIER_ROWS = [
    { label: 'S', c: 'bg-red-500', from: 0, to: 2 },
    { label: 'A', c: 'bg-orange-500', from: 2, to: 6 },
    { label: 'B', c: 'bg-lime-600', from: 6, to: 12 },
] as const

export default function UsageRankingTop({ ranking, totalDecks, tierMetas = [] }: { ranking: RankRow[]; totalDecks: number; tierMetas?: TierMeta[] }) {
    if (!ranking || ranking.length === 0) return null
    const top = ranking.slice(0, 12)
    const max = top[0]?.total || 1
    const tiles = tierMetas.slice(0, 12)

    return (
        <section className="bg-white border-b border-[#eef1f6]">
            <div className="max-w-[1080px] mx-auto px-5 py-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-blue-500 rounded-full" />使用率ランキング
                    </h2>
                    <span className="text-[11px] text-gray-400">直近の大会 {totalDecks.toLocaleString()}デッキ</span>
                </div>

                <div className="flex flex-col md:flex-row gap-5">
                    {/* 左：環境Tier（代表カードのアプリアイコン風・S/A/B行・文字なし・上寄せトリミング） */}
                    {tiles.length > 0 && (
                        <div className="md:w-[150px] md:shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-600">環境Tier</span>
                                <Link href="/archetypes" className="text-[11px] text-blue-600 font-semibold">採用率 ›</Link>
                            </div>
                            <div className="space-y-2">
                                {TIER_ROWS.map(t => {
                                    const items = tiles.slice(t.from, t.to)
                                    if (items.length === 0) return null
                                    return (
                                        <div key={t.label} className="flex items-start gap-2">
                                            <span className={`w-5 h-5 shrink-0 rounded ${t.c} text-white text-[11px] font-black flex items-center justify-center mt-0.5`}>{t.label}</span>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {items.map(m => (
                                                    <Link
                                                        key={m.archetype}
                                                        href={`/archetypes/${encodeURIComponent(m.archetype)}`}
                                                        title={`${m.archetype} ${m.share.toFixed(1)}%${m.winCount > 0 ? ` / 優勝${m.winCount}` : ''}`}
                                                        className="block w-11 h-11 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 hover:ring-2 hover:ring-blue-400 transition"
                                                    >
                                                        {m.image && (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={m.image} alt={m.archetype} className="w-full h-full object-cover object-top" loading="lazy" />
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* 右：使用率ランキング（バー） */}
                    <div className="flex-1 min-w-0">
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
                                            <div className="mt-1 h-1 rounded-full bg-gray-100 overflow-hidden max-w-[180px]">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(3, (r.total / max) * 100)}%` }} />
                                            </div>
                                        </div>
                                        <span className="w-12 text-right text-[11px] text-gray-400 shrink-0">{rate.toFixed(1)}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <p className="mt-3 text-[11px] text-gray-500">直近の大会入賞デッキでの使用数（多い順）。左は代表カードのTier表。数字はデッキ数／うち優勝数。</p>
            </div>
        </section>
    )
}
