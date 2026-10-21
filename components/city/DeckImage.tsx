'use client'
import { useEffect, useRef, useState } from 'react'
import DeckGrid from '@/components/city/DeckGrid'
import type { Card } from '@/lib/city'

const deckImg = (c: string) => `https://www.pokemon-card.com/deck/deckView.php/deckID/${c}.png`

// デッキリストを公式のデッキ画像1枚で表示（公式から直リンク＝サーバー転送ゼロ）。
// ・画面に入ってから読み込む（lazy＋遅延マウント）
// ・タップでポップアップ拡大（小さくて見づらいを解消）
// ・画像が用意できない時は従来のカード1枚ずつグリッド（DeckGrid）にフォールバック＝空表示を防ぐ
export default function DeckImage({ deckId, cards, alt }: { deckId: string; cards?: Card[] | null; alt?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)
    const [failed, setFailed] = useState(false)
    const [zoom, setZoom] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (typeof IntersectionObserver === 'undefined') { setInView(true); return }
        const io = new IntersectionObserver((e) => {
            if (e[0]?.isIntersecting) { setInView(true); io.disconnect() }
        }, { rootMargin: '600px 0px' })
        io.observe(el)
        return () => io.disconnect()
    }, [])

    useEffect(() => {
        if (!zoom) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(false) }
        window.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
    }, [zoom])

    if (!inView) return <div ref={ref} className="aspect-[2/1] w-full rounded-lg bg-gray-50/60" aria-hidden />

    // 公式デッキ画像が取得できない時は、従来のカード1枚ずつグリッドに戻す（空表示を防ぐ）
    if (failed) return <div ref={ref}><DeckGrid cards={cards} deckId={deckId} /></div>

    return (
        <div ref={ref}>
            <button type="button" onClick={() => setZoom(true)}
                className="group relative block w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
                aria-label="デッキリストを拡大">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={deckImg(deckId)} alt={alt || 'デッキリスト'} width={1024} height={512}
                    loading="lazy" decoding="async" onError={() => setFailed(true)}
                    className="block w-full aspect-[2/1] object-contain" />
                <span className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-80 group-hover:opacity-100">タップで拡大 ⤢</span>
            </button>

            {zoom && (
                <div onClick={() => setZoom(false)}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3"
                    role="dialog" aria-modal="true">
                    <button type="button" onClick={() => setZoom(false)}
                        className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white hover:bg-white/25"
                        aria-label="閉じる">×</button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={deckImg(deckId)} alt={alt || 'デッキリスト（拡大）'}
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[92vh] max-w-full rounded-lg object-contain shadow-2xl" />
                </div>
            )}
        </div>
    )
}
