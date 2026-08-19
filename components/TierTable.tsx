import Link from 'next/link'

// 環境Tier表（S〜B）。使用率上位アーキタイプを代表カード画像つきで並べる。Supabase不使用。

type TierMeta = { archetype: string; deckCount: number; winCount: number; share: number; image: string | null }

const TIERS: { key: 'S' | 'A' | 'B'; label: string; badge: string; range: [number, number] }[] = [
    { key: 'S', label: 'S', badge: 'bg-red-500', range: [0, 2] },
    { key: 'A', label: 'A', badge: 'bg-orange-500', range: [2, 6] },
    { key: 'B', label: 'B', badge: 'bg-lime-600', range: [6, 10] },
]

export default function TierTable({ metas }: { metas: TierMeta[] }) {
    if (!metas || metas.length === 0) return null

    return (
        <section className="bg-white border-b border-[#eef1f6]">
            <div className="max-w-[1080px] mx-auto px-5 py-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-blue-500 rounded-full" />環境Tier表
                    </h2>
                    <Link href="/archetypes" className="text-sm text-blue-600 font-semibold">採用率ランキング ›</Link>
                </div>

                <div className="space-y-2">
                    {TIERS.map(t => {
                        const items = metas.slice(t.range[0], t.range[1])
                        if (items.length === 0) return null
                        return (
                            <div key={t.key} className="flex items-stretch gap-2">
                                <div className={`w-9 shrink-0 rounded-lg ${t.badge} text-white font-black text-lg flex items-center justify-center`}>{t.label}</div>
                                <div className="flex-1 min-w-0 flex flex-wrap gap-2">
                                    {items.map(m => (
                                        <Link
                                            key={m.archetype}
                                            href={`/archetypes/${encodeURIComponent(m.archetype)}`}
                                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white pr-2.5 hover:border-blue-400 hover:bg-blue-50/40 transition overflow-hidden"
                                        >
                                            <span className="w-9 h-11 bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                                                {m.image
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    ? <img src={m.image} alt={m.archetype} className="w-full h-full object-cover" loading="lazy" />
                                                    : <span className="text-[9px] text-gray-400">—</span>}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-sm font-bold text-gray-900 truncate max-w-[140px]">{m.archetype}</span>
                                                <span className="block text-[11px] text-gray-500">{m.share.toFixed(1)}%{m.winCount > 0 ? ` ・優勝${m.winCount}` : ''}</span>
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
