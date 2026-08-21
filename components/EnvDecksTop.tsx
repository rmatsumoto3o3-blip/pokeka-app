import Link from 'next/link'
import { eventDateSortKey } from '@/lib/eventDate'

// トップに出す環境デッキ（Firebase由来）。decks は page.tsx がサーバー側で渡す（SSR）。

type EnvDeck = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }

const rankStyle = (r: string) =>
    r === '優勝' ? 'bg-amber-100 text-amber-800' : r === '準優勝' ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'

export default function EnvDecksTop({ decks }: { decks: EnvDeck[] }) {
    if (!decks || decks.length === 0) return null

    const map = new Map<string, EnvDeck[]>()
    for (const d of decks) {
        const k = d.archetype || 'その他'
        if (!map.has(k)) map.set(k, [])
        map.get(k)!.push(d)
    }
    const groups = Array.from(map.entries())
        .map(([archetype, list]) => ({ archetype, list: list.slice().sort((a, b) => eventDateSortKey(b.eventDate) - eventDateSortKey(a.eventDate)) }))
        .sort((a, b) => b.list.length - a.list.length)
        .slice(0, 6)

    return (
        <section className="bg-white border-b border-[#eef1f6]">
            <div className="max-w-[1080px] mx-auto px-5 py-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-blue-500 rounded-full" />環境デッキ
                    </h2>
                    <Link href="/env" className="text-sm text-blue-600 font-semibold">すべて見る ›</Link>
                </div>
                <div className="space-y-4">
                    {groups.map(g => (
                        <div key={g.archetype}>
                            <div className="text-sm font-bold text-gray-800 mb-1.5">
                                {g.archetype} <span className="text-xs font-normal text-gray-400">{g.list.length}件</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {g.list.slice(0, 4).map(d => (
                                    <div key={d.deckCode} className="rounded-lg border border-gray-200 p-2.5">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${rankStyle(d.rank)}`}>{d.rank || '—'}</span>
                                            <span className="text-sm text-gray-800 font-bold truncate">{d.eventName || '大会'}</span>
                                            <span className="text-xs text-gray-400 ml-auto shrink-0">{d.eventDate}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/env/${encodeURIComponent(d.deckCode)}`} className="flex-1 text-center text-xs font-bold text-gray-800 border border-gray-300 rounded-md py-1.5 hover:bg-gray-50">デッキを見る</Link>
                                            <Link href={`/practice?code1=${encodeURIComponent(d.deckCode)}`} className="flex-1 text-center text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-md py-1.5 hover:bg-blue-100">▶ 一人回し</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
