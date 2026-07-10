'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { getDeckDataAction } from '@/app/actions'
import { calculateOpeningProbability, calculateRemainingInDeckProbability, calculatePrizeProbability, calculateRemainingDistribution, simulateCustomHandProbability, drawHandAndPrizes, calculateDrawByTurnProbability, simulateNextDrawProbability, drawTargetWithinDraws, type NextDrawResult } from '@/utils/probability'
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
    const [prizeCards, setPrizeCards] = useState<CardData[]>([])
    const [drawByTurnCard, setDrawByTurnCard] = useState<string>('')
    const [drawByTurnN, setDrawByTurnN] = useState<number>(3)
    const [nextDraw, setNextDraw] = useState<NextDrawResult[]>([])
    const [trashedNames, setTrashedNames] = useState<string[]>([])
    const [nextDrawOpen, setNextDrawOpen] = useState<boolean>(false)
    // 盤面カスタム確率
    const [boardExclude, setBoardExclude] = useState<Record<string, number>>({})
    const [targetCard, setTargetCard] = useState<string>('')
    const [drawCount, setDrawCount] = useState<number>(3)
    const [boardOpen, setBoardOpen] = useState<boolean>(false)

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

    // デッキ読み込み時に初手7枚＋サイド6枚を引く（トラッシュ・盤面指定もリセット）
    useEffect(() => {
        setTrashedNames([])
        setBoardExclude({})
        setTargetCard('')
        if (cards.length > 0) {
            const { hand, prizes } = drawHandAndPrizes(cards)
            setRandomHand(hand)
            setPrizeCards(prizes)
        } else {
            setRandomHand([])
            setPrizeCards([])
        }
    }, [cards])

    // 次の1枚予測を計算（初手7枚・サイド6枚・トラッシュを山札から抜いて再計算）
    useEffect(() => {
        if (cards.length === 0 || randomHand.length === 0) { setNextDraw([]); return }
        const handNames = randomHand.map(c => c.name)
        const prizeNames = prizeCards.map(c => c.name)
        setNextDraw(simulateNextDrawProbability(cards, [...handNames, ...prizeNames, ...trashedNames]))
    }, [cards, randomHand, prizeCards, trashedNames])

    // クリックで1枚ずつトラッシュへ。デッキ採用枚数に達したら0に戻す
    const cycleTrash = (name: string, maxQty: number) => {
        setTrashedNames(prev => {
            const current = prev.filter(n => n === name).length
            const others = prev.filter(n => n !== name)
            if (current >= maxQty) return others // リセット
            return [...others, ...Array(current + 1).fill(name)]
        })
    }

    // 盤面カスタム: 山札にない枚数を増減（0〜採用枚数）
    const adjustBoard = (name: string, delta: number, maxQty: number) => {
        setBoardExclude(prev => {
            const next = Math.max(0, Math.min(maxQty, (prev[name] || 0) + delta))
            return { ...prev, [name]: next }
        })
    }

    // 盤面カスタムの残り山札・確率を計算
    const deckTotalCount = cards.reduce((s, c) => s + c.quantity, 0)
    const boardExcludedTotal = Object.values(boardExclude).reduce((s, v) => s + v, 0)
    const remainingDeckCount = deckTotalCount - boardExcludedTotal
    const targetCardData = cards.find(c => c.name === targetCard)
    const targetRemaining = targetCardData
        ? targetCardData.quantity - (boardExclude[targetCard] || 0)
        : 0
    const boardProbability = targetCardData
        ? drawTargetWithinDraws(targetRemaining, remainingDeckCount, drawCount)
        : null

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
                                <th className="hidden md:table-cell px-2 md:px-4 py-3 text-center w-32 bg-blue-50 text-blue-700 whitespace-nowrap">{t.openingHand}</th>
                                <th className="hidden md:table-cell px-2 md:px-4 py-3 text-center w-32 bg-blue-50 text-blue-700 whitespace-nowrap">{t.prizeRisk}</th>
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
                                                    <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase">{t.noImage}</span>
                                                    {card.imageUrl && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={card.imageUrl} alt={card.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.remove()} />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 md:px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                {card.name}
                                                {card.subtypes && <span className="ml-2 text-xs text-gray-400 font-normal">({card.subtypes.join(', ')})</span>}
                                            </td>
                                            <td className="px-2 md:px-4 py-2 text-center font-bold text-gray-900 whitespace-nowrap">{card.quantity}</td>
                                            <td className="hidden md:table-cell px-2 md:px-4 py-2 text-center font-bold text-blue-600 bg-blue-50/30 whitespace-nowrap">
                                                {calculateOpeningProbability(card.quantity)}%
                                            </td>
                                            <td className="hidden md:table-cell px-2 md:px-4 py-2 text-center font-bold text-blue-600 bg-blue-50/30 whitespace-nowrap">
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
                                                        <div className="bg-white p-3 rounded-lg border border-blue-100 flex justify-between items-center shadow-sm">
                                                            <span className="text-sm font-bold text-gray-600">{t.openingHand}</span>
                                                            <span className="text-lg font-black text-blue-600">{calculateOpeningProbability(card.quantity)}%</span>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg border border-blue-100 flex justify-between items-center shadow-sm">
                                                            <span className="text-sm font-bold text-gray-600">{t.prizeRisk}</span>
                                                            <span className="text-lg font-black text-blue-600">{calculatePrizeProbability(card.quantity)}%</span>
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

        // 初手7枚＋サイド6枚を引く
        const { hand, prizes } = drawHandAndPrizes(cards)
        setRandomHand(hand)
        setPrizeCards(prizes)
    }

    const handleDrawAgain = () => {
        const { hand, prizes } = drawHandAndPrizes(cards)
        setRandomHand(hand)
        setPrizeCards(prizes)
        setTrashedNames([])
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
                                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                            : 'border-gray-200 hover:border-blue-300 bg-white'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors
                                                        ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}
                                                    `}>
                                                        {isSelected && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold text-gray-900">{c.name}</div>
                                                        <div className="text-xs text-gray-500">{c.quantity}{t.pcs}</div>
                                                    </div>
                                                    {c.imageUrl && (
                                                        <div className="relative w-8 h-11 shrink-0">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={c.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover rounded shadow-sm opacity-80" onError={(e) => e.currentTarget.remove()} />
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
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-sm"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            />
                        </div>
                        <button
                            onClick={() => handleSimulate()}
                            disabled={loading || !deckCode}
                            className={`px-6 py-2 rounded-lg font-bold text-white transition shadow-md whitespace-nowrap h-[42px] flex items-center justify-center min-w-[120px]
                                ${loading || !deckCode
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 active:scale-95'
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">🃏</span> {t.sampleHand}
                        </h4>
                        <button
                            onClick={handleDrawAgain}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm transition active:scale-95 flex items-center gap-2"
                        >
                            <span className="text-base">🔄</span> {t.drawAgain}
                        </button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {randomHand.map((c, i) => (
                            <div key={i} className="relative aspect-[63/88] rounded-lg overflow-hidden bg-gray-100 shadow-md group border border-gray-50">
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 font-bold p-1 text-center">
                                    {c.name}
                                </div>
                                {c.imageUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={c.imageUrl}
                                        alt={c.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
                                        onError={(e) => e.currentTarget.remove()}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Prize Cards Display */}
            {cards.length > 0 && prizeCards.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                        {lang === 'ja' ? 'サイド（6枚）' : 'Prize Cards (6)'}
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {prizeCards.map((c, i) => (
                            <div key={i} className="relative aspect-[63/88] rounded-lg overflow-hidden bg-gray-100 shadow-md group border border-gray-50">
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 font-bold p-1 text-center">
                                    {c.name}
                                </div>
                                {c.imageUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={c.imageUrl}
                                        alt={c.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) => e.currentTarget.remove()}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Next Draw Prediction Section */}
            {cards.length > 0 && nextDraw.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-6 rounded-xl shadow-sm border-2 border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-gray-800">
                            {lang === 'ja' ? '次に引く1枚 予測' : 'Next Card Prediction'}
                        </h4>
                        <span className="text-xs font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                            {lang === 'ja' ? '残り山札から厳密計算' : 'Exact (remaining deck)'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-5">
                        {lang === 'ja'
                            ? '初手7枚とサイド6枚を引いた残りの山札47枚から、次に引く1枚を予測します。引き直すと再計算されます。'
                            : 'Predicts the next card from the 47 cards left after the opening hand and 6 prizes. Recalculates when you redraw.'}
                    </p>

                    {/* Top prediction */}
                    {(() => {
                        const top = nextDraw[0]
                        return (
                            <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-blue-200 shadow-sm mb-4">
                                <div className="relative w-16 h-22 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '63/88', height: '5.5rem' }}>
                                    <span className="absolute text-[9px] text-gray-400 font-bold p-1 text-center">{top.name}</span>
                                    {top.imageUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={top.imageUrl} alt={top.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.remove()} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-0.5">{lang === 'ja' ? '最有力' : 'Most Likely'}</div>
                                    <div className="font-bold text-gray-900 text-lg truncate">{top.name}</div>
                                    <div className="text-3xl font-extrabold text-blue-600">{top.probability.toFixed(1)}<span className="text-base">%</span></div>
                                </div>
                            </div>
                        )
                    })()}

                    {/* Ranking list (2nd〜10th) */}
                    <div className="space-y-1.5">
                        {nextDraw.slice(1, 10).map((r, i) => (
                            <div key={r.name} className="flex items-center gap-3 bg-white/70 rounded-lg px-3 py-2 border border-blue-100">
                                <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 2}</span>
                                <div className="relative w-6 h-8 shrink-0 rounded overflow-hidden bg-gray-100">
                                    {r.imageUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={r.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.remove()} />
                                    )}
                                </div>
                                <span className="flex-1 text-sm font-medium text-gray-700 truncate">{r.name}</span>
                                <span className="text-sm font-bold text-blue-600">{r.probability.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>

                    {/* Trash control */}
                    <div className="mt-5 pt-4 border-t border-blue-200">
                        <button
                            onClick={() => setNextDrawOpen(v => !v)}
                            className="text-sm font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                        >
                            {lang === 'ja' ? 'トラッシュにあるカードを指定' : 'Set cards in the trash'}
                            <span className="text-xs">{nextDrawOpen ? '▲' : '▼'}</span>
                            {trashedNames.length > 0 && (
                                <span className="ml-1 text-xs bg-blue-200 text-blue-800 rounded-full px-2 py-0.5">{trashedNames.length}</span>
                            )}
                        </button>

                        {nextDrawOpen && (
                            <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-2">
                                    {lang === 'ja'
                                        ? 'トラッシュにあるカードをタップで指定すると、残り山札から再計算します。サイドに行ったカード（青）は自動で反映済みです。'
                                        : 'Tap a card to mark it as trashed and recalculate. Prized cards (blue) are already applied.'}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {cards.map(c => {
                                        const prizeCount = prizeCards.filter(p => p.name === c.name).length
                                        const trashedCount = trashedNames.filter(n => n === c.name).length
                                        const maxTrash = c.quantity - prizeCount
                                        const isPrized = prizeCount > 0
                                        const isTrashed = trashedCount > 0
                                        return (
                                            <button
                                                key={c.name}
                                                onClick={() => maxTrash > 0 && cycleTrash(c.name, maxTrash)}
                                                disabled={maxTrash <= 0}
                                                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${isTrashed
                                                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                                                    : isPrized
                                                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                                } ${maxTrash <= 0 ? 'cursor-default' : ''}`}
                                            >
                                                {c.name}
                                                {isPrized && <span className="ml-1 font-bold">{lang === 'ja' ? 'サイド' : 'P'}{prizeCount}</span>}
                                                {isTrashed && <span className="ml-1 font-bold">{lang === 'ja' ? 'トラッシュ' : 'T'}{trashedCount}</span>}
                                            </button>
                                        )
                                    })}
                                </div>
                                {trashedNames.length > 0 && (
                                    <button
                                        onClick={() => setTrashedNames([])}
                                        className="mt-3 text-xs text-gray-400 hover:text-red-500 underline"
                                    >
                                        {lang === 'ja' ? 'トラッシュ指定をクリア' : 'Clear trash'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Board Custom Probability Section */}
            {cards.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-6 rounded-xl shadow-sm border-2 border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-gray-800">
                            {lang === 'ja' ? '盤面から引ける確率' : 'Draw Probability from Board State'}
                        </h4>
                        <span className="text-xs font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                            {lang === 'ja' ? '超幾何分布で厳密計算' : 'Hypergeometric (exact)'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-5">
                        {lang === 'ja'
                            ? '手札・場・トラッシュ・サイドにあるカードの枚数を指定し、残った山札から目当てのカードを引ける確率を計算します。'
                            : 'Set how many copies are already in hand, play, trash or prizes, then calculate the odds of drawing your target from the remaining deck.'}
                    </p>

                    {/* Target + draw count + result */}
                    <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm mb-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-600 mb-1">
                                    {lang === 'ja' ? '引きたいカード' : 'Target card'}
                                </label>
                                <select
                                    value={targetCard}
                                    onChange={(e) => setTargetCard(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">{lang === 'ja' ? '選択してください' : 'Select a card'}</option>
                                    {cards.map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-40">
                                <label className="block text-xs font-bold text-gray-600 mb-1">
                                    {lang === 'ja' ? `あと何回ドロー: ${drawCount}` : `Draws: ${drawCount}`}
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={15}
                                    value={drawCount}
                                    onChange={(e) => setDrawCount(Number(e.target.value))}
                                    className="w-full accent-blue-500"
                                />
                            </div>
                        </div>

                        {boardProbability !== null && (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                                <div className="text-xs text-gray-500">
                                    {lang === 'ja'
                                        ? `残り山札 ${remainingDeckCount}枚 ／ 対象 ${targetRemaining}枚`
                                        : `Deck left ${remainingDeckCount} / target ${targetRemaining}`}
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                                        {lang === 'ja' ? `${drawCount}ドロー以内に引ける確率` : `Within ${drawCount} draws`}
                                    </div>
                                    <div className="text-4xl font-extrabold text-blue-600">{boardProbability.toFixed(1)}<span className="text-lg">%</span></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Board state editor */}
                    <button
                        onClick={() => setBoardOpen(v => !v)}
                        className="text-sm font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                        {lang === 'ja' ? '盤面を指定（山札にないカード）' : 'Set board state (cards outside the deck)'}
                        <span className="text-xs">{boardOpen ? '▲' : '▼'}</span>
                        {boardExcludedTotal > 0 && (
                            <span className="ml-1 text-xs bg-blue-200 text-blue-800 rounded-full px-2 py-0.5">{boardExcludedTotal}</span>
                        )}
                    </button>

                    {boardOpen && (
                        <div className="mt-3 space-y-1.5 max-h-80 overflow-y-auto pr-1">
                            {cards.map(c => {
                                const ex = boardExclude[c.name] || 0
                                return (
                                    <div key={c.name} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                                        <span className="flex-1 text-sm text-gray-700 truncate">{c.name}</span>
                                        <span className="text-xs text-gray-400">{c.quantity - ex}{lang === 'ja' ? '枚 山札' : ' deck'}</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => adjustBoard(c.name, -1, c.quantity)}
                                                disabled={ex <= 0}
                                                className="w-7 h-7 rounded-md border border-gray-200 text-gray-600 font-bold disabled:opacity-30 hover:bg-gray-50"
                                            >−</button>
                                            <span className="w-6 text-center text-sm font-bold text-blue-700">{ex}</span>
                                            <button
                                                onClick={() => adjustBoard(c.name, 1, c.quantity)}
                                                disabled={ex >= c.quantity}
                                                className="w-7 h-7 rounded-md border border-gray-200 text-gray-600 font-bold disabled:opacity-30 hover:bg-gray-50"
                                            >＋</button>
                                        </div>
                                    </div>
                                )
                            })}
                            {boardExcludedTotal > 0 && (
                                <button
                                    onClick={() => setBoardExclude({})}
                                    className="mt-2 text-xs text-gray-400 hover:text-red-500 underline"
                                >
                                    {lang === 'ja' ? '盤面指定をクリア' : 'Clear board'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Custom Hand Simulation Section */}
            {cards.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-6 rounded-xl shadow-sm border-2 border-blue-100 mb-10">
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
                                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
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
                            className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition whitespace-nowrap"
                        >
                            {t.addCondition}
                        </button>
                    </div>

                    {/* Condition List */}
                    {customTargets.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {customTargets.map((t_item, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white px-4 py-3 rounded-lg border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-1 gap-2">
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full">
                                        <span className="font-bold text-gray-800 break-all">{t_item.name}</span>
                                        <select
                                            value={t_item.targetQuantity}
                                            onChange={(e) => handleUpdateQuantity(t_item.id, parseInt(e.target.value))}
                                            className="font-bold text-blue-600 text-lg bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-600 px-1 py-0 disabled:opacity-50"
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
                            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                        >
                            {t.calculate} 🎲
                        </button>

                        {simResult !== null && (
                            <div className="flex flex-col gap-4 w-full md:w-auto animate-in fade-in zoom-in duration-300">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center min-w-[140px]">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{t.andProb}</span>
                                        <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-600">
                                            {simResult.and}%
                                        </span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center min-w-[140px]">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{t.orProb}</span>
                                        <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-500">
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
                    <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-6 rounded-xl shadow-sm border-2 border-blue-100">
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
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-500 pl-4">
                                {t.analysisResults}
                            </h2>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
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
