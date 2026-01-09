
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { type Card } from '@/lib/deckParser'
import { CardStack, createStack, getTopCard, canStack, isEnergy, isTool } from '@/lib/cardStack'
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragEndEvent,
    DragStartEvent,
    useDraggable,
    useDroppable,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface DeckPracticeProps {
    deck: Card[]
    onReset: () => void
    playerName?: string
    compact?: boolean
    stadium?: Card | null
    onStadiumChange?: (stadium: Card | null) => void
}

interface MenuState {
    isOpen: boolean
    card: Card | CardStack
    source: 'hand' | 'battle' | 'bench'
    index: number
    x: number
    y: number
}

// Track if we are in "Swap Mode" (selecting a target to swap with)
interface SwapState {
    active: boolean
    sourceIndex: number // Index in bench (if source is bench)
    sourceType: 'battle' | 'bench'
}

export default function DeckPractice({ deck, onReset, playerName = "プレイヤー", compact = false, stadium: externalStadium, onStadiumChange }: DeckPracticeProps) {
    const [hand, setHand] = useState<Card[]>([])
    const [remaining, setRemaining] = useState<Card[]>(deck)
    const [trash, setTrash] = useState<Card[]>([])
    const [battleField, setBattleField] = useState<CardStack | null>(null)
    const [benchSize, setBenchSize] = useState(5)
    // Initialize bench with 8 slots but valid based on benchSize
    const [bench, setBench] = useState<(CardStack | null)[]>(new Array(8).fill(null))
    const [prizeCards, setPrizeCards] = useState<Card[]>([])
    const [initialized, setInitialized] = useState(false)

    // Menu & Swap State
    const [menu, setMenu] = useState<MenuState | null>(null)
    const [swapMode, setSwapMode] = useState<SwapState | null>(null)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [activeDragData, setActiveDragData] = useState<any>(null)

    // dnd-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        })
    )

    // Auto-setup prize cards and draw initial hand when deck is first loaded
    useEffect(() => {
        if (!initialized && deck.length === 60) {
            const prizes = remaining.slice(0, 6)
            setPrizeCards(prizes)
            const afterPrizes = remaining.slice(6)

            // Auto-draw 7 cards
            const initialHand = afterPrizes.slice(0, 7)
            setHand(initialHand)
            setRemaining(afterPrizes.slice(7))

            setInitialized(true)
        }
    }, [deck, initialized])

    // Track previous stadium to handle trashing logic
    const prevStadiumRef = useRef<Card | null>(null)

    useEffect(() => {
        // If we had a stadium and it changed (either replaced or removed)
        if (prevStadiumRef.current && prevStadiumRef.current !== externalStadium) {
            // Add the OLD stadium to trash
            setTrash(prev => [...prev, prevStadiumRef.current!])
        }
        // Update ref to current
        prevStadiumRef.current = externalStadium || null
    }, [externalStadium])

    const setupPrizeCards = () => {
        const prizes = remaining.slice(0, 6)
        setPrizeCards(prizes)
        setRemaining(remaining.slice(6))
    }

    const drawCards = (count: number) => {
        const drawn = remaining.slice(0, count)
        setHand([...hand, ...drawn])
        setRemaining(remaining.slice(count))
    }

    const mulligan = () => {
        // Return hand to deck and shuffle
        const newDeck = [...remaining, ...hand].sort(() => Math.random() - 0.5)

        // Draw 7 cards
        const drawn = newDeck.slice(0, 7)
        setHand(drawn)
        setRemaining(newDeck.slice(7))
    }

    const increaseBenchSize = () => {
        if (benchSize < 8) {
            setBenchSize(prev => Math.min(prev + 1, 8))
        }
    }

    const moveToTrash = (index: number) => {
        const card = hand[index]
        setTrash([...trash, card])
        setHand(hand.filter((_, i) => i !== index))
    }

    // Menu Actions
    const handleCardClick = (e: React.MouseEvent, card: Card | CardStack, source: 'hand' | 'battle' | 'bench', index: number) => {
        e.stopPropagation()
        // If in swap mode and clicking a valid target (Bench), perform swap
        if (swapMode && swapMode.active && source === 'bench') {
            performSwap(index)
            return
        }

        // Otherwise open menu
        // Check window position to adjust menu direction if needed (simplified: fixed max width/height handling)
        setMenu({
            isOpen: true,
            card,
            source,
            index,
            x: e.clientX,
            y: e.clientY
        })
        setSwapMode(null) // Cancel any existing swap mode if menu opened elsewhere
    }

    const closeMenu = () => {
        setMenu(null)
    }

    // Action Logic
    const playToBattleField = (handIndex: number) => {
        const card = hand[handIndex]
        if (battleField) {
            // Stack logic (simplified: always stack on top for menu action if valid?)
            // Or replace? The requirement didn't specify stacking logic for menu, but let's assume standard "Play" might stack if valid.
            if (canStack(card, battleField)) {
                const newStack = { ...battleField, cards: [...battleField.cards, card] }
                setBattleField(newStack)
            } else {
                // Replace - send old to trash
                setTrash([...trash, ...battleField.cards])
                setBattleField(createStack(card))
            }
        } else {
            setBattleField(createStack(card))
        }
        setHand(hand.filter((_, i) => i !== handIndex))
        closeMenu()
    }

    const playToBench = (handIndex: number) => {
        // Find first empty slot
        const emptySlotIndex = bench.findIndex((slot, i) => i < benchSize && slot === null)
        if (emptySlotIndex !== -1) {
            const card = hand[handIndex]
            const newBench = [...bench]
            newBench[emptySlotIndex] = createStack(card)
            setBench(newBench)
            setHand(hand.filter((_, i) => i !== handIndex))
        } else {
            alert("ベンチがいっぱいです")
        }
        closeMenu()
    }

    const trashFromHand = (index: number) => {
        moveToTrash(index)
        closeMenu()
    }

    const handToStack = (handIndex: number, targetStack: CardStack, targetType: 'battle' | 'bench', targetIndex?: number) => {
        // Not used directly by menu currently, but kept for future logic
    }

    // Battle Actions
    const battleToHand = () => {
        if (battleField) {
            setHand([...hand, ...battleField.cards])
            setBattleField(null)
        }
        closeMenu()
    }

    const battleToTrash = () => {
        if (battleField) {
            setTrash([...trash, ...battleField.cards])
            setBattleField(null)
        }
        closeMenu()
    }

    const startSwapWithBench = () => {
        setSwapMode({ active: true, sourceType: 'battle', sourceIndex: 0 })
        closeMenu()
    }

    // Bench Actions
    const benchToHand = (index: number) => {
        const stack = bench[index]
        if (stack) {
            setHand([...hand, ...stack.cards])
            const newBench = [...bench]
            newBench[index] = null
            setBench(newBench)
        }
        closeMenu()
    }

    const benchToTrash = (index: number) => {
        const stack = bench[index]
        if (stack) {
            setTrash([...trash, ...stack.cards])
            const newBench = [...bench]
            newBench[index] = null
            setBench(newBench)
        }
        closeMenu()
    }

    const swapBenchToBattle = (index: number) => {
        const benchStack = bench[index]
        if (!benchStack) return

        const currentBattle = battleField
        setBattleField(benchStack)

        const newBench = [...bench]
        newBench[index] = currentBattle // Can be null, that's fine
        setBench(newBench)
        closeMenu()
    }

    // Swap Execution (Step 2)
    const performSwap = (targetBenchIndex: number) => {
        if (!swapMode) return

        if (swapMode.sourceType === 'battle') {
            // Swapping Battle with Bench[targetBenchIndex]
            const currentBattle = battleField
            const targetBench = bench[targetBenchIndex]

            setBattleField(targetBench) // Can be null if empty slot selected
            const newBench = [...bench]
            newBench[targetBenchIndex] = currentBattle
            setBench(newBench)
        }

        setSwapMode(null)
    }


    const takePrizeCard = (index: number) => {
        const prize = prizeCards[index]
        setHand([...hand, prize])
        setPrizeCards(prizeCards.filter((_, i) => i !== index))
    }

    const shuffleDeck = () => {
        const shuffled = [...remaining].sort(() => Math.random() - 0.5)
        setRemaining(shuffled)
    }

    // Supporter Card Effects
    const useNanjamo = () => {
        // Shuffle hand to bottom of deck
        const shuffledHand = [...hand].sort(() => Math.random() - 0.5)
        const newDeck = [...remaining, ...shuffledHand]
        setRemaining(newDeck)
        setHand([])

        // Draw cards equal to prize count
        const drawCount = prizeCards.length
        if (drawCount > 0) {
            const drawn = newDeck.slice(0, drawCount)
            setHand(drawn)
            setRemaining(newDeck.slice(drawCount))
        }
    }

    const useJudge = () => {
        // Return hand to deck and shuffle
        const newDeck = [...remaining, ...hand].sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setHand([])

        // Draw 4 cards
        const drawn = newDeck.slice(0, 4)
        setHand(drawn)
        setRemaining(newDeck.slice(4))
    }

    // Deck Viewer
    const [showDeckViewer, setShowDeckViewer] = useState(false)

    // Trash Viewer
    const [showTrashViewer, setShowTrashViewer] = useState(false)

    // D&D Handlers
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveDragId(active.id as string)
        setActiveDragData(active.data.current)
        lockScroll()
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveDragId(null)
        setActiveDragData(null)
        unlockScroll()

        if (!over) return

        const source = active.data.current as any
        const targetId = over.id as string

        // Logic to route the drag result
        if (source.type === 'hand') {
            if (targetId === 'battle-field') {
                playToBattleField(source.index)
            } else if (targetId.startsWith('bench-slot-')) {
                const targetIndex = parseInt(targetId.replace('bench-slot-', ''))
                // Original playToBench finds first empty slot, let's adapt for specific slot if empty
                if (bench[targetIndex] === null) {
                    const card = hand[source.index]
                    const newBench = [...bench]
                    newBench[targetIndex] = createStack(card)
                    setBench(newBench)
                    setHand(hand.filter((_, i) => i !== source.index))
                } else {
                    // If target is occupied, maybe stack if valid or just do nothing
                    alert("空いている枠に置いてください")
                }
            } else if (targetId === 'trash-zone') {
                trashFromHand(source.index)
            }
        } else if (source.type === 'battle') {
            if (targetId.startsWith('bench-slot-')) {
                const targetIndex = parseInt(targetId.replace('bench-slot-', ''))
                // Perform swap logic
                performSwapFromDnd('battle', 0, targetIndex)
            } else if (targetId === 'trash-zone') {
                battleToTrash()
            }
        } else if (source.type === 'bench') {
            if (targetId === 'battle-field') {
                swapBenchToBattle(source.index)
            } else if (targetId === 'trash-zone') {
                benchToTrash(source.index)
            } else if (targetId.startsWith('bench-slot-')) {
                const targetIndex = parseInt(targetId.replace('bench-slot-', ''))
                if (targetIndex !== source.index) {
                    performSwapFromDnd('bench', source.index, targetIndex)
                }
            }
        }
    }

    const performSwapFromDnd = (sourceType: 'battle' | 'bench', sourceIndex: number, targetIndex: number) => {
        if (sourceType === 'battle') {
            const currentBattle = battleField
            const targetBench = bench[targetIndex]
            setBattleField(targetBench)
            const newBench = [...bench]
            newBench[targetIndex] = currentBattle
            setBench(newBench)
        } else if (sourceType === 'bench') {
            const sourceStack = bench[sourceIndex]
            const targetStack = bench[targetIndex]
            const newBench = [...bench]
            newBench[sourceIndex] = targetStack
            newBench[targetIndex] = sourceStack
            setBench(newBench)
        }
    }

    // Compact mode sizes
    const sizes = compact ? {
        prize: { w: 40, h: 56 },
        stadium: { w: 80, h: 112 },
        battle: { w: 100, h: 140 },
        bench: { w: 70, h: 98 },
        hand: { w: 90, h: 126 },
        trash: { w: 60, h: 84 }
    } : {
        prize: { w: 60, h: 84 },
        stadium: { w: 150, h: 210 },
        battle: { w: 120, h: 168 }, // Resized to match Bench (was 180x252)
        bench: { w: 120, h: 168 },
        hand: { w: 150, h: 210 },
        trash: { w: 100, h: 140 }
    }

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = () => {
            if (menu) closeMenu()
        }
        window.addEventListener('click', handleClickOutside)

        // Prevent context menu (long press menu)
        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault()
        }
        window.addEventListener('contextmenu', preventContextMenu)

        return () => {
            window.removeEventListener('click', handleClickOutside)
            window.removeEventListener('contextmenu', preventContextMenu)
        }
    }, [menu])

    // Scroll lock utilities
    const lockScroll = () => {
        document.body.style.overflow = 'hidden'
    }
    const unlockScroll = () => {
        document.body.style.overflow = 'auto'
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={`w-full ${compact ? "space-y-2" : "space-y-4"} relative`}>
                {/* Context Menu */}
                {menu && (
                    <div
                        className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[160px]"
                        style={{
                            top: Math.min(menu.y, window.innerHeight - 200), // Prevent overflow bottom
                            left: Math.min(menu.x, window.innerWidth - 170)  // Prevent overflow right
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gray-50 px-3 py-2 border-b text-xs font-bold text-gray-700">
                            {menu.source === 'hand' ? '手札 ' : menu.source === 'battle' ? 'バトル場 ' : 'ベンチ '}: {(menu.card as any).name || 'カード'}
                        </div>
                        <div className="flex flex-col">
                            {menu.source === 'hand' && (
                                <>
                                    <button onClick={() => playToBattleField(menu.index)} className="text-left px-4 py-3 hover:bg-purple-50 text-sm border-b transition-colors text-black">
                                        バトル場に出す
                                    </button>
                                    <button onClick={() => playToBench(menu.index)} className="text-left px-4 py-3 hover:bg-blue-50 text-sm border-b transition-colors text-black">
                                        ベンチに出す
                                    </button>
                                    <button onClick={() => trashFromHand(menu.index)} className="text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition-colors">
                                        トラッシュする
                                    </button>
                                </>
                            )}
                            {menu.source === 'battle' && (
                                <>
                                    <button onClick={startSwapWithBench} className="text-left px-4 py-3 hover:bg-blue-50 text-sm border-b transition-colors text-black">
                                        ベンチと入替
                                    </button>
                                    <button onClick={battleToHand} className="text-left px-4 py-3 hover:bg-green-50 text-sm border-b transition-colors text-black">
                                        手札に戻す
                                    </button>
                                    <button onClick={battleToTrash} className="text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition-colors">
                                        トラッシュする
                                    </button>
                                </>
                            )}
                            {menu.source === 'bench' && (
                                <>
                                    <button onClick={() => swapBenchToBattle(menu.index)} className="text-left px-4 py-3 hover:bg-purple-50 text-sm border-b transition-colors text-black">
                                        バトル場へ
                                    </button>
                                    <button onClick={() => benchToHand(menu.index)} className="text-left px-4 py-3 hover:bg-green-50 text-sm border-b transition-colors text-black">
                                        手札に戻す
                                    </button>
                                    <button onClick={() => benchToTrash(menu.index)} className="text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition-colors">
                                        トラッシュする
                                    </button>
                                </>
                            )}
                        </div>
                        <button onClick={closeMenu} className="w-full py-2 bg-gray-100 text-xs text-gray-500 hover:bg-gray-200">
                            閉じる
                        </button>
                    </div>
                )}

                {/* Swap Prompt */}
                {swapMode && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-bounce font-bold">
                        入れ替えるベンチを選択してください
                    </div>
                )}


                {/* Player Name */}
                {playerName && (
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 text-center">
                        {playerName}
                    </h3>
                )}

                {/* Controls & Stats Combined */}
                <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3">
                    {/* Buttons row */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                        <button
                            onClick={mulligan}
                            className="flex-1 min-w-[80px] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-blue-600 transition"
                        >
                            引き直し
                        </button>
                        <button
                            onClick={() => drawCards(1)}
                            disabled={remaining.length === 0}
                            className="flex-1 min-w-[70px] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            1枚引く
                        </button>
                        <button
                            onClick={shuffleDeck}
                            className="flex-1 min-w-[70px] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-purple-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-purple-600 transition"
                        >
                            シャッフル
                        </button>
                        <button
                            onClick={onReset}
                            className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gray-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-gray-600 transition"
                        >
                            リセット
                        </button>
                    </div>
                    {/* Supporter & Deck Viewer row */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                        <button
                            onClick={useNanjamo}
                            disabled={hand.length === 0}
                            className="flex-1 min-w-[80px] px-2 sm:px-3 py-1.5 sm:py-2 bg-pink-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            ナンジャモ
                        </button>
                        <button
                            onClick={useJudge}
                            disabled={hand.length === 0}
                            className="flex-1 min-w-[80px] px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            ジャッジマン
                        </button>
                        <button
                            onClick={() => setShowDeckViewer(true)}
                            className="flex-1 min-w-[80px] px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-amber-600 transition"
                        >
                            山札確認
                        </button>
                        <button
                            onClick={() => setShowTrashViewer(true)}
                            disabled={trash.length === 0}
                            className="flex-1 min-w-[80px] px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-500 text-white rounded text-xs sm:text-sm font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            トラッシュ確認
                        </button>
                    </div>
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
                        <div className="bg-blue-50 rounded px-1 py-1">
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{remaining.length}</div>
                            <div className="text-[10px] sm:text-xs text-gray-600">山札</div>
                        </div>
                        <div className="bg-green-50 rounded px-1 py-1">
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{hand.length}</div>
                            <div className="text-[10px] sm:text-xs text-gray-600">手札</div>
                        </div>
                    </div>
                </div>

                {/* Prizes, Trash & Battle Field - 2 Column Layout */}
                <div className="flex gap-2 sm:gap-3">
                    {/* Left Column: Prizes & Trash */}
                    <div className="flex flex-col gap-2 h-full justify-between" style={{ height: (sizes.battle.h + 24) }}> {/* Approximate height match + padding */}
                        {/* Prize Cards */}
                        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 w-full">
                            <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">サイド ({prizeCards.length}枚)</h2>
                            <div className="flex items-center">
                                {prizeCards.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => takePrizeCard(i)}
                                        className="w-8 h-12 sm:w-10 sm:h-14 md:w-12 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded shadow-md hover:shadow-xl hover:scale-105 transition flex items-center justify-center text-white font-bold text-sm sm:text-base"
                                        style={{ marginLeft: i > 0 ? '-16px' : '0', zIndex: prizeCards.length - i }}
                                    >
                                        ?
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Trash (Moved here) */}
                        <DroppableZone id="trash-zone" className="w-full">
                            <div
                                className="bg-red-50 rounded-lg shadow-lg p-2 sm:p-3 relative cursor-pointer hover:bg-red-100 transition w-full"
                                onClick={() => setShowTrashViewer(true)}
                            >
                                <h2 className="text-xs sm:text-sm font-bold text-black mb-1">トラッシュ</h2>
                                <div className="text-lg sm:text-xl font-bold text-red-600">{trash.length}枚</div>
                            </div>
                        </DroppableZone>
                    </div>

                    {/* Battle Field (Right Column) */}
                    <DroppableZone id="battle-field" className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-2 sm:p-3">
                        <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 w-full text-left">バトル場</h2>
                        {battleField ? (
                            <DraggableCard
                                id="battle-card"
                                data={{ type: 'battle', index: 0, card: battleField }}
                                onClick={(e) => handleCardClick(e, battleField!, 'battle', 0)}
                            >
                                <CascadingStack stack={battleField} width={sizes.battle.w} height={sizes.battle.h} />
                            </DraggableCard>
                        ) : (
                            <div
                                className="rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs cursor-pointer hover:border-blue-400"
                                style={{ width: sizes.battle.w, height: sizes.battle.h }}
                            >
                                なし
                            </div>
                        )}
                    </DroppableZone>
                </div>

                {/* Bench */}
                {/* BenchContainer - with horizontal scrolling */}
                <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 w-full overflow-hidden">

                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xs sm:text-sm font-bold text-gray-900">ベンチ</h2>
                        <button
                            onClick={increaseBenchSize}
                            disabled={benchSize >= 8}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs sm:text-sm shadow hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            +
                        </button>
                        <span className="text-[10px] text-gray-500">Max: {benchSize}</span>
                    </div>
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 touch-pan-x">
                        {bench.slice(0, benchSize).map((stack, i) => (
                            <div key={i} className="flex-shrink-0">
                                {stack ? (
                                    <DraggableCard
                                        id={`bench-card-${i}`}
                                        data={{ type: 'bench', index: i, card: stack }}
                                        onClick={(e) => handleCardClick(e, stack, 'bench', i)}
                                        className={swapMode?.active ? 'ring-2 ring-blue-400 animate-pulse' : ''}
                                    >
                                        <CascadingStack stack={stack} width={sizes.bench.w} height={sizes.bench.h} />
                                    </DraggableCard>
                                ) : (
                                    <DroppableZone
                                        id={`bench-slot-${i}`}
                                        className={`rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs cursor-pointer hover:border-blue-400 ${swapMode?.active ? 'ring-2 ring-blue-400 animate-pulse bg-blue-50' : ''}`}
                                        style={{ width: sizes.bench.w, height: sizes.bench.h }}
                                        onClick={(e) => {
                                            if (swapMode?.active) {
                                                e.stopPropagation()
                                                performSwap(i)
                                            }
                                        }}
                                    >
                                        {swapMode?.active ? 'ここへ移動' : '空き'}
                                    </DroppableZone>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hand */}
                <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 w-full overflow-hidden">
                    <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">手札 ({hand.length}枚)</h2>
                    {/* Hand Container - Horizontal Scroll enabled */}
                    <div
                        className="flex overflow-x-auto gap-1 sm:gap-2 pb-2 px-1 snap-x"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        {hand.map((card, i) => (
                            <DraggableCard
                                key={`${card.name}-${i}`}
                                id={`hand-card-${i}`}
                                data={{ type: 'hand', index: i, card }}
                                className="flex-shrink-0 snap-start"
                                onClick={(e) => handleCardClick(e, card, 'hand', i)}
                            >
                                <Image
                                    src={card.imageUrl}
                                    alt={card.name}
                                    width={sizes.hand.w}
                                    height={sizes.hand.h}
                                    className="rounded shadow-md hover:shadow-xl transition"
                                    draggable={false}
                                />
                            </DraggableCard>
                        ))}
                    </div>
                </div>

                {/* Modals */}
                {/* Deck Viewer Modal */}
                {showDeckViewer && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeckViewer(false)}>
                        <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">山札確認 ({remaining.length}枚)</h2>
                                <button onClick={() => setShowDeckViewer(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded">閉じる</button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {remaining.map((card, i) => (
                                    <div key={i} className="relative">
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={80}
                                            height={112}
                                            className="rounded shadow no-touch-menu no-select no-tap-highlight"
                                            draggable={false}
                                        />
                                        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-1 rounded">
                                            {i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Trash Viewer Modal */}
                {showTrashViewer && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTrashViewer(false)}>
                        <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-red-600">トラッシュ ({trash.length}枚)</h2>
                                <button onClick={() => setShowTrashViewer(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded">閉じる</button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {trash.map((card, i) => (
                                    <div key={i} className="relative group">
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={80}
                                            height={112}
                                            className="rounded shadow no-touch-menu no-select no-tap-highlight"
                                            draggable={false}
                                        />
                                        <button
                                            onClick={() => {
                                                setHand([...hand, card])
                                                setTrash(trash.filter((_, idx) => idx !== i))
                                            }}
                                            className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition"
                                        >
                                            回収
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.4',
                        },
                    },
                }),
            }}>
                {activeDragId ? (
                    <div className="opacity-80 scale-105 pointer-events-none">
                        {activeDragData.type === 'hand' ? (
                            <Image
                                src={activeDragData.card.imageUrl}
                                alt={activeDragData.card.name}
                                width={sizes.hand.w}
                                height={sizes.hand.h}
                                className="rounded shadow-2xl"
                            />
                        ) : (
                            <CascadingStack
                                stack={activeDragData.card}
                                width={activeDragData.type === 'battle' ? sizes.battle.w : sizes.bench.w}
                                height={activeDragData.type === 'battle' ? sizes.battle.h : sizes.bench.h}
                            />
                        )}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

// Helpers for D&D
function DraggableCard({ id, data, children, className = "", onClick }: { id: string, data: any, children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data,
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`relative group inline-block cursor-grab active:cursor-grabbing select-none no-touch-menu no-select no-tap-highlight touch-none ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

function DroppableZone({ id, children, className = "", style = {}, onClick }: { id: string, children: React.ReactNode, className?: string, style?: any, onClick?: (e: React.MouseEvent) => void }) {
    const { isOver, setNodeRef } = useDroppable({
        id,
    })

    return (
        <div
            ref={setNodeRef}
            className={`${className} ${isOver ? 'ring-4 ring-blue-300 bg-blue-50/50' : ''} transition-all`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

// Cascading Stack Component (Helper)
function CascadingStack({ stack, width, height }: { stack: CardStack, width: number, height: number }) {
    const cardOffset = 15 // pixels to show of card below
    const maxVisible = 5

    return (
        <div
            className="relative"
            style={{
                width: width,
                height: height + (Math.min(stack.cards.length - 1, maxVisible) * cardOffset)
            }}
        >
            {stack.cards.map((card, i) => {
                // Only render last few cards for performance/visuals if stack is huge
                if (i < stack.cards.length - maxVisible - 1) return null

                // Actually simpler: just render all with absolute top
                return (
                    <div
                        key={i}
                        className="absolute top-0 left-0 transition-all"
                        style={{
                            top: i * cardOffset, // Use actual index for cascading effect
                            zIndex: i
                        }}
                    >
                        <Image
                            src={card.imageUrl}
                            alt={card.name}
                            width={width}
                            height={height}
                            className="rounded shadow-lg bg-white no-touch-menu no-select no-tap-highlight"
                            draggable={false}
                        />
                    </div>
                )
            })}

            {/* Stack info badge */}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex gap-1 z-50 pointer-events-none">
                {stack.cards.length > 1 && <span>📚{stack.cards.length}</span>}
                {stack.energyCount > 0 && <span>⚡{stack.energyCount}</span>}
                {stack.toolCount > 0 && <span>🔧{stack.toolCount}</span>}
            </div>
        </div>
    )
}
