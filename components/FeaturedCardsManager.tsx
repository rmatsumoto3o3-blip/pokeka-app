'use client'

import { useState, useEffect } from 'react'
import { getFeaturedCardsWithStatsAction, manageFeaturedCardsAction, updateDailySnapshotsAction, getTopAdoptedCardsAction, backfillTrendDataAction } from '@/app/actions'

export default function FeaturedCardsManager({ userId }: { userId: string }) {
    const [cards, setCards] = useState<{ id: string, card_name: string }[]>([])
    const [newCardName, setNewCardName] = useState('')
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [updateResult, setUpdateResult] = useState<string | null>(null)

    // Suggestions State
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState<{ name: string, count: number, rate: number, imageUrl: string | null }[]>([])
    const [suggestionsLoading, setSuggestionsLoading] = useState(false)
    const [addingSuggestionName, setAddingSuggestionName] = useState<string | null>(null)

    const fetchCards = async () => {
        const res = await getFeaturedCardsWithStatsAction()
        if (res.success && res.data) {
            setCards(res.data.map(d => ({ id: d.id, card_name: d.card_name })))
        }
        setLoading(false)
    }

    const handleLoadSuggestions = async () => {
        setShowSuggestions(true)
        setSuggestionsLoading(true)
        const res = await getTopAdoptedCardsAction()
        if (res.success && res.data) {
            setSuggestions(res.data)
        }
        setSuggestionsLoading(false)
    }

    const handleAddFromSuggestion = async (name: string) => {
        if (addingSuggestionName) return
        setAddingSuggestionName(name)

        const res = await manageFeaturedCardsAction('add', name)

        if (res.success) {
            await fetchCards()
            setAddingSuggestionName(null)
        } else {
            alert('追加に失敗しました: ' + res.error)
            setAddingSuggestionName(null)
        }
    }

    // Check if card is already added
    const isAlreadyAdded = (name: string) => cards.some(c => c.card_name === name)

    useEffect(() => {
        fetchCards()
    }, [])

    const handleAdd = async () => {
        if (!newCardName) return
        setActionLoading(true)
        const res = await manageFeaturedCardsAction('add', newCardName)
        if (res.success) {
            setNewCardName('')
            fetchCards()
        } else {
            alert('追加に失敗しました: ' + res.error)
        }
        setActionLoading(false)
    }

    const handleRemove = async (id: string) => {
        if (!confirm('削除しますか？')) return
        setActionLoading(true)
        const res = await manageFeaturedCardsAction('remove', undefined, id)
        if (res.success) {
            fetchCards()
        } else {
            alert('削除に失敗しました: ' + res.error)
        }
        setActionLoading(false)
    }

    const handleUpdateSnapshots = async () => {
        if (!confirm('直近30日のデッキを集計してスナップショットを更新します。よろしいですか？')) return
        setActionLoading(true)
        setUpdateResult(null)
        const res = await updateDailySnapshotsAction(userId)
        if (res.success) {
            setUpdateResult(`更新成功: ${res.count}件のデータを記録しました`)
        } else {
            alert('更新失敗: ' + res.error)
        }
        setActionLoading(false)
    }

    const handleBackfill = async () => {
        if (!confirm('1月23日〜31日の過去データを集計します。時間がかかる可能性があります。よろしいですか？')) return
        setActionLoading(true)
        setUpdateResult(null)
        const res = await backfillTrendDataAction(userId)
        if (res.success) {
            setUpdateResult(`過去データ更新成功: ${res.count}件のデータを記録しました`)
        } else {
            alert('更新失敗: ' + res.error)
        }
        setActionLoading(false)
    }

    if (loading) return <div>読み込み中...</div>

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: List & Add */}
                <div className="flex-1">
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newCardName}
                            onChange={(e) => setNewCardName(e.target.value)}
                            placeholder="カード名 (例: ナンジャモ)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!newCardName || actionLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            追加
                        </button>
                    </div>

                    <button
                        onClick={handleLoadSuggestions}
                        className="text-sm text-purple-600 font-bold mb-4 hover:underline flex items-center"
                    >
                        ✨ おすすめから追加 (直近30日の採用率)
                    </button>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {cards.length === 0 ? (
                            <div className="p-4 text-gray-500 text-center">登録されたカードはありません</div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {cards.map(card => (
                                    <li key={card.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                        <span className="font-bold text-gray-800">{card.card_name}</span>
                                        <button
                                            onClick={() => handleRemove(card.id)}
                                            disabled={actionLoading}
                                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                                        >
                                            削除
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right: Update Action */}
                <div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg border border-gray-200 h-fit">
                    <h5 className="font-bold text-gray-700 mb-2">データ更新</h5>
                    <p className="text-xs text-gray-500 mb-4">
                        登録されたカードの採用率を集計し、本日の日付で記録します。グラフに反映させるにはこのボタンを押してください。
                    </p>
                    <button
                        onClick={handleUpdateSnapshots}
                        disabled={actionLoading || cards.length === 0}
                        className="w-full bg-green-600 text-white py-2 rounded-md font-bold hover:bg-green-700 disabled:opacity-50 shadow-sm"
                    >
                        {actionLoading ? '処理中...' : '集計＆更新を実行'}
                    </button>
                    {updateResult && (
                        <div className="mt-2 text-xs text-green-700 font-bold bg-green-100 p-2 rounded">
                            {updateResult}
                        </div>
                    )}

                    <hr className="my-4 border-gray-200" />
                    <button
                        onClick={handleBackfill}
                        disabled={actionLoading || cards.length === 0}
                        className="w-full bg-gray-500 text-white py-2 rounded-md font-bold hover:bg-gray-600 disabled:opacity-50 shadow-sm text-xs"
                    >
                        {actionLoading ? '処理中...' : '過去データ集計 (1/23-1/31)'}
                    </button>
                </div>
            </div>

            {/* Suggestions Modal */}
            {showSuggestions && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-lg text-gray-900">✨ おすすめカード (直近30日)</h3>
                            <button onClick={() => setShowSuggestions(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
                            {suggestionsLoading ? (
                                <div className="p-8 text-center text-gray-500">集計中...</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {suggestions.map((s, i) => {
                                        const added = isAlreadyAdded(s.name)
                                        const loading = addingSuggestionName === s.name

                                        return (
                                            <div
                                                key={s.name}
                                                onClick={() => !added && !loading && handleAddFromSuggestion(s.name)}
                                                className={`
                                                    relative group bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer transition-all
                                                    ${added ? 'opacity-50 border-green-300' : 'hover:shadow-md hover:border-purple-300 hover:-translate-y-1'}
                                                `}
                                            >
                                                {/* Rank Badge */}
                                                <div className="absolute top-1 left-1 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                    #{i + 1}
                                                </div>

                                                {/* Rate Badge */}
                                                <div className="absolute top-1 right-1 z-10 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shadow-sm">
                                                    {s.rate}%
                                                </div>

                                                {/* Image */}
                                                <div className="aspect-[2/3] relative bg-gray-100">
                                                    {s.imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                                    )}

                                                    {/* Hover Overlay */}
                                                    {!added && (
                                                        <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-colors flex items-center justify-center">
                                                            <div className="opacity-0 group-hover:opacity-100 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                                追加
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Added Overlay */}
                                                    {added && (
                                                        <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center">
                                                            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                                                                追加済
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Loading Overlay */}
                                                    {loading && (
                                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Name Footer */}
                                                <div className="p-2 text-center border-t border-gray-100">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{s.name}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
