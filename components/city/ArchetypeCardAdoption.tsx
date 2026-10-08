'use client'
import { useState } from 'react'
import type { ArchetypeAdoption } from '@/lib/city'

const CAT_ORDER = ['Pokémon', 'Item', 'Pokémon Tool', 'Supporter', 'Stadium', 'Energy']
const CAT_LABEL: Record<string, string> = {
    'Pokémon': 'ポケモン', 'Item': 'グッズ', 'Pokémon Tool': 'ポケモンのどうぐ',
    'Supporter': 'サポート', 'Stadium': 'スタジアム', 'Energy': 'エネルギー',
}

type Row = ArchetypeAdoption[number]['cards'][number]

const rateColor = (r: number) => r >= 90 ? 'bg-rose-600' : r >= 50 ? 'bg-amber-500' : r >= 25 ? 'bg-blue-500' : 'bg-gray-400'

function CardCell({ c, total, onOpen }: { c: Row; total: number; onOpen: (c: Row) => void }) {
    return (
        <button type="button" onClick={() => onOpen(c)} className="relative block w-full" title={`${c.name}：採用率 ${c.rate}%`}>
            {c.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={c.image} alt={c.name} className="w-full aspect-[63/88] object-cover rounded border border-gray-200 bg-white" loading="lazy" decoding="async" />
                : <div className="w-full aspect-[63/88] rounded border border-dashed border-gray-300 bg-white flex items-center justify-center text-[8px] text-gray-500 p-0.5 text-center leading-tight">{c.name}</div>}
            <span className={`absolute -top-1 -right-1 ${rateColor(c.rate)} text-white text-[9px] font-black rounded-full px-1 py-0.5 shadow`}>{c.rate}%</span>
        </button>
    )
}

export default function ArchetypeCardAdoption({ data }: { data: ArchetypeAdoption }) {
    const [sel, setSel] = useState(data[0]?.archetype ?? '')
    const [popup, setPopup] = useState<Row | null>(null)
    const cur = data.find(d => d.archetype === sel) ?? data[0]
    if (!cur) return <div className="text-center text-gray-400 py-16">データがありません。</div>

    const groups = CAT_ORDER
        .map(cat => ({ cat, rows: cur.cards.filter(c => c.supertype === cat).sort((a, b) => b.rate - a.rate || b.avg - a.avg) }))
        .filter(g => g.rows.length)
    const other = cur.cards.filter(c => !CAT_ORDER.includes(c.supertype))
    if (other.length) groups.push({ cat: 'その他', rows: other })

    return (
        <div>
            {/* アーキタイプ選択 */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
                {data.map(d => (
                    <button key={d.archetype} type="button" onClick={() => setSel(d.archetype)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition ${d.archetype === sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                        {d.archetype}<span className="ml-1 opacity-70">{d.total}</span>
                    </button>
                ))}
            </div>

            <div className="mb-3 text-sm font-bold text-gray-900">
                {cur.archetype} <span className="text-gray-500 font-normal">（母数 {cur.total} デッキ・カードをタップで拡大／採用率）</span>
            </div>

            <div className="space-y-4">
                {groups.map(g => (
                    <section key={g.cat}>
                        <h3 className="text-xs font-black text-gray-500 mb-1.5">{CAT_LABEL[g.cat] ?? g.cat}<span className="ml-1 font-normal">{g.rows.length}種</span></h3>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                            {g.rows.map((c, i) => <CardCell key={i} c={c} total={cur.total} onOpen={setPopup} />)}
                        </div>
                    </section>
                ))}
            </div>

            {/* カード拡大ポップアップ */}
            {popup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setPopup(null)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPopup(null)} className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/40 text-white text-sm flex items-center justify-center">✕</button>
                        {popup.image
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={popup.image} alt={popup.name} className="w-full object-contain bg-gray-50" />
                            : <div className="w-full aspect-[63/88] bg-gray-50 flex items-center justify-center text-sm text-gray-500">{popup.name}</div>}
                        <div className="p-4">
                            <div className="text-base font-black text-gray-900 mb-2">{popup.name}</div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="relative h-5 flex-1 rounded bg-gray-100 overflow-hidden">
                                    <div className={`absolute inset-y-0 left-0 ${rateColor(popup.rate)}`} style={{ width: `${Math.min(popup.rate, 100)}%` }} />
                                </div>
                                <span className="text-lg font-black text-gray-900">{popup.rate}%</span>
                            </div>
                            <div className="text-xs text-gray-600">
                                <span className="font-bold">{cur.archetype}</span> での採用率
                                （{popup.decks} / {cur.total} デッキ・平均 <span className="font-bold">{popup.avg}</span> 枚）
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
