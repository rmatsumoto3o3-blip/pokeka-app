'use client'

import { useEffect, useState } from 'react'
import {
    getGundamDeckRecordsAction,
    getGundamArchetypesAction,
    getGundamDeckCardsAction,
    updateGundamDeckIconAction,
} from '@/app/actions'

type Deck = {
    id: string
    deck_code: string
    deck_name: string | null
    event_location: string | null
    event_date: string | null
    event_rank: string | null
    archetype_id: string | null
    icon_urls: string[] | null
}

export default function GundamIconManager() {
    const [decks, setDecks] = useState<Deck[]>([])
    const [archMap, setArchMap] = useState<Map<string, string>>(new Map())
    const [loading, setLoading] = useState(true)

    const [selected, setSelected] = useState<Deck | null>(null)
    const [cards, setCards] = useState<{ name: string; imageUrl: string }[]>([])
    const [cardsLoading, setCardsLoading] = useState(false)
    const [picked, setPicked] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')

    useEffect(() => {
        Promise.all([getGundamDeckRecordsAction(), getGundamArchetypesAction()]).then(([d, a]) => {
            setDecks((d.data as Deck[]) || [])
            setArchMap(new Map(((a.data as any[]) || []).map(x => [x.id, x.name])))
            setLoading(false)
        })
    }, [])

    const openDeck = async (deck: Deck) => {
        setSelected(deck)
        setPicked(Array.isArray(deck.icon_urls) ? deck.icon_urls.slice(0, 2) : [])
        setCards([])
        setMsg('')
        setCardsLoading(true)
        const res = await getGundamDeckCardsAction(deck.deck_code)
        // 画像URLで重複排除（同名カードの複数枚を1枚に）
        const seen = new Set<string>()
        const uniq = res.cards.filter(c => (seen.has(c.imageUrl) ? false : (seen.add(c.imageUrl), true)))
        setCards(uniq)
        setCardsLoading(false)
    }

    const togglePick = (url: string) => {
        setPicked(prev => {
            if (prev.includes(url)) return prev.filter(u => u !== url)
            if (prev.length >= 2) return [prev[1], url] // 3枚目は古い方を押し出す
            return [...prev, url]
        })
    }

    const save = async () => {
        if (!selected) return
        setSaving(true)
        setMsg('')
        const res = await updateGundamDeckIconAction(selected.id, picked)
        setSaving(false)
        if (res.success) {
            setDecks(prev => prev.map(d => (d.id === selected.id ? { ...d, icon_urls: picked.length ? picked : null } : d)))
            setSelected(prev => (prev ? { ...prev, icon_urls: picked.length ? picked : null } : prev))
            setMsg('✅ 保存しました')
        } else {
            setMsg('❌ ' + (res.error || '保存に失敗'))
        }
    }

    const deckLabel = (d: Deck) =>
        d.event_location || d.deck_name || (d.archetype_id && archMap.get(d.archetype_id)) || d.deck_code

    if (loading) return <div className="p-8 text-gray-500">読み込み中...</div>

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">ガンダム デッキアイコン設定</h2>
            <p className="text-sm text-gray-500 mb-6">デッキを選び、デッキリストから2枚まで選ぶとアイコンとして並べて表示されます。</p>

            <div className="grid md:grid-cols-2 gap-6">
                {/* デッキ一覧 */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-[70vh] overflow-y-auto">
                    {decks.map(d => {
                        const urls = Array.isArray(d.icon_urls) ? d.icon_urls.filter(Boolean).slice(0, 2) : []
                        return (
                            <button
                                key={d.id}
                                onClick={() => openDeck(d)}
                                className={`w-full flex items-center gap-3 px-3 py-2 border-b border-gray-100 text-left hover:bg-blue-50 transition ${selected?.id === d.id ? 'bg-blue-50' : ''}`}
                            >
                                <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 flex overflow-hidden">
                                    {urls.length > 0 ? (
                                        urls.map((u, i) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img key={i} src={u} alt="" className={`h-full object-cover object-top ${urls.length === 2 ? 'w-1/2' : 'w-full'}`} />
                                        ))
                                    ) : (
                                        <span className="m-auto text-gray-300 text-lg">🃏</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-grow">
                                    <p className="text-sm font-medium text-gray-800 truncate">{deckLabel(d)}</p>
                                    <p className="text-[11px] text-gray-400 truncate">
                                        {d.archetype_id && archMap.get(d.archetype_id)} {d.event_rank} · {d.deck_code}
                                    </p>
                                </div>
                                {urls.length > 0 && <span className="text-[10px] text-green-600 font-bold shrink-0">設定済</span>}
                            </button>
                        )
                    })}
                </div>

                {/* カード選択 */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    {!selected ? (
                        <p className="text-gray-400 text-sm">← デッキを選択してください</p>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-bold text-gray-800 truncate">{deckLabel(selected)}</p>
                                <span className="text-xs text-gray-400">{picked.length}/2 選択中</span>
                            </div>

                            {/* プレビュー */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex overflow-hidden border border-gray-200">
                                    {picked.length > 0 ? (
                                        picked.map((u, i) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img key={i} src={u} alt="" className={`h-full object-cover object-top ${picked.length === 2 ? 'w-1/2' : 'w-full'}`} />
                                        ))
                                    ) : (
                                        <span className="m-auto text-gray-300">🃏</span>
                                    )}
                                </div>
                                <button
                                    onClick={save}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                                >
                                    {saving ? '保存中...' : 'このアイコンで保存'}
                                </button>
                                {picked.length > 0 && (
                                    <button onClick={() => setPicked([])} className="text-xs text-gray-400 hover:text-gray-600">クリア</button>
                                )}
                                {msg && <span className="text-xs">{msg}</span>}
                            </div>

                            {cardsLoading ? (
                                <p className="text-gray-400 text-sm">カード取得中...</p>
                            ) : cards.length === 0 ? (
                                <p className="text-gray-400 text-sm">カードを取得できませんでした（デッキコード失効の可能性）。</p>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-[50vh] overflow-y-auto">
                                    {cards.map(c => {
                                        const on = picked.includes(c.imageUrl)
                                        const order = picked.indexOf(c.imageUrl)
                                        return (
                                            <button
                                                key={c.imageUrl}
                                                onClick={() => togglePick(c.imageUrl)}
                                                title={c.name}
                                                className={`relative aspect-[3/4] rounded overflow-hidden border-2 transition ${on ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent hover:border-gray-300'}`}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                                                {on && (
                                                    <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                                        {order + 1}
                                                    </span>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
