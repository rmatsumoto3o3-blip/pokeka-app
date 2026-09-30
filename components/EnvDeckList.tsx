'use client'

import { useState } from 'react'
import Link from 'next/link'

export type EnvDeck = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }

const rankStyle = (r: string) => {
    if (r === '優勝') return 'bg-amber-100 text-amber-800 border-amber-300'
    if (r === '準優勝') return 'bg-gray-100 text-gray-700 border-gray-300'
    return 'bg-blue-50 text-blue-700 border-blue-200'
}

const STEP = 8 // 最新8件表示 → 「もっと見る」で8件ずつ追加

function DeckCard({ d }: { d: EnvDeck }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${rankStyle(d.rank)}`}>{d.rank || '—'}</span>
                <span className="text-sm text-gray-800 font-bold truncate">{d.eventName || '大会名なし'}</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
                {d.eventDate && <span>{d.eventDate}・</span>}
                <span className="font-mono text-gray-400">{d.deckCode}</span>
            </div>
            <div className="flex gap-2">
                <Link href={`/env/${encodeURIComponent(d.deckCode)}`} className="flex-1 text-center text-sm font-bold text-gray-800 border border-gray-300 rounded-lg py-1.5 hover:bg-gray-50">デッキを見る</Link>
                <Link href={`/practice?code1=${encodeURIComponent(d.deckCode)}`} className="flex-1 text-center text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-100">▶ 一人回し</Link>
            </div>
        </div>
    )
}

// アーキタイプ1グループぶんのデッキ一覧。最新8件＋残りを8件ずつ展開/収納。
export default function EnvDeckList({ decks }: { decks: EnvDeck[] }) {
    const [visible, setVisible] = useState(STEP)
    const shown = decks.slice(0, visible)
    const remaining = decks.length - visible

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {shown.map(d => <DeckCard key={d.deckCode} d={d} />)}
            </div>
            {(remaining > 0 || visible > STEP) && (
                <div className="mt-2.5 flex items-center gap-2">
                    {remaining > 0 && (
                        <button
                            type="button"
                            onClick={() => setVisible(v => v + STEP)}
                            className="flex-1 text-sm font-bold text-gray-700 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
                        >
                            もっと見る（残り{remaining}件・+{Math.min(STEP, remaining)}）
                        </button>
                    )}
                    {visible > STEP && (
                        <button
                            type="button"
                            onClick={() => setVisible(STEP)}
                            className="text-sm font-bold text-gray-500 border border-gray-200 rounded-lg py-2 px-4 hover:bg-gray-50 transition shrink-0"
                        >
                            閉じる
                        </button>
                    )}
                </div>
            )}
        </>
    )
}
