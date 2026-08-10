'use client'

import { useEffect, useState } from 'react'
import {
    getGundamDeckCardsAction,
    postGundamCommunityDeckAction,
    getGundamRecommendedDecksAction,
    deleteGundamCommunityDeckAction,
} from '@/app/actions'

type Posted = { id: string; deck_code: string; deck_name: string | null; tag_code: string | null; image_url: string | null }

export default function GundamCommunityPoster() {
    const [deckCode, setDeckCode] = useState('')
    const [deckName, setDeckName] = useState('')
    const [comment, setComment] = useState('')
    const [cards, setCards] = useState<{ name: string; imageUrl: string }[]>([])
    const [previewing, setPreviewing] = useState(false)
    const [posting, setPosting] = useState(false)
    const [msg, setMsg] = useState('')
    const [list, setList] = useState<Posted[]>([])

    const loadList = () => getGundamRecommendedDecksAction().then(r => setList((r.data as Posted[]) || []))
    useEffect(() => { loadList() }, [])

    const preview = async () => {
        setMsg(''); setCards([]); setPreviewing(true)
        const res = await getGundamDeckCardsAction(deckCode.trim())
        setPreviewing(false)
        if (!res.success || res.cards.length === 0) { setMsg('❌ カードを取得できませんでした（コード確認）'); return }
        // 画像URLで重複排除
        const seen = new Set<string>()
        setCards(res.cards.filter(c => (seen.has(c.imageUrl) ? false : (seen.add(c.imageUrl), true))))
    }

    const post = async () => {
        if (!deckCode.trim()) { setMsg('デッキコードを入力してください'); return }
        setPosting(true); setMsg('')
        const res = await postGundamCommunityDeckAction(deckCode.trim(), deckName, comment)
        setPosting(false)
        if (res.success) {
            setMsg('✅ 投稿しました')
            setDeckCode(''); setDeckName(''); setComment(''); setCards([])
            loadList()
        } else {
            setMsg('❌ ' + (res.error || '投稿に失敗'))
        }
    }

    const remove = async (id: string) => {
        if (!confirm('このデッキを削除しますか？')) return
        const res = await deleteGundamCommunityDeckAction(id)
        if (res.success) setList(prev => prev.filter(d => d.id !== id))
    }

    return (
        <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">みんなのデッキ 投稿</h2>
            <p className="text-sm text-gray-500 mb-5">ガンダムのデッキコードを貼ると、カードを取得して「みんなのデッキ」に登録します（カード情報は辞書に共有保存＝DBを圧迫しません）。</p>

            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">デッキコード</label>
                    <input value={deckCode} onChange={e => setDeckCode(e.target.value)} placeholder="例: w1cocrl3F4AIRndW"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">デッキ名</label>
                        <input value={deckName} onChange={e => setDeckName(e.target.value)} placeholder="例: 青白ガンダム"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">ひとことコメント（任意）</label>
                        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="例: 序盤の展開が速い"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={preview} disabled={previewing || !deckCode.trim()}
                        className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 font-bold text-sm hover:bg-blue-50 disabled:opacity-50">
                        {previewing ? '取得中...' : 'プレビュー'}
                    </button>
                    <button onClick={post} disabled={posting || cards.length === 0}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                        {posting ? '投稿中...' : '投稿する'}
                    </button>
                    {msg && <span className="text-xs">{msg}</span>}
                </div>

                {cards.length > 0 && (
                    <div className="pt-2">
                        <p className="text-xs text-gray-400 mb-2">プレビュー（{cards.length}種）</p>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
                            {cards.map(c => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={c.imageUrl} src={c.imageUrl} alt={c.name} title={c.name} className="w-full aspect-[3/4] object-cover rounded" loading="lazy" />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 投稿済み一覧 */}
            <h3 className="text-sm font-bold text-gray-700 mt-6 mb-2">投稿済み（{list.length}件）</h3>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {list.length === 0 ? (
                    <p className="text-sm text-gray-400 p-4">まだありません</p>
                ) : list.map(d => (
                    <div key={d.id} className="flex items-center gap-3 px-3 py-2">
                        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                            {d.image_url && /* eslint-disable-next-line @next/next/no-img-element */ (
                                <img src={d.image_url} alt="" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{d.deck_name || d.deck_code}</p>
                            <p className="text-[11px] text-gray-400 truncate">{d.tag_code} · {d.deck_code}</p>
                        </div>
                        <button onClick={() => remove(d.id)} className="text-xs text-red-500 hover:underline shrink-0">削除</button>
                    </div>
                ))}
            </div>
        </div>
    )
}
