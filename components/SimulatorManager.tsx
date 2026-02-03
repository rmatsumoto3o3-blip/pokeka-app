'use client'

import { useState, useEffect } from 'react'
import { getDeckDataAction } from '@/app/actions'
import { calculateOpeningProbability, calculateRemainingInDeckProbability, calculatePrizeProbability, calculateRemainingDistribution, simulateCustomHandProbability } from '@/utils/probability'
import type { CardData } from '@/lib/deckParser'

interface SimulatorManagerProps {
    initialDeckCode?: string
}

export default function SimulatorManager({ initialDeckCode = '' }: SimulatorManagerProps) {
    const [deckCode, setDeckCode] = useState(initialDeckCode)
    const [loading, setLoading] = useState(false)
    const [cards, setCards] = useState<CardData[]>([])
    const [error, setError] = useState<string | null>(null)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    // Auto-Run if initialDeckCode is provided
    useEffect(() => {
        if (initialDeckCode) {
            handleSimulate(initialDeckCode)
        }
    }, [])

    const toggleRow = (id: string) => {
        const newSet = new Set(expandedRows)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setExpandedRows(newSet)
    }

    const handleSimulate = async (codeOverride?: string) => {
        const codeToUse = codeOverride || deckCode
        if (!codeToUse) return

        setLoading(true)
        setError(null)
        setCards([])
        setExpandedRows(new Set()) // Reset expansions

        try {
            const res = await getDeckDataAction(codeToUse)
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
                                                        {distribution.probabilities.map((prob, i) => (
                                                            <div key={i} className="flex items-center text-sm">
                                                                <div className="w-16 font-bold text-gray-700 text-right mr-3">{i}枚残る</div>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden relative">
                                                                    <div
                                                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                                                        style={{ width: `${prob * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="w-16 text-right font-mono text-gray-600 ml-3">{(prob * 100).toFixed(1)}%</div>
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

    // --- Custom Simulation Logic ---
    const [customTargets, setCustomTargets] = useState<{ id: string, name: string, deckQuantity: number, targetQuantity: number }[]>([])
    const [selectedCardId, setSelectedCardId] = useState<string>('')
    const [targetQtyInput, setTargetQtyInput] = useState<number>(1)
    const [simResult, setSimResult] = useState<string | null>(null)

    const handleAddCondition = () => {
        if (!selectedCardId) return
        const card = cards.find(c => c.name === selectedCardId) // ID is name for now
        if (!card) return

        // Prevent duplicates
        if (customTargets.some(t => t.id === card.name)) return

        setCustomTargets([...customTargets, {
            id: card.name,
            name: card.name,
            deckQuantity: card.quantity,
            targetQuantity: targetQtyInput
        }])
        setSimResult(null) // Reset result
    }

    const handleRemoveCondition = (id: string) => {
        setCustomTargets(customTargets.filter(t => t.id !== id))
        setSimResult(null)
    }

    const runCustomSimulation = () => {
        // Import dynamically or use the imported one
        // Using the imported function from top level
        const result = simulateCustomHandProbability(customTargets.map(t => ({
            id: t.id,
            deckQuantity: t.deckQuantity,
            targetQuantity: t.targetQuantity
        })))
        setSimResult(result)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Input Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-gray-700 mb-2">デッキコード</label>
                        <input
                            type="text"
                            value={deckCode}
                            onChange={(e) => setDeckCode(e.target.value)}
                            placeholder="例: pypMMy-xxxxxx-xxxxxx"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                    <button
                        onClick={() => handleSimulate()}
                        disabled={loading || !deckCode}
                        className={`px-6 py-2 rounded-lg font-bold text-white transition shadow-md whitespace-nowrap h-[42px] flex items-center justify-center min-w-[120px]
                            ${loading || !deckCode
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            '解析開始'
                        )}
                    </button>
                </div>
                {error && <p className="mt-2 text-red-500 text-sm font-bold">{error}</p>}

                {cards.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500 text-right">
                        合計: {cards.reduce((acc, c) => acc + c.quantity, 0)}枚
                    </div>
                )}
            </div>

            {/* Custom Hand Simulation Section */}
            {cards.length > 0 && (
                <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 rounded-xl shadow-sm border-2 border-violet-100 mb-10">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        カスタム初手確率シミュレーター
                        <span className="text-xs font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">Beta (モンテカルロ法 n=100,000)</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        デッキ内の特定のカードを指定して、「初手7枚にこの組み合わせが揃う確率」を計算します。<br />
                        例：「ボール系が1枚以上」かつ「たねポケモンが1枚以上」など
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">カードを選択</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                value={selectedCardId}
                                onChange={(e) => setSelectedCardId(e.target.value)}
                            >
                                <option value="">選択してください</option>
                                {cards.map((c, i) => (
                                    <option key={i} value={c.name}>{c.name} ({c.quantity}枚)</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">必要枚数</label>
                            <input
                                type="number"
                                min={1}
                                max={4}
                                value={targetQtyInput}
                                onChange={(e) => setTargetQtyInput(parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <button
                            onClick={handleAddCondition}
                            disabled={!selectedCardId}
                            className="bg-violet-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            条件を追加
                        </button>
                    </div>

                    {/* Condition List */}
                    {customTargets.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {customTargets.map((t, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-violet-200 shadow-sm animate-in fade-in slide-in-from-top-1">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-violet-100 text-violet-700 font-bold px-2 py-1 rounded text-xs">条件 {idx + 1}</span>
                                        <span className="font-bold text-gray-800">{t.name}</span>
                                        <span className="text-sm text-gray-500">が</span>
                                        <span className="font-bold text-violet-600 text-lg">{t.targetQuantity}枚</span>
                                        <span className="text-sm text-gray-500">以上</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCondition(t.id)}
                                        className="text-gray-400 hover:text-red-500 transition px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Calculate Button */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={runCustomSimulation}
                            disabled={customTargets.length === 0}
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                        >
                            確率を計算する 🎲
                        </button>

                        {simResult !== null && (
                            <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                <span className="text-sm font-bold text-gray-500">成功確率:</span>
                                <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                                    {simResult}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Results */}
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
