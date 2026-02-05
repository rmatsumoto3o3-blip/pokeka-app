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
                    <table className="min-w-[800px] md:min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            <tr>
                                <th className="px-2 md:px-4 py-3 text-center w-8 whitespace-nowrap"></th>
                                <th className="px-2 md:px-4 py-3 text-left w-16 whitespace-nowrap">画像</th>
                                <th className="px-2 md:px-4 py-3 text-left whitespace-nowrap">カード名</th>
                                <th className="px-2 md:px-4 py-3 text-center w-20 whitespace-nowrap">枚数</th>
                                <th className="px-2 md:px-4 py-3 text-center w-32 bg-pink-50 text-pink-700 whitespace-nowrap">初手率(7枚)</th>
                                <th className="px-2 md:px-4 py-3 text-center w-32 bg-orange-50 text-orange-700 whitespace-nowrap">サイド落ち(6枚)</th>
                                <th className="px-2 md:px-4 py-3 text-center w-32 bg-blue-50 text-blue-700 whitespace-nowrap">残山札率(47枚)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-xs md:text-sm">
                            {list.map((card, idx) => {
                                const rowId = `${title}-${idx}`
                                const distribution = calculateRemainingDistribution(card.quantity)
                                const isExpanded = expandedRows.has(rowId)

                                return (
                                    <>
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleRow(rowId)}>
                                            <td className="px-2 md:px-4 py-2 text-center text-gray-400">
                                                {isExpanded ? '▼' : '▶'}
                                            </td>
                                            <td className="px-2 md:px-4 py-2">
                                                <div className="relative w-8 h-11 md:w-10 md:h-14 bg-gray-200 rounded overflow-hidden shadow-sm">
                                                    {card.imageUrl ? (
                                                        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">img</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 md:px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                {card.name}
                                                {card.subtypes && <span className="ml-2 text-xs text-gray-400 font-normal">({card.subtypes.join(', ')})</span>}
                                            </td>
                                            <td className="px-2 md:px-4 py-2 text-center font-bold text-gray-900 whitespace-nowrap">{card.quantity}</td>
                                            <td className="px-2 md:px-4 py-2 text-center font-bold text-pink-600 bg-pink-50/30 whitespace-nowrap">
                                                {calculateOpeningProbability(card.quantity)}%
                                            </td>
                                            <td className="px-2 md:px-4 py-2 text-center font-bold text-orange-600 bg-orange-50/30 whitespace-nowrap">
                                                {calculatePrizeProbability(card.quantity)}%
                                            </td>
                                            <td className="px-2 md:px-4 py-2 text-center font-bold text-blue-600 bg-blue-50/30 whitespace-nowrap">
                                                {calculateRemainingInDeckProbability(card.quantity)}%
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={7} className="px-4 md:px-8 py-4">
                                                    <div className="text-xs font-bold text-gray-500 mb-2">山札に残る枚数の内訳 (47枚中)</div>
                                                    <div className="space-y-2">
                                                        {distribution.probabilities.map((prob, i) => (
                                                            <div key={i} className="flex items-center text-sm">
                                                                <div className="w-16 font-bold text-gray-700 text-right mr-3 whitespace-nowrap">{i}枚残る</div>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden relative">
                                                                    <div
                                                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                                                        style={{ width: `${prob * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="w-12 md:w-16 text-right font-mono text-gray-600 ml-3 whitespace-nowrap">{(prob * 100).toFixed(1)}%</div>
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
    // Multi-select state
    const [selectedCardNames, setSelectedCardNames] = useState<string[]>([])
    const [isSelectorOpen, setIsSelectorOpen] = useState(false)
    const [targetQtyInput, setTargetQtyInput] = useState<number>(1)
    const [simResult, setSimResult] = useState<string | null>(null)

    const handleToggleCardSelection = (cardName: string) => {
        if (selectedCardNames.includes(cardName)) {
            setSelectedCardNames(selectedCardNames.filter(n => n !== cardName))
        } else {
            setSelectedCardNames([...selectedCardNames, cardName])
        }
    }

    const handleAddCondition = () => {
        if (selectedCardNames.length === 0) return

        // Aggregate selected cards
        const selectedCards = cards.filter(c => selectedCardNames.includes(c.name))
        const totalDeckQty = selectedCards.reduce((acc, c) => acc + c.quantity, 0)

        // Generate Name
        const name = selectedCards.length === 1
            ? selectedCards[0].name
            : `${selectedCards[0].name} など (${selectedCards.length}種)`

        // Create unique ID for this condition
        const conditionId = `cond-${Date.now()}`

        setCustomTargets([...customTargets, {
            id: conditionId,
            name: name,
            deckQuantity: totalDeckQty,
            targetQuantity: targetQtyInput
        }])

        // Reset selections
        setSelectedCardNames([])
        setSimResult(null)
    }

    const handleRemoveCondition = (id: string) => {
        setCustomTargets(customTargets.filter(t => t.id !== id))
        setSimResult(null)
    }

    const handleUpdateQuantity = (id: string, newQty: number) => {
        setCustomTargets(customTargets.map(t =>
            t.id === id ? { ...t, targetQuantity: newQty } : t
        ))
        setSimResult(null)
    }

    const runCustomSimulation = () => {
        const result = simulateCustomHandProbability(customTargets.map(t => ({
            id: t.id,
            deckQuantity: t.deckQuantity,
            targetQuantity: t.targetQuantity
        })))
        setSimResult(result)
    }

    // Modal Component for Selection
    const CardSelectorModal = () => {
        if (!isSelectorOpen) return null

        // Group cards for easier selection
        const grouped = {
            pokemon: cards.filter(c => c.supertype === 'Pokémon'),
            trainer: cards.filter(c => c.supertype === 'Trainer'),
            energy: cards.filter(c => c.supertype === 'Energy'),
        }

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsSelectorOpen(false)} />
                <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">カードを選択 (複数可)</h3>
                        <button onClick={() => setIsSelectorOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold px-2">✕</button>
                    </div>

                    <div className="overflow-y-auto p-4 space-y-6 flex-1">
                        {Object.entries(grouped).map(([type, list]) => (
                            list.length > 0 && (
                                <div key={type}>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 sticky top-0 bg-white py-1">
                                        {type === 'pokemon' ? 'ポケモン' : type === 'trainer' ? 'トレーナーズ' : 'エネルギー'}
                                    </h4>
                                    <div className="space-y-1">
                                        {list.map((c, i) => {
                                            const isSelected = selectedCardNames.includes(c.name)
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => handleToggleCardSelection(c.name)}
                                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all active:scale-[0.98]
                                                        ${isSelected
                                                            ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500'
                                                            : 'border-gray-200 hover:border-violet-300 bg-white'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors
                                                        ${isSelected ? 'bg-violet-500 border-violet-500' : 'bg-white border-gray-300'}
                                                    `}>
                                                        {isSelected && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold text-gray-900">{c.name}</div>
                                                        <div className="text-xs text-gray-500">{c.quantity}枚</div>
                                                    </div>
                                                    {c.imageUrl && (
                                                        <img src={c.imageUrl} alt="" className="w-8 h-11 object-cover rounded shadow-sm opacity-80" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-600">
                            {selectedCardNames.length}枚選択中
                        </span>
                        <button
                            onClick={() => setIsSelectorOpen(false)}
                            className="bg-violet-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-violet-700 transition shadow-sm"
                        >
                            決定
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <CardSelectorModal />

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
                        <span className="text-xs font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">モンテカルロ法 (n=100,000)</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        デッキ内の特定のカードを指定して、「初手7枚にこの組み合わせが揃う確率」を計算します。<br />
                        複数のカードを選択して合計枚数として指定することも可能です（例：すべてのエネルギーから1枚）。
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end mb-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">カードを選択</label>
                            <button
                                onClick={() => setIsSelectorOpen(true)}
                                className={`w-full px-3 py-2 border rounded-lg text-sm text-left flex justify-between items-center transition-colors
                                    ${selectedCardNames.length > 0
                                        ? 'border-violet-500 bg-violet-50 text-violet-900 font-bold'
                                        : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                                    }`}
                            >
                                <span className="truncate">
                                    {selectedCardNames.length === 0
                                        ? 'カードを選択してください...'
                                        : selectedCardNames.length === 1
                                            ? selectedCardNames[0]
                                            : `${selectedCardNames.length}種類のカードを選択中`}
                                </span>
                                <span className="text-gray-400 text-xs ml-2">▼</span>
                            </button>
                        </div>
                        <div className="w-full md:w-24">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">必要枚数</label>
                            <select
                                value={targetQtyInput}
                                onChange={(e) => setTargetQtyInput(parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                    <option key={n} value={n}>{n}枚</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleAddCondition}
                            disabled={selectedCardNames.length === 0}
                            className="w-full md:w-auto bg-violet-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition whitespace-nowrap"
                        >
                            条件を追加
                        </button>
                    </div>

                    {/* Condition List */}
                    {customTargets.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {customTargets.map((t, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white px-4 py-3 rounded-lg border border-violet-200 shadow-sm animate-in fade-in slide-in-from-top-1 gap-2">
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full">
                                        <span className="font-bold text-gray-800 break-all">{t.name}</span>
                                        <select
                                            value={t.targetQuantity}
                                            onChange={(e) => handleUpdateQuantity(t.id, parseInt(e.target.value))}
                                            className="font-bold text-violet-600 text-lg bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-600 px-1 py-0 disabled:opacity-50"
                                        >
                                            {Array.from({ length: Math.min(7, t.deckQuantity) }, (_, i) => i + 1).map(n => (
                                                <option key={n} value={n}>{n}枚</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCondition(t.id)}
                                        className="text-gray-400 hover:text-red-500 transition px-2 self-end md:self-auto"
                                    >
                                        ✕ 削除
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Calculate Button */}
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <button
                            onClick={runCustomSimulation}
                            disabled={customTargets.length === 0}
                            className="w-full md:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                        >
                            確率を計算する 🎲
                        </button>

                        {simResult !== null && (
                            <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-300 bg-white md:bg-transparent p-2 rounded-lg md:p-0">
                                <span className="text-sm font-bold text-gray-500 whitespace-nowrap">成功確率:</span>
                                <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                                    {simResult}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Results */}
            {
                cards.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-4">🧮</div>
                        <h3 className="text-lg font-bold text-gray-900">確率シミュレーターの使い方</h3>
                        <p className="text-gray-600 mt-2">
                            デッキコードを入力すると、初手に特定のカードが来る確率や、<br />
                            サイド落ちせずに山札に残る確率を瞬時に計算します。
                        </p>
                    </div>
                )
            }

            {/* Results */}
            {
                cards.length > 0 && (
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
                )
            }
        </div >
    )
}
