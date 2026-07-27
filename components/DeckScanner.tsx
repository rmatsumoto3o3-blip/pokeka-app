'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { scanDeckImageAction, type ScannedCard } from '@/app/aiActions'

// デッキ写真 → 編集可能なデッキリスト → 一人回しへ渡す（管理者専用ツール）
export default function DeckScanner() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [cards, setCards] = useState<ScannedCard[]>([])
    const [preview, setPreview] = useState<string | null>(null)

    const total = cards.reduce((s, c) => s + c.quantity, 0)

    // 送信前に画像を縮小する。フルサイズのスマホ写真はサーバーアクションの
    // サイズ上限(1MB)超過やタイムアウトの原因になるため、長辺1600pxのJPEGに落とす。
    // カード名を読むにはこの解像度で十分。
    const downscale = (file: File): Promise<{ dataUrl: string; base64: string }> =>
        new Promise((resolve, reject) => {
            const img = new window.Image()
            const url = URL.createObjectURL(file)
            img.onload = () => {
                URL.revokeObjectURL(url)
                const MAX = 1600
                const scale = Math.min(1, MAX / Math.max(img.width, img.height))
                const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
                const canvas = document.createElement('canvas')
                canvas.width = w; canvas.height = h
                const ctx = canvas.getContext('2d')
                if (!ctx) { reject(new Error('canvas')); return }
                ctx.drawImage(img, 0, 0, w, h)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
                resolve({ dataUrl, base64: dataUrl.split(',')[1] })
            }
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load')) }
            img.src = url
        })

    const onFile = async (file: File) => {
        setError(''); setCards([]); setLoading(true)
        try {
            const { dataUrl, base64 } = await downscale(file)
            setPreview(dataUrl)
            const res = await scanDeckImageAction(base64, 'image/jpeg')
            if (!res.success) { setError(res.error || '解析に失敗しました'); return }
            setCards(res.cards)
        } catch {
            setError('画像の処理に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    const setQty = (i: number, delta: number) => {
        setCards(prev => prev.map((c, idx) => idx === i ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c))
    }
    const removeCard = (i: number) => setCards(prev => prev.filter((_, idx) => idx !== i))

    const usePractice = () => {
        // buildDeck が受け取る CardData 形式で保存（枚数0は除外）
        const deck = cards
            .filter(c => c.quantity > 0)
            .map(c => ({ name: c.name, imageUrl: c.imageUrl || '', quantity: c.quantity, supertype: c.supertype, subtypes: c.subtypes }))
        localStorage.setItem('pokeka_practice_custom_deck', JSON.stringify(deck))
        router.push('/practice?mode=custom')
    }

    return (
        <div className="space-y-5">
            {/* アップロード */}
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
                <label className="inline-block cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                    デッキ写真を選択
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
                </label>
                <p className="mt-2 text-xs text-gray-500">デッキを並べた写真をアップロード。AIがカード名と枚数を読み取ります。</p>
            </div>

            {loading && <div className="rounded-lg bg-blue-50 p-4 text-center text-sm font-bold text-blue-700">解析中…（10〜30秒）</div>}
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            {cards.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    {/* 合計表示 */}
                    <div className="mb-3 flex items-center justify-between">
                        <div className={`text-sm font-black ${total === 60 ? 'text-green-600' : 'text-amber-600'}`}>
                            合計 {total} / 60 枚 {total !== 60 && '⚠️'}
                        </div>
                        <button
                            onClick={usePractice}
                            disabled={total === 0}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            一人回しで使う →
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {cards.map((c, i) => (
                            <div key={i} className={`rounded-lg border p-2 ${c.matched ? 'border-gray-200 bg-gray-50' : 'border-amber-300 bg-amber-50'}`}>
                                <div className="mb-1 flex aspect-[5/7] items-center justify-center overflow-hidden rounded bg-white">
                                    {c.imageUrl
                                        // eslint-disable-next-line @next/next/no-img-element
                                        ? <img src={c.imageUrl} alt={c.name} loading="lazy" className="h-full w-full object-contain" />
                                        : <span className="p-1 text-center text-[10px] text-amber-700">画像なし<br />（要確認）</span>}
                                </div>
                                <div className="truncate text-[11px] font-bold text-gray-800" title={c.name}>{c.name}</div>
                                {c.suggestion && <div className="truncate text-[9px] text-blue-600">補正: {c.suggestion}→</div>}
                                {!c.matched && <div className="text-[9px] text-amber-700">未一致</div>}
                                <div className="mt-1 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setQty(i, -1)} className="h-6 w-6 rounded bg-gray-200 text-sm font-bold hover:bg-gray-300">−</button>
                                        <span className="w-5 text-center text-sm font-black">{c.quantity}</span>
                                        <button onClick={() => setQty(i, 1)} className="h-6 w-6 rounded bg-gray-200 text-sm font-bold hover:bg-gray-300">＋</button>
                                    </div>
                                    <button onClick={() => removeCard(i)} className="text-[10px] text-red-500 hover:underline">削除</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-[11px] text-gray-500">※枚数はAIの推定です。写真と照合して ± で修正してください。未一致（黄色）のカードは手動確認が必要です。</p>
                </div>
            )}
        </div>
    )
}
