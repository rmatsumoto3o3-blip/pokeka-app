'use client'
import { useEffect, useRef, useState } from 'react'
import type { Card } from '@/lib/city'

const ORDER = ['Pokémon', 'Item', 'Pokémon Tool', 'Supporter', 'Stadium', 'Energy']
const deckUrl = (c: string) => `https://www.pokemon-card.com/deck/confirm.html/deckID/${c}`

// 1デッキの一覧グリッド。画面に入った時だけカード画像を描画（遅延マウント）＝初期DOM/描画コストを大幅削減。
// 画像は公式から直リンク＋lazy読み込み（サーバー転送ゼロ）。
export default function DeckGrid({ cards, deckId }: { cards: Card[] | null | undefined; deckId: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (typeof IntersectionObserver === 'undefined') { setInView(true); return }
        const io = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) { setInView(true); io.disconnect() }
        }, { rootMargin: '600px 0px' })
        io.observe(el)
        return () => io.disconnect()
    }, [])

    if (!cards) {
        return (
            <div className="text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-4 text-center">
                デッキを読み込み中です。
                <a href={deckUrl(deckId)} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold ml-1">公式で見る ↗</a>
            </div>
        )
    }

    // 画面外はプレースホルダ（高さだけ確保）。近づいたら実グリッドを描画。
    if (!inView) {
        return <div ref={ref} className="min-h-[130px] rounded-lg bg-gray-50/60" aria-hidden />
    }

    const sorted = [...cards].sort(
        (a, b) => ORDER.indexOf(a.supertype) - ORDER.indexOf(b.supertype) || b.quantity - a.quantity,
    )
    return (
        <div ref={ref} className="flex flex-wrap gap-1">
            {sorted.map((c, i) => (
                <div key={i} className="relative w-[42px] sm:w-[52px]">
                    {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt={c.name} title={`${c.name} ×${c.quantity}`} loading="lazy" decoding="async"
                            className="w-full aspect-[63/88] object-cover rounded border border-gray-200 bg-white" />
                    ) : (
                        <div className="w-full aspect-[63/88] rounded border border-dashed border-gray-300 bg-white flex items-center justify-center text-[8px] text-gray-500 p-0.5 text-center leading-tight">{c.name}</div>
                    )}
                    <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow">{c.quantity}</span>
                </div>
            ))}
        </div>
    )
}
