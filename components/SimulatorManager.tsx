'use client'

import { useState } from 'react'
import { getDeckDataAction } from '@/app/actions'
import { calculateOpeningProbability, calculateRemainingInDeckProbability, calculatePrizeProbability, calculateRemainingDistribution } from '@/utils/probability'
import type { CardData } from '@/lib/deckParser'

export default function SimulatorManager() {
    const [deckCode, setDeckCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [cards, setCards] = useState<CardData[]>([])
    const [error, setError] = useState<string | null>(null)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const toggleRow = (id: string) => {
        const newSet = new Set(expandedRows)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setExpandedRows(newSet)
    }

    const handleSimulate = async () => {
        if (!deckCode) return
        setLoading(true)
        setError(null)
        setCards([])
        setExpandedRows(new Set()) // Reset expansions

        try {
            const res = await getDeckDataAction(deckCode)
            if (res.success && res.data) {
                setCards(res.data)
            } else {
                setError(res.error || 'デッキデータの取得に失敗しました')
            }
        } catch (e) {
            setError('エラーが発生しました')
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // Categorize
    const categorizedCards = {
        pokemon: cards.filter(c => c.supertype === 'Pokémon'),
        trainer: cards.filter(c => c.supertype === 'Trainer'),
        energy: cards.filter(c => c.supertype === 'Energy'),
    }

    const renderCardTable = (title: string, list: CardData[]) => {
        if (list.length === 0) return null
        return (
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200 flex items-center gap-2">
                    {title}
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{list.length}種</span>
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-center w-8"></th>
                                <th className="px-4 py-3 text-left w-16">画像</th>
                                <th className="px-4 py-3 text-left">カード名</th>
                                <th className="px-4 py-3 text-center w-20">枚数</th>
                                <th className="px-4 py-3 text-center w-32 bg-pink-50 text-pink-700">初手率(7枚)</th>
                                <th className="px-4 py-3 text-center w-32 bg-orange-50 text-orange-700">サイド落ち(6枚)</th>
                                <th className="px-4 py-3 text-center w-32 bg-blue-50 text-blue-700">残山札率(47枚)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {list.map((card, idx) => {
                                const rowId = `${title}-${idx}`
                                const distribution = calculateRemainingDistribution(card.quantity)
                                const isExpanded = expandedRows.has(rowId)

                                return (
                                    <>
                                        <tr key={idx} className="text-sm hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleRow(rowId)}>
                                            <td className="px-4 py-2 text-center text-gray-400">
                                                {isExpanded ? '▼' : '▶'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="relative w-10 h-14 bg-gray-200 rounded overflow-hidden shadow-sm">
                                                    {card.imageUrl ? (
                                                        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">img</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 font-medium text-gray-900">
                                                {card.name}
                                                {card.subtypes && <span className="ml-2 text-xs text-gray-400">({card.subtypes.join(', ')})</span>}
                                            </td>
                                            <td className="px-4 py-2 text-center font-bold text-gray-900">{card.quantity}</td>
                                            <td className="px-4 py-2 text-center font-bold text-pink-600 bg-pink-50/30">
                                                {calculateOpeningProbability(card.quantity)}%
                                            </td>
                                            <td className="px-4 py-2 text-center font-bold text-orange-600 bg-orange-50/30">
                                                {calculatePrizeProbability(card.quantity)}%
                                            </td>
                                            <td className="px-4 py-2 text-center font-bold text-blue-600 bg-blue-50/30">
                                                {calculateRemainingInDeckProbability(card.quantity)}%
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={7} className="px-8 py-4">
                                                    <div className="text-xs font-bold text-gray-500 mb-2">山札に残る枚数の内訳 (47枚中)</div>
                                                    <div className="space-y-2">
                                                        {distribution.map((d, i) => (
                                                            <div key={i} className="flex items-center text-sm">
                                                                <div className="w-16 font-bold text-gray-700 text-right mr-3">{d.count}枚残る</div>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden relative">
                                                                    <div
                                                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                                                        style={{ width: `${d.prob}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="w-16 text-right font-mono text-gray-600 ml-3">{d.prob}%</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Input Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    公式デッキコード
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={deckCode}
                        onChange={(e) => setDeckCode(e.target.value)}
                        placeholder="例: pypMME-Ms3k6K-yMM3SX"
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3 border"
                    />
                    <button
                        onClick={handleSimulate}
                        disabled={loading || !deckCode}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-6 py-3 rounded-lg hover:shadow-md disabled:opacity-50 transition-all transform hover:scale-105"
                    >
                        {loading ? '計算中...' : 'シミュレーション開始'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2 text-sm font-bold">{error}</p>}
                <p className="text-xs text-gray-400 mt-2">
                    ※ 60枚のデッキで計算します。<br />
                    ※ 残山札率は、サイド6枚落ちを考慮した上で山札（47枚）に1枚以上残る確率です。<br />
                    ※ サイド落ち率は、残りの53枚から6枚が選ばれた確率です。
                </p>
            </div>

            {/* Application Info */}
            {cards.length === 0 && !loading && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="text-4xl mb-4">🧮</div>
                    <h3 className="text-lg font-bold text-gray-900">確率シミュレーターの使い方</h3>
                    <p className="text-gray-600 mt-2">
                        デッキコードを入力すると、初手に特定のカードが来る確率や、<br />
                        サイド落ちせずに山札に残る確率を瞬時に計算します。
                    </p>
                </div>
            )}

            {/* Results */}
            {cards.length > 0 && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-indigo-100 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-indigo-500 pl-4">
                            分析結果
                        </h2>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                            Total: {cards.reduce((acc, c) => acc + c.quantity, 0)}枚
                        </span>
                    </div>

                    {renderCardTable('ポケモン', categorizedCards.pokemon)}
                    {renderCardTable('グッズ・サポート・スタジアム', categorizedCards.trainer)}
                    {renderCardTable('エネルギー', categorizedCards.energy)}
                </div>
            )}
        </div>
    )
}
