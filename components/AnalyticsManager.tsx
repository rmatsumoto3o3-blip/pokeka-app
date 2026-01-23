'use client'

import { useState, useEffect } from 'react'

import { addDeckToAnalyticsAction, getDeckAnalyticsAction, removeDeckFromAnalyticsAction } from '@/app/actions'
import Image from 'next/image'

type Archetype = {
    id: string
    name: string
}

type AnalyticsResult = {
    decks: any[]
    analytics: {
        name: string
        imageUrl: string
        supertype: string
        subtypes?: string[]
        adoptionRate: number
        avgQuantity: number
    }[]
    totalDecks: number
}

export default function AnalyticsManager({ archetypes, userId }: { archetypes: Archetype[], userId: string }) {
    const [selectedArchetype, setSelectedArchetype] = useState<string>(archetypes.length > 0 ? archetypes[0].id : '')
    const [inputCode, setInputCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [data, setData] = useState<AnalyticsResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Initial load
    useEffect(() => {
        if (selectedArchetype) {
            refreshAnalytics(selectedArchetype)
        }
    }, [selectedArchetype])

    const refreshAnalytics = async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await getDeckAnalyticsAction(id)
            if (res.success && res.analytics) {
                setData({
                    decks: res.decks || [],
                    analytics: res.analytics,
                    totalDecks: res.totalDecks || 0
                })
            } else {
                setError(res.error || 'データの取得に失敗しました')
            }
        } catch (e) {
            setError('エラーが発生しました')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddDeck = async () => {
        if (!inputCode.trim() || !selectedArchetype) return

        // Extract code if URL is pasted
        let code = inputCode.trim()
        if (code.includes('pokemon-card.com')) {
            const match = code.match(/deckID\/([a-zA-Z0-9-]+)/)
            if (match && match[1]) {
                code = match[1]
            }
        }

        setIsAdding(true)
        setError(null)
        console.log('Adding deck:', code)

        try {
            const res = await addDeckToAnalyticsAction(code, selectedArchetype, userId)
            if (res.success) {
                console.log('Deck added successfully')
                setInputCode('')
                await refreshAnalytics(selectedArchetype)
                alert('デッキを追加しました！')
            } else {
                console.error('Add failed:', res.error)
                const msg = res.error || '追加に失敗しました'
                setError(msg)
                alert(msg) // Ensure user sees it
            }
        } catch (e) {
            console.error('Submit error:', e)
            setError('送信エラー')
            alert('送信中にエラーが発生しました')
        } finally {
            setIsAdding(false)
        }
    }

    const handleRemoveDeck = async (id: string) => {
        if (!confirm('このデッキデータを分析から除外しますか？')) return
        try {
            const res = await removeDeckFromAnalyticsAction(id, userId)
            if (res.success) {
                await refreshAnalytics(selectedArchetype)
            } else {
                alert(res.error || '削除失敗')
            }
        } catch (e) {
            alert('エラーが発生しました')
        }
    }

    // Categorize for display
    const categorizedCards = {
        pokemon: data?.analytics.filter(c => c.supertype === 'Pokémon') || [],
        goods: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Item')) || [], // Goods = Item
        tool: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Pokémon Tool')) || [],
        supporter: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Supporter')) || [],
        stadium: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Stadium')) || [],
        energy: data?.analytics.filter(c => c.supertype === 'Energy') || [],
    }

    // Helper render
    const renderCardGrid = (cards: typeof categorizedCards.pokemon, categoryName: string) => {
        if (cards.length === 0) return null
        return (
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 border-b pb-2 text-black">{categoryName}</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {cards.map((card, i) => (
                        <div key={i} className="relative group">
                            <div className="aspect-[2/3] relative">
                                <Image
                                    src={card.imageUrl}
                                    alt={card.name}
                                    fill
                                    className="object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <div className="mt-2 text-center text-xs space-y-1">
                                <div className="font-bold text-black">{card.name}</div>
                                <div className="inline-block bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    採用率 {card.adoptionRate.toFixed(1)}%
                                </div>
                                <div className="text-gray-700 font-medium">
                                    平均 {card.avgQuantity.toFixed(2)}枚
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Controls */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                分析対象のデッキタイプ (アーキタイプ)
                            </label>
                            <select
                                value={selectedArchetype}
                                onChange={(e) => setSelectedArchetype(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white text-gray-900"
                            >
                                {archetypes.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                デッキコードを追加
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value)}
                                    placeholder="ここへ公式デッキコードを入力"
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white text-gray-900"
                                />
                                <button
                                    onClick={handleAddDeck}
                                    disabled={isAdding || !inputCode}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isAdding ? '解析中...' : '追加'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">※1つずつ追加してください</p>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex justify-between">
                                <span>登録済みデッキ一覧</span>
                                <span className="text-gray-500 font-normal">Total: {data?.totalDecks || 0}</span>
                            </h4>
                            <div className="max-h-60 overflow-y-auto space-y-2 bg-gray-50 p-2 rounded">
                                {data?.decks.map((deck) => (
                                    <div key={deck.id} className="flex justify-between items-center text-sm p-2 bg-white rounded shadow-sm">
                                        <div className="font-mono text-gray-600">{deck.deck_code}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                                {new Date(deck.created_at).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveDeck(deck.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="分析から除外"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!data?.decks || data.decks.length === 0) && (
                                    <p className="text-gray-400 text-center text-sm">データがありません</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Key Card Preview (Text Summary) */}
                    {/* 
                         We could put a summary here, but the main visual is below.
                         Maybe instructions or "Key Metrics"? 
                     */}
                    <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                        <h4 className="font-bold mb-2">💡 分析のヒント</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>公式デッキ作成ツールや公式サイトのデッキコードを入力してください。</li>
                            <li>「追加」ボタンを押すと、自動的にカード情報が解析・保存されます。</li>
                            <li>明らかに異なるデッキタイプが混ざった場合は、ゴミ箱アイコンで除外してください。</li>
                            <li>下のエリアに、全登録デッキから算出された「採用率」と「平均枚数」が表示されます。</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            {isLoading && !data ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">データを集計中...</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-black border-l-4 border-indigo-500 pl-3">集計結果</h2>
                        {data && (
                            <div className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                                母数: <span className="font-bold text-black">{data.totalDecks}</span> デッキ
                            </div>
                        )}
                    </div>

                    {renderCardGrid(categorizedCards.pokemon, 'ポケモン')}
                    {renderCardGrid(categorizedCards.goods, 'グッズ')}
                    {renderCardGrid(categorizedCards.tool, 'ポケモンのどうぐ')}
                    {renderCardGrid(categorizedCards.supporter, 'サポート')}
                    {renderCardGrid(categorizedCards.stadium, 'スタジアム')}
                    {renderCardGrid(categorizedCards.energy, 'エネルギー')}
                </div>
            )}
        </div>
    )
}
