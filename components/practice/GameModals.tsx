'use client'

import { createPortal } from 'react-dom'
import Image from 'next/image'
import { type Card } from '@/lib/deckParser'
import { type CardStack, isPokemon, isEnergy, isTool } from '@/lib/cardStack'
import DamagePicker from '../DamagePicker'
import { type MenuState, type DetailModalState } from './types'

interface GameModalsProps {
    // renderDamagePicker
    damageTarget: { type: 'battle' | 'bench'; index: number } | null
    setDamageTarget: (target: { type: 'battle' | 'bench'; index: number } | null) => void
    updateDamage: (source: 'battle' | 'bench', index: number, delta: number) => void
    updateStatus: (source: 'battle' | 'bench', index: number, status: 'none' | 'poison' | 'burn' | 'confused' | 'asleep' | 'paralyzed') => void
    battleField: CardStack | null
    bench: (CardStack | null)[]

    // renderMenu
    menu: MenuState | null
    setMenu: (menu: MenuState | null) => void
    closeMenu: () => void
    getCardSpecificActions: (card: Card, index: number, source: 'hand' | 'battle' | 'bench') => { label: string; action: () => void; color: string }[]
    setBattleField: React.Dispatch<React.SetStateAction<CardStack | null>>
    setBench: React.Dispatch<React.SetStateAction<(CardStack | null)[]>>
    setDetailModal: (modal: DetailModalState | null) => void
    setShowDetailModal: (card: Card | null) => void
    playToBattleField: (index: number) => void
    playToBench: (index: number) => void
    trashFromHand: (index: number) => void
    battleToHand: () => void
    startSwapWithBench: () => void
    battleToDeck: () => void
    battleToTrash: () => void
    benchToHand: (index: number) => void
    swapBenchToBattle: (index: number) => void
    benchToTrash: (index: number) => void

    // renderDamageSelector
    damageSelector: {
        isOpen: boolean
        source: 'battle' | 'bench'
        index: number
        damage?: number
    } | null
    setDamageSelector: (selector: { isOpen: boolean; source: 'battle' | 'bench'; index: number; damage?: number } | null) => void
    onAttackTrigger?: (damage: number, targetType: 'battle' | 'bench', targetIndex: number) => void
    showToast: (msg: string) => void

    // renderRetreatEnergyModal
    retreatState: {
        isOpen: boolean
        targetBenchIndex: number | null
        selectedCardIndices: number[]
    }
    setRetreatState: React.Dispatch<React.SetStateAction<{
        isOpen: boolean
        targetBenchIndex: number | null
        selectedCardIndices: number[]
    }>>
    executeRetreat: () => void

    // renderDetailModal
    showDetailModal: Card | null
    detailModal: DetailModalState | null
    handleSafeRemove: (targetType: 'battle' | 'bench', targetIndex: number, cardIndex: number, destination: 'hand' | 'deck' | 'trash') => void

    // renderActionMenu
    showActionMenu: boolean
    setShowActionMenu: (show: boolean) => void
    shuffleDeck: () => void
    mulligan: () => void
    discardTopDeck: () => void
    discardRandomHand: () => void
    nextTurn: () => void
    remaining: Card[]
    hand: Card[]
}

export function GameModals(props: GameModalsProps) {
    const {
        damageTarget,
        setDamageTarget,
        updateDamage,
        updateStatus,
        battleField,
        bench,
        menu,
        closeMenu,
        getCardSpecificActions,
        setDetailModal,
        setShowDetailModal,
        playToBattleField,
        playToBench,
        trashFromHand,
        battleToHand,
        startSwapWithBench,
        battleToDeck,
        battleToTrash,
        benchToHand,
        swapBenchToBattle,
        benchToTrash,
        damageSelector,
        setDamageSelector,
        onAttackTrigger,
        showToast,
        retreatState,
        setRetreatState,
        executeRetreat,
        showDetailModal,
        detailModal,
        handleSafeRemove,
        showActionMenu,
        setShowActionMenu,
        shuffleDeck,
        mulligan,
        discardTopDeck,
        discardRandomHand,
        nextTurn,
        remaining,
        hand,
    } = props

    // renderDamagePicker
    const damagePicker = (() => {
        if (!damageTarget) return null

        const onApply = (delta: number) => {
            updateDamage(damageTarget.type, damageTarget.index, delta)
        }

        const onReset = () => {
            const targetStack = damageTarget.type === 'battle' ? battleField : bench[damageTarget.index]
            if (targetStack) {
                updateDamage(damageTarget.type, damageTarget.index, -targetStack.damage)
            }
        }

        const onStatusChange = (status: any) => {
            updateStatus(damageTarget.type, damageTarget.index, status)
        }

        return (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto relative">
                    <DamagePicker
                        onApply={onApply}
                        onReset={onReset}
                        onStatusChange={onStatusChange}
                        onClose={() => setDamageTarget(null)}
                    />
                </div>
            </div>
        )
    })()

    // renderMenu
    const menuModal = (() => {
        if (!menu) return null

        // isRightSide removed as unused per lint

        const style: React.CSSProperties = {
            position: 'fixed',
            zIndex: 9999,
        }

        // Adjust position to stick to the card
        // Adjust position to stick to the card with viewport clamping
        if (menu.rect && typeof window !== 'undefined') {
            const MENU_WIDTH = 200
            const MENU_HEIGHT = 350 // Slightly more height for special buttons

            // Horizontal Calculation
            let leftPos = menu.rect.left + (menu.rect.width / 2) - (MENU_WIDTH / 2)

            // Clamp Horizontal
            if (leftPos < 10) leftPos = 10
            if (leftPos + MENU_WIDTH > window.innerWidth - 10) leftPos = window.innerWidth - MENU_WIDTH - 10

            style.left = leftPos

            // Vertical Calculation
            const spaceBelow = window.innerHeight - menu.rect.bottom
            const spaceAbove = menu.rect.top

            // Prefer below, but if not enough space and more space above, go above
            if (spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow) {
                style.bottom = window.innerHeight - menu.rect.top + 5
                style.transformOrigin = 'bottom'
            } else {
                style.top = menu.rect.bottom + 5
                style.transformOrigin = 'top'
            }
        } else {
            style.top = menu.y
            style.left = menu.x
        }

        // Extract single card for name checking
        let sourceCard: Card | null = null
        if ('name' in menu.card) {
            sourceCard = menu.card as Card
        } else {
            // It's a stack, get the operational top (Pokemon or first card)
            const stack = menu.card as CardStack
            let topPokemonIndex = -1
            for (let i = stack.cards.length - 1; i >= 0; i--) {
                if (isPokemon(stack.cards[i])) {
                    topPokemonIndex = i
                    break
                }
            }
            if (topPokemonIndex === -1 && stack.cards.length > 0) topPokemonIndex = 0
            sourceCard = stack.cards[topPokemonIndex]
        }

        const specialActions = sourceCard ? getCardSpecificActions(sourceCard, menu.index, menu.source) : []

        // Determine available actions based on source
        return createPortal(
            <div className="fixed inset-0 z-[9999]" onClick={closeMenu}>
                <div
                    className="absolute bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[170px] animate-in fade-in zoom-in-95 duration-100"
                    style={style}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bg-gray-50 px-3 py-2 border-b text-xs font-bold text-gray-900 flex justify-between items-center">
                        <span>カード操作</span>
                        {sourceCard && <span className="text-[10px] text-gray-400 font-normal">{sourceCard.name}</span>}
                    </div>

                    {/* Card-Specific Actions (Top Priority) */}
                    {specialActions.length > 0 && (
                        <div className="p-1 border-b border-gray-100">
                            {specialActions.map((sa, i) => (
                                <button
                                    key={i}
                                    onClick={sa.action}
                                    className={`w-full text-left px-3 py-2.5 rounded text-sm font-black flex items-center mb-0.5 ${sa.color} transition-colors`}
                                >
                                    {sa.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Damage Counter Controls (Battle/Bench only) */}
                    {(menu.source === 'battle' || menu.source === 'bench') && (() => {
                        const targetStack = menu.source === 'battle' ? battleField : (menu.source === 'bench' ? bench[menu.index] : null)
                        if (!targetStack) return null
                        return (
                            <div className="bg-red-50 p-2 border-b border-red-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-red-800">ダメカン</span>
                                    <span className="text-sm font-black text-red-600">{targetStack.damage || 0}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                    <button onClick={() => updateDamage(menu.source as 'battle' | 'bench', menu.index, -50)} className="px-1 py-1 bg-white border border-red-200 text-red-700 rounded hover:bg-red-100 text-[10px] font-bold shadow-sm">-50</button>
                                    <button onClick={() => updateDamage(menu.source as 'battle' | 'bench', menu.index, -10)} className="px-1 py-1 bg-white border border-red-200 text-red-700 rounded hover:bg-red-100 text-[10px] font-bold shadow-sm">-10</button>
                                    <button onClick={() => updateDamage(menu.source as 'battle' | 'bench', menu.index, 10)} className="px-1 py-1 bg-white border border-red-200 text-red-700 rounded hover:bg-red-100 text-[10px] font-bold shadow-sm">+10</button>
                                    <button onClick={() => updateDamage(menu.source as 'battle' | 'bench', menu.index, 50)} className="px-1 py-1 bg-white border border-red-200 text-red-700 rounded hover:bg-red-100 text-[10px] font-bold shadow-sm">+50</button>
                                </div>
                            </div>
                        )
                    })()}

                    {/* View Detail Button */}
                    <button
                        onClick={() => {
                            // cardToView removed as unused per lint
                            // Open new Detail Modal
                            const targetStack = menu.source === 'battle' ? battleField : (menu.source === 'bench' ? bench[menu.index] : null)
                            if (targetStack) {
                                setDetailModal({
                                    stack: targetStack,
                                    type: menu.source as 'battle' | 'bench',
                                    index: menu.index
                                })
                            } else if (menu.source === 'hand') {
                                // For hand, we just show a simple modal or ignore detailed stack view (since hand has no attachments)
                                // Let's just use the old single card view for hand or adapting logic.
                                // For simplicity, let's just alert or show single card image if needed,
                                // but User request was about "Attached cards", which implies Battle/Bench.
                                // Let's keep a "Simple Card View" for hand if needed, or just skip.
                                // Re-using separate state for single card view might be needed if we want to view Hand cards.
                                // Or we can construct a fake stack.
                                setShowDetailModal(menu.card as Card) // Fallback for hand
                            }
                            closeMenu()
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-purple-50 hover:text-purple-600 text-sm flex items-center gap-2 text-gray-900 font-bold"
                    >
                        詳細を見る
                    </button>

                    {menu.source === 'hand' && (
                        <>
                            <button onClick={() => playToBattleField(menu.index)} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 font-bold">バトル場に出す</button>
                            <button onClick={() => playToBench(menu.index)} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 font-bold">ベンチに出す</button>
                            <button onClick={() => trashFromHand(menu.index)} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-bold">トラッシュ</button>
                        </>
                    )}
                    {menu.source === 'battle' && (
                        <>
                            <button onClick={battleToHand} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 font-bold">手札に戻す</button>
                            <button onClick={startSwapWithBench} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 font-bold flex items-center gap-2">
                                にげる
                            </button>
                            <button onClick={battleToDeck} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 font-bold">山札に戻す</button>
                            <button onClick={battleToTrash} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-bold">きぜつ（トラッシュ）</button>
                        </>
                    )}
                    {menu.source === 'bench' && (
                        <>
                            <button onClick={() => benchToHand(menu.index)} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 font-bold">手札に戻す</button>
                            <button onClick={() => swapBenchToBattle(menu.index)} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 font-bold">バトル場へ</button>
                            <button onClick={() => benchToTrash(menu.index)} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-bold">きぜつ（トラッシュ）</button>
                        </>
                    )}
                </div>
            </div>,
            document.body
        )
    })()

    // renderDamageSelector
    const damageSelectorModal = (() => {
        if (!damageSelector || !damageSelector.isOpen) return null

        const damageOptions = [30, 50, 100, 120, 140, 150, 180, 200, 220, 240, 280, 300, 330]

        return createPortal(
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDamageSelector(null)}>
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                        ダメージを選択
                    </h3>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {damageOptions.map(dmg => (
                            <button
                                key={dmg}
                                onClick={() => {
                                    const finalDmg = damageSelector.damage || dmg
                                    onAttackTrigger?.(finalDmg, damageSelector.source, damageSelector.index)
                                    setDamageSelector(null)
                                    showToast(`${finalDmg} ダメージを相手に送信しました`)
                                }}
                                className="py-3 bg-gray-50 hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded-lg font-black text-sm transition-all"
                            >
                                {dmg}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="自由入力"
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = parseInt((e.target as HTMLInputElement).value)
                                    if (!isNaN(val)) {
                                        onAttackTrigger?.(val, damageSelector.source, damageSelector.index)
                                        setDamageSelector(null)
                                        showToast(`${val} ダメージを相手に送信しました`)
                                    }
                                }
                            }}
                        />
                        <button
                            onClick={() => setDamageSelector(null)}
                            className="px-4 py-2 text-gray-400 font-bold hover:text-gray-600"
                        >
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )
    })()

    // renderRetreatEnergyModal
    const retreatEnergyModal = (() => {
        if (!retreatState.isOpen || !battleField) return null

        const energies = battleField.cards
            .map((card, idx) => ({ card, idx }))
            .filter(item => isEnergy(item.card))

        return createPortal(
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setRetreatState(prev => ({ ...prev, isOpen: false, targetBenchIndex: null }))}>
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            にげるエネルギーを選択
                        </h3>
                        <button
                            onClick={() => setRetreatState(prev => ({ ...prev, isOpen: false, targetBenchIndex: null }))}
                            className="text-gray-400 hover:text-gray-600 p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mb-6 font-medium">
                        トラッシュするエネルギーを選択してください。<br/>
                        <span className="text-[10px] text-gray-400">※システムは必要エネルギー数を自動判定しません。手動で選択してください。</span>
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8 max-h-[40vh] overflow-y-auto p-2">
                        {energies.length > 0 ? (
                            energies.map(({ card, idx }) => {
                                const isSelected = retreatState.selectedCardIndices.includes(idx)
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setRetreatState(prev => {
                                                const next = [...prev.selectedCardIndices]
                                                if (next.includes(idx)) {
                                                    return { ...prev, selectedCardIndices: next.filter(i => i !== idx) }
                                                } else {
                                                    return { ...prev, selectedCardIndices: [...next, idx] }
                                                }
                                            })
                                        }}
                                        className={`relative cursor-pointer transition-all duration-200 transform hover:scale-105 ${isSelected ? 'ring-4 ring-blue-500 rounded-lg shadow-lg -translate-y-1' : 'opacity-70 grayscale-[0.3]'}`}
                                    >
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={100}
                                            height={140}
                                            className="rounded-lg shadow-sm"
                                            unoptimized
                                        />
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="col-span-full py-8 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-xl">
                                エネルギーが付いていません
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setRetreatState(prev => ({ ...prev, isOpen: false, targetBenchIndex: null }))}
                            className="flex-1 px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={executeRetreat}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95"
                        >
                            にげる実行 ({retreatState.selectedCardIndices.length})
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )
    })()

    // renderDetailModal
    const detailModalEl = (() => {
        // Fallback for Hand (Single Card) - Legacy showDetailModal
        if (showDetailModal && !detailModal) {
            return (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowDetailModal(null)}>
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
                        <div className="relative w-full max-h-[85vh] aspect-[73/102]">
                            <Image
                                src={showDetailModal.imageUrl}
                                alt={showDetailModal.name}
                                fill
                                className="object-contain rounded-lg shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
            )
        }

        if (!detailModal) return null

        // Dynamic check of stack content
        const currentStack = detailModal.type === 'battle' ? battleField : bench[detailModal.index]
        if (!currentStack) return null

        // Identify Top Pokemon
        let topPokemonIndex = -1
        for (let i = currentStack.cards.length - 1; i >= 0; i--) {
            if (isPokemon(currentStack.cards[i])) {
                topPokemonIndex = i
                break
            }
        }
        if (topPokemonIndex === -1 && currentStack.cards.length > 0) topPokemonIndex = 0
        const mainCard = currentStack.cards[topPokemonIndex]

        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setDetailModal(null)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>

                    {/* Left: Main Image */}
                    <div className="h-[40vh] md:h-auto md:flex-1 bg-gray-100 flex items-center justify-center p-4 sm:p-8 relative flex-shrink-0">
                        <div className="relative h-full w-full flex items-center justify-center">
                            <Image
                                src={mainCard.imageUrl}
                                alt={mainCard.name}
                                fill
                                className="object-contain drop-shadow-lg"
                                unoptimized
                            />
                            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {detailModal.type === 'battle' ? 'バトル場' : 'ベンチ'}
                            </div>
                        </div>
                    </div>

                    {/* Right: Attached Cards List & Actions */}
                    <div className="w-full md:w-[400px] flex flex-col border-l border-gray-200 bg-white flex-1 md:flex-none min-h-0">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">カード構成一覧</h3>
                            <button onClick={() => setDetailModal(null)} className="text-gray-400 hover:text-gray-900 text-2xl leading-none">&times;</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {currentStack.cards.map((card, i) => {
                                const isMain = i === topPokemonIndex
                                return (
                                    <div key={i} className={`flex flex-col p-3 rounded-lg border ${isMain ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-14 relative flex-shrink-0">
                                                <Image src={card.imageUrl} alt={card.name} fill className="object-contain rounded" unoptimized />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-sm text-gray-900 truncate">{card.name}</h4>
                                                    {isMain && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">Active</span>}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {isPokemon(card) ? 'ポケモン' : (isEnergy(card) ? 'エネルギー' : (isTool(card) ? 'どうぐ' : 'その他'))}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    handleSafeRemove(detailModal.type, detailModal.index, i, 'hand')
                                                }}
                                                className="flex-1 bg-blue-50 text-blue-600 border border-blue-200 py-1.5 rounded text-xs font-bold hover:bg-blue-100 transition"
                                            >
                                                手札へ
                                            </button>
                                            <button
                                                onClick={() => handleSafeRemove(detailModal.type, detailModal.index, i, 'deck')}
                                                className="flex-1 bg-gray-50 text-gray-600 border border-gray-200 py-1.5 rounded text-xs font-bold hover:bg-gray-100 transition"
                                            >
                                                山札へ
                                            </button>
                                            <button
                                                onClick={() => handleSafeRemove(detailModal.type, detailModal.index, i, 'trash')}
                                                className="flex-1 bg-red-50 text-red-600 border border-red-200 py-1.5 rounded text-xs font-bold hover:bg-red-100 transition"
                                            >
                                                トラッシュ
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    })()

    // renderActionMenu
    const actionMenu = (
        <div className={`
            fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 transform transition-transform duration-300
            ${showActionMenu ? 'translate-y-0' : 'translate-y-full'}
            md:relative md:transform-none md:bg-transparent md:border-none md:shadow-none md:p-0 md:z-0
        `}>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                <button onClick={shuffleDeck} className="bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm font-medium shadow-sm">
                    山札シャッフル
                </button>
                <button onClick={mulligan} className="bg-white border hover:bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm font-medium shadow-sm">
                    マリガン
                </button>
                <button onClick={discardTopDeck} disabled={remaining.length === 0} className="bg-white border hover:bg-red-50 text-red-600 px-3 py-2 rounded text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    山札トップをトラッシュ
                </button>
                <button onClick={discardRandomHand} disabled={hand.length === 0} className="bg-white border hover:bg-red-50 text-red-600 px-3 py-2 rounded text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    手札ランダムトラッシュ
                </button>
                <button onClick={nextTurn} className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold shadow-lg hover:bg-blue-700">
                    番を終了する (次へ)
                </button>
            </div>

            {/* Mobile Close Button */}
            <button
                onClick={() => setShowActionMenu(false)}
                className="md:hidden w-full mt-4 bg-gray-100 text-gray-600 py-3 rounded-lg font-bold"
            >
                閉じる
            </button>
        </div>
    )

    return (
        <>
            {damagePicker}
            {menuModal}
            {damageSelectorModal}
            {retreatEnergyModal}
            {detailModalEl}
            {showActionMenu && actionMenu}
        </>
    )
}
