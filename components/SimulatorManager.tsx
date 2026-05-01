'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { getDeckDataAction } from '@/app/actions'
import { calculateOpeningProbability, calculateRemainingInDeckProbability, calculatePrizeProbability, calculateRemainingDistribution, simulateCustomHandProbability, drawRandomHand, calculateMulliganProbability, calculateDrawByTurnProbability } from '@/utils/probability'
import type { CardData } from '@/lib/deckParser'

interface SimulatorManagerProps {
    initialDeckCode?: string
    initialCards?: CardData[]
    lang?: 'ja' | 'en'
}

export default function SimulatorManager({ initialDeckCode = '', initialCards = [], lang = 'ja' }: SimulatorManagerProps) {
    const [deckCode, setDeckCode] = useState(initialDeckCode)
    const [loading, setLoading] = useState(false)
    const [cards, setCards] = useState<CardData[]>(initialCards)
    const [error, setError] = useState<string | null>(null)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [simResult, setSimResult] = useState<{ and: string, or: string } | null>(null)
    const [randomHand, setRandomHand] = useState<CardData[]>([])
    const [drawByTurnCard, setDrawByTurnCard] = useState<string>('')
    const [drawByTurnN, setDrawByTurnN] = useState<number>(3)

    const isGlobal = initialCards.length > 0

    // Translations
    const t = {
        deckCode: lang === 'ja' ? 'デッキコード' : 'Deck List / Code',
        placeholder: lang === 'ja' ? '例: pypMMy-xxxxxx-xxxxxx' : 'Paste deck code or list...',
        startAnalysis: lang === 'ja' ? '解析開始' : 'Start Analysis',
        fetchError: lang === 'ja' ? 'デッキデータの取得に失敗しました' : 'Failed to retrieve deck data',
        unexpectedError: lang === 'ja' ? 'エラーが発生しました' : 'An unexpected error occurred',
        total: lang === 'ja' ? '合計' : 'Total',
        analysisResults: lang === 'ja' ? '分析結果' : 'Analysis Results',
        pokemon: lang === 'ja' ? 'ポケモン' : 'Pokémon',
        trainer: lang === 'ja' ? 'グッズ・サポート・スタジアム' : 'Trainers (Items/Supporters/Stadiums)',
        energy: lang === 'ja' ? 'エネルギー' : 'Energy',
        types: lang === 'ja' ? '種' : ' types',
        image: lang === 'ja' ? '画像' : 'Image',
        cardName: lang === 'ja' ? 'カード名' : 'Card Name',
        quantity: lang === 'ja' ? '枚数' : 'Qty',
        openingHand: lang === 'ja' ? '初手率(7枚)' : 'Opening Hand (7)',
        prizeRisk: lang === 'ja' ? 'サイド落ち(6枚)' : 'Prize Risk (6)',
        remainingInDeck: lang === 'ja' ? '残山札率(47枚)' : 'In Deck (47)',
        distributionCaption: lang === 'ja' ? '山札に残る枚数の内訳 (47枚中)' : 'Remaining in Deck Distribution (out of 47)',
        remainingLabel: lang === 'ja' ? '枚残る' : ' left',
        customSimulator: lang === 'ja' ? 'カスタム初手確率シミュレーター' : 'Custom Hand Probability Simulator',
        monteCarlo: lang === 'ja' ? 'モンテカルロ法' : 'Monte Carlo Method',
        customDesc: lang === 'ja'
            ? 'デッキ内の特定のカードを指定して、「初手7枚にこの組み合わせが揃う確率」を計算します。複数のカードを選択して合計枚数として指定することも可能です。'
            : 'Select specific cards to calculate the probability of having them in your opening hand of 7. You can group multiple cards together (e.g., any Energy).',
        selectCard: lang === 'ja' ? 'カードを選択' : 'Select Card',
        requiredQty: lang === 'ja' ? '必要枚数' : 'Req. Qty',
        addCondition: lang === 'ja' ? '条件を追加' : 'Add Condition',
        delete: lang === 'ja' ? '削除' : 'Delete',
        calculate: lang === 'ja' ? '確率を計算する' : 'Calculate Probability',
        successProb: lang === 'ja' ? '成功確率' : 'Success Probability',
        usageTitle: lang === 'ja' ? '確率シミュレーターの使い方' : 'How to use Simulator',
        usageDesc: lang === 'ja'
            ? 'デッキコードを入力すると、初手に特定のカードが来る確率や、サイド落ちせずに山札に残る確率を瞬時に計算します。'
            : 'Enter a deck code/list to instantly calculate probabilities for opening hands, prize card risks, and remaining deck distributions.',
        pcs: lang === 'ja' ? '枚' : ' pcs',
        selectModalTitle: lang === 'ja' ? 'カードを選択 (複数可)' : 'Select Cards (Multiple)',
        confirm: lang === 'ja' ? '決定' : 'Done',
        selectedCount: lang === 'ja' ? '枚選択中' : ' selected',
        noImage: lang === 'ja' ? 'No Image' : 'No Image',
        andProb: lang === 'ja' ? 'すべて引く確率 (AND)' : 'All Met (AND)',
        orProb: lang === 'ja' ? 'どれか引く確率 (OR)' : 'At least one (OR)',
        sampleHand: lang === 'ja' ? '初手ドロー（例）' : 'Sample Opening Hand',
        drawAgain: lang === 'ja' ? 'もう一度引く' : 'Draw Again',
    }

    const handleSimulate = useCallback(async (codeOverride?: string) => {
        const codeToUse = codeOverride || deckCode
        if (!codeToUse) return

        setLoading(true)
        setError(null)
        setCards([])
        setExpandedRows(new Set())

        try {
            const res = await getDeckDataAction(codeToUse)
            if (res.success && res.data) {
                setCards(res.data)
            } else {
                setError(res.error || t.fetchError)
            }
        } catch (e) {
            setError(t.unexpectedError)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [deckCode, t.fetchError, t.unexpectedError])

    const toggleRow = (id: string) => {
        const newSet = new Set(expandedRows)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setExpandedRows(newSet)
    }

    // Auto-Run if initialDeckCode is provided
    useEffect(() => {
        if (initialDeckCode) {
            handleSimulate(initialDeckCode)
        }
    }, [initialDeckCode, handleSimulate])

    // Update internal cards if external initialCards changes
    useEffect(() => {
        if (initialCards && initialCards.length > 0) {
            setCards(initialCards)
        }
    }, [initialCards])

    // Auto-draw when cards are loaded
    useEffect(() => {
        if (cards.length > 0 && randomHand.length === 0) {
            const hand = drawRandomHand(cards)
            setRandomHand(hand)
        }
    }, [cards, randomHand.length])

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
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{list.length}{t.types}</span>
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full md:min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider">
                            <tr>
                                <th className="px-2 md:px-4 py-3 text-center w-8 whitespace-nowrap"></th>
                                <th className="px-2 md:px-4 py-3 text-left w-16 whitespace-nowrap">{t.image}</th>
                                <th className="px-2 md:px-4 py-3 text-left whitespace-nowrap">{t.cardName}</th>
                                <th className="px-2 md:px-4 py-3 text-center w-20 whitespace-nowrap">{t.quantity}</th>
                                <th className="hidden md:table-cell px-2 md:px-4 py-3 text-center w-32 bg-pink-50 text-pink-700 whitespace-nowrap">{t.openingHand}</th>
                                <th className="hidden md:table-cell px-2 md:px-4 py-3 text-center w-32 bg-orange-50 text-orange-700 whitespace-nowrap">{t.prizeRisk}</th>
                                <th className="hidden md:table-cell px-2 md:px-4 py-3 text-center w-32 bg-blue-50 text-blue-700 whitespace-nowrap">{t.remainingInDeck}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-xs md:text-sm">
                            {list.map((card, idx) => {
                                const rowId = `${title}-${idx}`
                                const distribution = calculateRemainingDistribution(card.quantity)
                                const isExpanded = expandedRows.has(rowId)

                                return (
                                    <React.Fragment key={idx}>
                                        <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleRow(rowId)}>
                                            <td className="px-2 md:px-4 py-2 text-center text-gray-400">
                                                {isExpanded ? '▼' : '▶'}
                                            </td>
                                            <td className="px-2 md:px-4 py-2">
                                                <div className="relative w-8 h-11 md:w-10 md:h-14 bg-gray-200 rounded overflow-hidden shadow-sm flex items-center justify-center">
                                                    {card.imageUrl ? (
                                                        <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                                    ) : (
                                                        <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase">{t.noImage}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 md:px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                {card.name}
                                                {card.subtypes && <span className="ml-2 text-xs text-gray-400 font-normal">({card.subtypes.join(', ')})</span>}
                                            </td>
                                            <td className="px-2 md:px-4 py-2 text-center font-bold text-gray-900 whitespace-nowrap">{card.quantity}</td>
                                            <td className="hidden md:table-cell px-2 md:px-4 py-2 text-center font-bold text-pink-600 bg-pink-50/30 whitespace-nowrap">
                                                {calculateOpeningProbability(card.quantity)}%
                                            </td>
                                            <td className="hidden md:table-cell px-2 md:px-4 py-2 text-center font-bold text-orange-600 bg-orange-50/30 whitespace-nowrap">
                                                {calculatePrizeProbability(card.quantity)}%
                                            </td>
                                            <td className="hidden md:table-cell px-2 md:px-4 py-2 text-center font-bold text-blue-600 bg-blue-50/30 whitespace-nowrap">
                                                {calculateRemainingInDeckProbability(card.quantity)}%
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={7} className="px-4 md:px-8 py-4">
                                                    {/* Mobile View: Simple Stats */}
                                                    <div className="md:hidden grid grid-cols-1 gap-3">
                                                        <div className="bg-white p-3 rounded-lg border border-pink-100 flex justify-between items-center shadow-sm">
                                                            <span className="text-sm font-bold text-gray-600">{t.openingHand}</span>
                                                            <span className="text-lg font-black text-pink-600">{calculateOpeningProbability(card.quantity)}%</span>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg border border-orange-100 flex justify-between items-center shadow-sm">
                                                            <span className="text-sm font-bold text-gray-600">{t.prizeRisk}</span>
                                                            <span className="text-lg font-black text-orange-600">{calculatePrizeProbability(card.quantity)}%</span>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg border border-blue-100 flex justify-between items-center shadow-sm">
                                                            <span className="text-sm font-bold text-gray-600">{t.remainingInDeck}</span>
                                                            <span className="text-lg font-black text-blue-600">{calculateRemainingInDeckProbability(card.quantity)}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Desktop View: Distribution Graph */}
                                                    <div className="hidden md:block">
                                                        <div className="text-xs font-bold text-gray-500 mb-2">{t.distributionCaption}</div>
                                                        <div className="space-y-2">
                                                            {distribution.probabilities.map((prob, i) => (
                                                                <div key={i} className="flex items-center text-sm">
                                                                    <div className="w-16 font-bold text-gray-700 text-right mr-3 whitespace-nowrap">{i}{t.remainingLabel}</div>
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
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
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
            : `${selectedCards[0].name} ${lang === 'ja' ? 'など' : 'etc'} (${selectedCards.length}${t.types})`

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

        // Draw random hand
        const hand = drawRandomHand(cards)
        setRandomHand(hand)
    }

    const handleDrawAgain = () => {
        const hand = drawRandomHand(cards)
        setRandomHand(hand)
    }

    // Modal Component for Selection (Render Function to prevent remounting)
    const renderCardSelectorModal = () => {
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
                        <h3 className="font-bold text-gray-800">{t.selectModalTitle}</h3>
                        <button onClick={() => setIsSelectorOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold px-2">✕</button>
                    </div>

                    <div className="overflow-y-auto p-4 space-y-6 flex-1">
                        {Object.entries(grouped).map(([type, list]) => (
                            list.length > 0 && (
                                <div key={type}>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 sticky top-0 bg-white py-1">
                                        {type === 'pokemon' ? t.pokemon : type === 'trainer' ? (lang === 'ja' ? 'トレーナーズ' : 'Trainers') : t.energy}
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
                                                        <div className="text-xs text-gray-500">{c.quantity}{t.pcs}</div>
                                                    </div>
                                                    {c.imageUrl && (
                                                        <div className="relative w-8 h-11 shrink-0">
                                                            <Image src={c.imageUrl} alt="" fill className="object-cover rounded shadow-sm opacity-80" unoptimized />
                                                        </div>
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
                            {selectedCardNames.length}{t.selectedCount}
                        </span>
                        <button
                            onClick={() => setIsSelectorOpen(false)}
                            className="bg-violet-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-violet-700 transition shadow-sm"
                        >
                            {t.confirm}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {renderCardSelectorModal()}

            {/* Input Section - Hide if Cards are already loaded (Global Mode) */}
            {!isGlobal && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t.deckCode}</label>
                            <input
                                type="text"
                                value={deckCode}
                                onChange={(e) => setDeckCode(e.target.value)}
                                placeholder={t.placeholder}
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
                                t.startAnalysis
                            )}
                        </button>
                    </div>
                    {error && <p className="mt-2 text-red-500 text-sm font-bold">{error}</p>}

                    {cards.length > 0 && (
                        <div className="mt-2 text-sm text-gray-500 text-right">
                            {t.total}: {cards.reduce((acc, c) => acc + c.quantity, 0)}{t.pcs}
                        </div>
                    )}
                </div>
            )}

            {/* Random Hand Display (Quick Draw) - Show as soon as cards are loaded */}
            {cards.length > 0 && randomHand.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-violet-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">🃏</span> {t.sampleHand}
                        </h4>
                        <button
                            onClick={handleDrawAgain}
                            className="text-sm font-bold text-violet-600 hover:text-violet-800 bg-violet-50 px-4 py-2 rounded-full border border-violet-100 shadow-sm transition active:scale-95 flex items-center gap-2"
                        >
                            <span className="text-base">🔄</span> {t.drawAgain}
                        </button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {randomHand.map((c, i) => (
                            <div key={i} className="relative aspect-[63/88] rounded-lg overflow-hidden bg-gray-100 shadow-md group border border-gray-50">
                                {c.imageUrl ? (
                                    <Image
                                        src={c.imageUrl}
                                        alt={c.name}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-110"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 font-bold p-1 text-center">
                                        {c.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mulligan Probability */}
            {cards.length > 0 && (() => {
                const basics = cards.filter(c => c.supertype === 'Pokémon' && c.subtypes?.includes('Basic'))
                const totalBasics = basics.reduce((acc, c) => acc + c.quantity, 0)
                const mulliganRate = calculateMulliganProbability(totalBasics)
                const mulliganNum = parseFloat(mulliganRate)
                const color = mulliganNum <= 5 ? 'green' : mulliganNum <= 15 ? 'yellow' : 'red'
                const colorMap = {
                    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', num: 'text-green-600' },
                    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', num: 'text-yellow-600' },
                    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', num: 'text-red-600' },
                }
                const c = colorMap[color]
                return (
                    <div className={`${c.bg} border ${c.border} rounded-xl p-5 flex items-center justify-between animate-in fade-in duration-500`}>
                        <div>
                            <div className={`font-bold text-sm ${c.text} mb-1`}>
                                🔄 {lang === 'ja' ? 'マリガン確率' : 'Mulligan Rate'}
                            </div>
                            <div className={`text-xs ${c.text} opacity-70`}>
                                {lang === 'ja'
                                    ? `たねポケモン ${totalBasics}枚 / 初手7枚に1枚もない確率`
                                    : `${totalBasics} Basic Pokémon — chance of no Basic in opening 7`}
                            </div>
                        </div>
                        <div className={`text-4xl font-black ${c.num}`}>{mulliganRate}%</div>
                    </div>
                )
            })()}

            {/* Custom Hand Simulation Section */}
            {cards.length > 0 && (
                <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 rounded-xl shadow-sm border-2 border-violet-100 mb-10">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        {t.customSimulator}
                        <span className="text-xs font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">{t.monteCarlo} (n=100,000)</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        {t.customDesc}
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end mb-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{t.selectCard}</label>
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
                                        ? (lang === 'ja' ? 'カードを選択してください...' : 'Select cards...')
                                        : selectedCardNames.length === 1
                                            ? selectedCardNames[0]
                                            : `${selectedCardNames.length} ${lang === 'ja' ? '種類のカードを選択中' : 'cards selected'}`}
                                </span>
                                <span className="text-gray-400 text-xs ml-2">▼</span>
                            </button>
                        </div>
                        <div className="w-full md:w-24">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{t.requiredQty}</label>
                            <select
                                value={targetQtyInput}
                                onChange={(e) => setTargetQtyInput(parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                    <option key={n} value={n}>{n}{t.pcs}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleAddCondition}
                            disabled={selectedCardNames.length === 0}
                            className="w-full md:w-auto bg-violet-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition whitespace-nowrap"
                        >
                            {t.addCondition}
                        </button>
                    </div>

                    {/* Condition List */}
                    {customTargets.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {customTargets.map((t_item, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white px-4 py-3 rounded-lg border border-violet-200 shadow-sm animate-in fade-in slide-in-from-top-1 gap-2">
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full">
                                        <span className="font-bold text-gray-800 break-all">{t_item.name}</span>
                                        <select
                                            value={t_item.targetQuantity}
                                            onChange={(e) => handleUpdateQuantity(t_item.id, parseInt(e.target.value))}
                                            className="font-bold text-violet-600 text-lg bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-600 px-1 py-0 disabled:opacity-50"
                                        >
                                            {Array.from({ length: Math.min(7, t_item.deckQuantity) }, (_, i) => i + 1).map(n => (
                                                <option key={n} value={n}>{n}{t.pcs}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCondition(t_item.id)}
                                        className="text-gray-400 hover:text-red-500 transition px-2 self-end md:self-auto flex items-center gap-1"
                                    >
                                        <span className="text-xs">✕</span> {t.delete}
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
                            {t.calculate} 🎲
                        </button>

                        {simResult !== null && (
                            <div className="flex flex-col gap-4 w-full md:w-auto animate-in fade-in zoom-in duration-300">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-violet-100 shadow-sm flex flex-col items-center min-w-[140px]">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{t.andProb}</span>
                                        <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                                            {simResult.and}%
                                        </span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-fuchsia-100 shadow-sm flex flex-col items-center min-w-[140px]">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{t.orProb}</span>
                                        <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-500">
                                            {simResult.or}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Draw by Turn Calculator */}
            {cards.length > 0 && (() => {
                const selectedCard = cards.find(c => c.name === drawByTurnCard)
                const prob = selectedCard ? calculateDrawByTurnProbability(selectedCard.quantity, drawByTurnN) : null
                return (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border-2 border-blue-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-2xl">📅</span>
                            {lang === 'ja' ? 'ターン別引ける確率' : 'Draw by Turn Calculator'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">
                            {lang === 'ja'
                                ? '指定したターンまでに、そのカードを1枚以上引いている確率を計算します（初手7枚 + 毎ターン1ドロー）'
                                : 'Probability of drawing at least 1 copy of a card by turn N (7-card opening hand + 1 draw per turn)'}
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{lang === 'ja' ? 'カード' : 'Card'}</label>
                                <select
                                    value={drawByTurnCard}
                                    onChange={e => setDrawByTurnCard(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="">{lang === 'ja' ? 'カードを選択...' : 'Select a card...'}</option>
                                    {cards.map((c, i) => (
                                        <option key={i} value={c.name}>{c.name} ×{c.quantity}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full md:w-40">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{lang === 'ja' ? 'ターン数' : 'By Turn'}</label>
                                <select
                                    value={drawByTurnN}
                                    onChange={e => setDrawByTurnN(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 10].map(n => (
                                        <option key={n} value={n}>{lang === 'ja' ? `${n}ターン目まで` : `Turn ${n}`}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {prob !== null && (
                            <div className="mt-4 bg-white rounded-xl p-4 border border-blue-100 flex items-center justify-between animate-in fade-in duration-300">
                                <div className="text-sm text-gray-600 font-medium">
                                    {lang === 'ja'
                                        ? `${drawByTurnCard} を${drawByTurnN}ターン目までに引ける確率`
                                        : `Probability of drawing ${drawByTurnCard} by Turn ${drawByTurnN}`}
                                </div>
                                <div className="text-4xl font-black text-blue-600">{prob}%</div>
                            </div>
                        )}
                        {prob !== null && selectedCard && (
                            <div className="mt-3 grid grid-cols-4 md:grid-cols-8 gap-2">
                                {[1,2,3,4,5,6,7,8].map(n => {
                                    const p = parseFloat(calculateDrawByTurnProbability(selectedCard.quantity, n))
                                    return (
                                        <div key={n} className={`text-center p-2 rounded-lg border text-xs font-bold ${n === drawByTurnN ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                                            <div className="opacity-60">{lang === 'ja' ? `T${n}` : `T${n}`}</div>
                                            <div>{p}%</div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })()}

            {/* Results */}
            {
                cards.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="mb-4 flex justify-center">
                            <Image
                                src="/king.png"
                                alt="Simulator"
                                width={48}
                                height={48}
                                className="w-12 h-12"
                            />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{t.usageTitle}</h3>
                        <p className="text-gray-600 mt-2 px-4 whitespace-pre-line">
                            {t.usageDesc}
                        </p>
                    </div>
                )
            }

            {/* Results Table */}
            {
                cards.length > 0 && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-indigo-100 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-indigo-500 pl-4">
                                {t.analysisResults}
                            </h2>
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                                {t.total}: {cards.reduce((acc, c) => acc + c.quantity, 0)}{t.pcs}
                            </span>
                        </div>

                        {renderCardTable(t.pokemon, categorizedCards.pokemon)}
                        {renderCardTable(t.trainer, categorizedCards.trainer)}
                        {renderCardTable(t.energy, categorizedCards.energy)}
                    </div>
                )
            }
        </div >
    )
}
