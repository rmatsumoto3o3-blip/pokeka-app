'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { scanDeckImageAction, type ScannedCard } from '@/app/aiActions'

// デッキ写真 → 編集可能なデッキリスト → 一人回しへ渡す（管理者専用ツール）
// 精度対策: 60枚を1枚に詰めると名前が小さく反射/重なりで読めない。分割撮影した
// 複数枚を順に読み取り、同名カードの枚数を合算する。1枚あたりの枚数が減るほど
// 名前が大きく写り精度が上がる。
export default function DeckScanner() {
    const router = useRouter()
    const [busy, setBusy] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState('')
    const [cards, setCards] = useState<ScannedCard[]>([])
    const [photoCount, setPhotoCount] = useState(0)

    const total = cards.reduce((s, c) => s + c.quantity, 0)

    // 送信前に画像を縮小。分割撮影なら1枚あたりの枚数が少ないので長辺2000pxでも
    // ペイロードは軽い。カード名を読むには解像度が高いほど有利。
    const downscale = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const img = new window.Image()
            const url = URL.createObjectURL(file)
            img.onload = () => {
                URL.revokeObjectURL(url)
                const MAX = 2000
                const scale = Math.min(1, MAX / Math.max(img.width, img.height))
                const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
                const canvas = document.createElement('canvas')
                canvas.width = w; canvas.height = h
                const ctx = canvas.getContext('2d')
                if (!ctx) { reject(new Error('canvas')); return }
                ctx.drawImage(img, 0, 0, w, h)
                resolve(canvas.toDataURL('image/jpeg', 0.82).split(',')[1])
            }
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load')) }
            img.src = url
        })

    // 既存リストへ読み取り結果を合算マージ（同名カードは枚数を足す）
    const mergeInto = (prev: ScannedCard[], add: ScannedCard[]): ScannedCard[] => {
        const keyOf = (c: ScannedCard) => (c.matched ? 'M:' + c.name : 'R:' + c.name.replace(/\s|　/g, ''))
        const map = new Map(prev.map(c => [keyOf(c), { ...c }]))
        for (const c of add) {
            if (!c.name) continue
            const k = keyOf(c)
            const ex = map.get(k)
            if (ex) ex.quantity += c.quantity
            else map.set(k, { ...c })
        }
        return Array.from(map.values())
    }

    const onFiles = async (files: FileList) => {
        setError(''); setBusy(true)
        const list = Array.from(files)
        try {
            for (let i = 0; i < list.length; i++) {
                setProgress(`${i + 1}/${list.length} 枚目を解析中…（10〜30秒）`)
                const base64 = await downscale(list[i])
                const res = await scanDeckImageAction(base64, 'image/jpeg')
                if (!res.success) { setError(res.error || '解析に失敗しました'); continue }
                setCards(prev => mergeInto(prev, res.cards))
                setPhotoCount(n => n + 1)
            }
        } catch {
            setError('画像の処理に失敗しました')
        } finally {
            setBusy(false); setProgress('')
        }
    }

    const setQty = (i: number, delta: number) =>
        setCards(prev => prev.map((c, idx) => idx === i ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c))
    const removeCard = (i: number) => setCards(prev => prev.filter((_, idx) => idx !== i))
    const reset = () => { setCards([]); setPhotoCount(0); setError('') }

    const usePractice = () => {
        const deck = cards
            .filter(c => c.quantity > 0)
            .map(c => ({ name: c.name, imageUrl: c.imageUrl || '', quantity: c.quantity, supertype: c.supertype, subtypes: c.subtypes }))
        localStorage.setItem('pokeka_practice_custom_deck', JSON.stringify(deck))
        router.push('/practice?mode=custom')
    }

    // 未一致（要確認）を先頭に寄せて修正しやすくする
    const sorted = [...cards].map((c, i) => ({ c, i })).sort((a, b) => Number(a.c.matched) - Number(b.c.matched))
    const unmatched = cards.filter(c => !c.matched).length

    return (
        <div className="space-y-5">
            {/* 撮り方ガイド */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-[12px] text-blue-900 leading-relaxed">
                <p className="font-bold mb-1">📸 精度を上げる撮り方</p>
                <ul className="list-disc list-inside space-y-0.5">
                    <li><b>15〜20枚ずつ分割撮影</b>して複数枚アップ（1枚に60枚詰めると名前が読めません）</li>
                    <li>各カードの<b>上端の名前が見えるように</b>並べる（少し段々に重ねてもOK）</li>
                    <li><b>順光・間接光</b>で。直上照明やフラッシュの<b>反射を避ける</b></li>
                    <li>同名カードは重ねてOK（重なり枚数＝枚数として数えます）</li>
                </ul>
            </div>

            {/* アップロード */}
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
                <label className={`inline-block cursor-pointer rounded-lg px-5 py-2.5 text-sm font-bold text-white ${busy ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {cards.length > 0 ? '写真を追加（合算）' : 'デッキ写真を選択'}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={busy}
                        className="hidden"
                        onChange={e => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = '' }}
                    />
                </label>
                <p className="mt-2 text-xs text-gray-500">複数枚まとめて選択できます。分割撮影した写真を追加していくと枚数が合算されます。</p>
            </div>

            {busy && <div className="rounded-lg bg-blue-50 p-4 text-center text-sm font-bold text-blue-700">{progress || '解析中…'}</div>}
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            {cards.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    {/* 合計表示 */}
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <div className={`text-sm font-black ${total === 60 ? 'text-green-600' : 'text-amber-600'}`}>
                                合計 {total} / 60 枚 {total !== 60 && '⚠️'}
                            </div>
                            <span className="text-[11px] text-gray-400">{photoCount}枚の写真から{unmatched > 0 ? ` / 未一致 ${unmatched}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={reset} className="rounded-lg px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100">全消去</button>
                            <button
                                onClick={usePractice}
                                disabled={total === 0}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                一人回しで使う →
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {sorted.map(({ c, i }) => (
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
                    <p className="mt-3 text-[11px] text-gray-500">※枚数はAIの推定です。写真と照合して ± で修正してください。未一致（黄色）は先頭に表示。合計が60になるよう調整してください。</p>
                </div>
            )}
        </div>
    )
}
