'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { type Card } from '@/lib/deckParser'
import { CardStack, createStack, getTopCard, canStack, isEnergy, isTool } from '@/lib/cardStack'

interface DeckPracticeProps {
    deck: Card[]
    onReset: () => void
    playerName?: string
    compact?: boolean
    stadium?: Card | null
    onStadiumChange?: (stadium: Card | null) => void
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

    // Touch Drag Support State
    const [touchDragItem, setTouchDragItem] = useState<{
        card: Card | CardStack,
        source: 'hand' | 'bench' | 'battle',
        index: number,
        x: number,
        y: number
    } | null>(null)



    // Touch logic refs for long-press detection
    const touchTimerRef = useRef<NodeJS.Timeout | null>(null)
    const touchStartPosRef = useRef<{ x: number, y: number } | null>(null)
    const touchCurrentPosRef = useRef<{ x: number, y: number } | null>(null)

    // Detect if device supports touch to disable native draggable
    const [isTouchDevice, setIsTouchDevice] = useState(false)

    useEffect(() => {
        const checkTouch = () => {
            setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
        }
        checkTouch()
        window.addEventListener('resize', checkTouch)
        return () => window.removeEventListener('resize', checkTouch)
    }, [])

    // Drag tracking for long drag detection
    const [dragStartTime, setDragStartTime] = useState<number | null>(null)
    const [isLongDrag, setIsLongDrag] = useState(false)

    // Selected card for click-to-move
    const [selectedCard, setSelectedCard] = useState<{
        card: Card
        source: 'hand' | 'bench' | 'battle'
        index?: number
    } | null>(null)

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

    const handleDragStart = (e: React.DragEvent, index: number, source: string) => {
        setDragStartTime(Date.now())
        e.dataTransfer.setData('cardIndex', index.toString())
        e.dataTransfer.setData('source', source)
        e.dataTransfer.setData('playerName', playerName || '')

        // Visual feedback for long drag
        setTimeout(() => {
            if (dragStartTime) { // This check might need ref-like behavior in real React, but simplified here
                setIsLongDrag(true)
            }
        }, 1000)
    }

    // Unified Touch Handling for Android
    // 1. touchStart: Start timer & record pos
    // 2. touchMove: If moved > 10px before timer, cancel timer (it's a scroll). If timer fired, move drag item.
    // 3. touchEnd: Clear timer. If dragging, drop.

    const handleTouchStart = (e: React.TouchEvent, item: any, index: number, source: string) => {
        const touch = e.touches[0]
        touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }
        touchCurrentPosRef.current = { x: touch.clientX, y: touch.clientY }

        // Start long-press timer
        touchTimerRef.current = setTimeout(() => {
            // Timer fired: It's a drag!
            setTouchDragItem({
                card: item,
                source: source as any,
                index,
                x: touchCurrentPosRef.current!.x,
                y: touchCurrentPosRef.current!.y
            })
            // Navigator vibrate for feedback if available
            if (navigator.vibrate) navigator.vibrate(50)
        }, 200) // 200ms delay to detect scroll vs drag
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0]
        touchCurrentPosRef.current = { x: touch.clientX, y: touch.clientY }

        if (touchDragItem) {
            // Already dragging: prevent scroll and update pos
            if (e.cancelable) e.preventDefault()
            setTouchDragItem(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null)
        } else {
            // Not dragging yet: check if we moved too much (scrolling)
            if (touchStartPosRef.current) {
                const dx = Math.abs(touch.clientX - touchStartPosRef.current.x)
                const dy = Math.abs(touch.clientY - touchStartPosRef.current.y)
                if (dx > 10 || dy > 10) {
                    // User is scrolling, cancel timer
                    if (touchTimerRef.current) {
                        clearTimeout(touchTimerRef.current)
                        touchTimerRef.current = null
                    }
                }
            }
        }
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        // Clear timer first thing
        if (touchTimerRef.current) {
            clearTimeout(touchTimerRef.current)
            touchTimerRef.current = null
        }
        touchStartPosRef.current = null

        if (touchDragItem) {
            if (e.cancelable) e.preventDefault()
            const touch = e.changedTouches[0]
            const target = document.elementFromPoint(touch.clientX, touch.clientY)

            // Find drop zone attributes from target or parents
            let dropZone = target?.closest('[data-drop-zone]') as HTMLElement

            if (dropZone) {
                const zoneType = dropZone.dataset.dropZone
                const zoneIndex = dropZone.dataset.index ? parseInt(dropZone.dataset.index) : undefined

                // Trigger drop logic
                if (touchDragItem.source === 'hand' && !isNaN(touchDragItem.index)) {
                    const card = (touchDragItem.card as any).card || touchDragItem.card // handle potential wrapped object

                    if (zoneType === 'battle') {
                        if (battleField && canStack(card, battleField)) {
                            stackOnBattleField(touchDragItem.index, false) // Default to top stack for touch
                        } else {
                            playToBattleField(touchDragItem.index)
                        }
                    } else if (zoneType === 'bench' && typeof zoneIndex === 'number') {
                        if (bench[zoneIndex] && canStack(card, bench[zoneIndex]!)) {
                            stackOnBench(touchDragItem.index, zoneIndex, false)
                        } else {
                            playToBench(touchDragItem.index, zoneIndex)
                        }
                    } else if (zoneType === 'trash') {
                        moveToTrash(touchDragItem.index)
                    }
                } else if (touchDragItem.source === 'bench' && typeof touchDragItem.index === 'number') {
                    if (zoneType === 'battle') {
                        benchToBattleField(touchDragItem.index)
                    } else if (zoneType === 'bench' && typeof zoneIndex === 'number' && zoneIndex !== touchDragItem.index) {
                        // Swap or move logic (simplified copy from onDrop)
                        const newBench = [...bench]
                        const temp = newBench[zoneIndex]
                        newBench[zoneIndex] = newBench[touchDragItem.index]
                        newBench[touchDragItem.index] = temp
                        setBench(newBench)
                    } else if (zoneType === 'trash') {
                        benchToTrash(touchDragItem.index)
                    }
                } else if (touchDragItem.source === 'battle') {
                    if (zoneType === 'trash') {
                        battleFieldToTrash()
                    } else if (zoneType === 'bench' && typeof zoneIndex === 'number') {
                        // Move battle to bench (swap/move)
                        const newBench = [...bench]
                        newBench[zoneIndex] = battleField!
                        setBench(newBench)
                        setBattleField(null)
                    }
                }
            }

            setTouchDragItem(null)
        }
    }

    // Listen for custom event 'stadium-dropped' from parent page
    useEffect(() => {
        const handleStadiumDropped = (e: CustomEvent) => {
            const { playerName: droppedPlayerName, cardIndex } = e.detail
            if (droppedPlayerName === playerName && !isNaN(cardIndex)) {
                playStadium(cardIndex)
            }
        }

        window.addEventListener('stadium-dropped' as any, handleStadiumDropped as any)
        return () => {
            window.removeEventListener('stadium-dropped' as any, handleStadiumDropped as any)
        }
    }, [playerName, hand, onStadiumChange]) // Added onStadiumChange to dependencies

    const playToBattleField = (handIndex: number) => {
        const card = hand[handIndex]
        if (battleField) {
            // Move current battle field stack to trash
            setTrash([...trash, ...battleField.cards])
        }
        setBattleField(createStack(card))
        setHand(hand.filter((_, i) => i !== handIndex))
    }

    const stackOnBattleField = (handIndex: number, insertBelow: boolean) => {
        const card = hand[handIndex]
        if (battleField) {
            const newCards = insertBelow
                ? [card, ...battleField.cards]  // Insert at bottom
                : [...battleField.cards, card]  // Add on top

            const newStack = {
                cards: newCards,
                energyCount: isEnergy(card) ? battleField.energyCount + 1 : battleField.energyCount,
                toolCount: isTool(card) ? battleField.toolCount + 1 : battleField.toolCount,
                damage: battleField.damage
            }
            setBattleField(newStack)
            setHand(hand.filter((_, i) => i !== handIndex))
        }
    }

    const playToBench = (handIndex: number, benchSlot: number) => {
        if (bench[benchSlot]) return // Slot already occupied
        const card = hand[handIndex]
        const newBench = [...bench]
        newBench[benchSlot] = createStack(card)
        setBench(newBench)
        setHand(hand.filter((_, i) => i !== handIndex))
    }

    const stackOnBench = (handIndex: number, benchIndex: number, insertBelow: boolean) => {
        const card = hand[handIndex]
        const currentStack = bench[benchIndex]
        if (currentStack) {
            const newCards = insertBelow
                ? [card, ...currentStack.cards]
                : [...currentStack.cards, card]

            const newBench = [...bench]
            newBench[benchIndex] = {
                cards: newCards,
                energyCount: isEnergy(card) ? currentStack.energyCount + 1 : currentStack.energyCount,
                toolCount: isTool(card) ? currentStack.toolCount + 1 : currentStack.toolCount,
                damage: currentStack.damage
            }
            setBench(newBench)
            setHand(hand.filter((_, i) => i !== handIndex))
        }
    }

    const playStadium = (handIndex: number) => {
        if (onStadiumChange) {
            onStadiumChange(hand[handIndex])
            setHand(hand.filter((_, i) => i !== handIndex))
        }
    }

    const takePrizeCard = (index: number) => {
        const prize = prizeCards[index]
        setHand([...hand, prize])
        setPrizeCards(prizeCards.filter((_, i) => i !== index))
    }

    const battleFieldToTrash = () => {
        if (battleField) {
            setTrash([...trash, ...battleField.cards])
            setBattleField(null)
        }
    }

    const benchToTrash = (benchSlot: number) => {
        if (bench[benchSlot]) {
            setTrash([...trash, ...bench[benchSlot]!.cards])
            const newBench = [...bench]
            newBench[benchSlot] = null
            setBench(newBench)
        }
    }

    const benchToBattleField = (benchSlot: number) => {
        if (!bench[benchSlot]) return
        if (battleField) {
            setTrash([...trash, ...battleField.cards])
        }
        setBattleField(bench[benchSlot])
        const newBench = [...bench]
        newBench[benchSlot] = null
        setBench(newBench)
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

    return (
        <div className={compact ? "space-y-2" : "space-y-4"}>
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
                    {/* Trash removed from here, moved below */}
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
                    <div
                        className="bg-red-50 rounded-lg shadow-lg p-2 sm:p-3 relative cursor-pointer hover:bg-red-100 transition w-full"
                        onDragOver={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.add('ring-2', 'ring-red-400')
                        }}
                        onDragLeave={(e) => {
                            e.currentTarget.classList.remove('ring-2', 'ring-red-400')
                        }}
                        onDrop={(e) => {
                            e.preventDefault()
                            e.currentTarget.classList.remove('ring-2', 'ring-red-400')
                            const source = e.dataTransfer.getData('source')
                            const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'))

                            if (source === 'hand' && !isNaN(cardIndex)) {
                                moveToTrash(cardIndex)
                            } else if (source === 'battle') {
                                battleFieldToTrash()
                            } else if (source === 'bench' && !isNaN(cardIndex)) {
                                benchToTrash(cardIndex)
                            }
                        }}
                        onClick={() => setShowTrashViewer(true)}
                        // Add Touch Drop Zone Attributes
                        data-drop-zone="trash"
                    >
                        <h2 className="text-xs sm:text-sm font-bold text-black mb-1">トラッシュ</h2>
                        <div className="text-lg sm:text-xl font-bold text-red-600 pointer-events-none">{trash.length}枚</div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/10 rounded pointer-events-none">
                            <span className="text-[10px] font-bold text-red-800">DROP</span>
                        </div>
                    </div>
                </div>

                {/* Battle Field (Right Column) */}
                <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 w-full text-left">バトル場</h2>
                    {battleField ? (
                        <div
                            draggable={!isTouchDevice}
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => {
                                if (!isTouchDevice) handleDragStart(e, 0, 'battle')
                            }}
                            // Removed touch-none to allow scrolling, logic handled in onTouch handlers
                            className={`relative group inline-block cursor-move select-none ${selectedCard?.source === 'battle' ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => {
                                if (selectedCard?.source === 'bench' && selectedCard.index !== undefined) {
                                    benchToBattleField(selectedCard.index)
                                    setSelectedCard(null)
                                } else {
                                    // Set top card as selected
                                    setSelectedCard({ card: getTopCard(battleField), source: 'battle' })
                                }
                            }}
                            // Touch Drop Zone for Occupied Battle
                            data-drop-zone="battle"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                const source = e.dataTransfer.getData('source')
                                const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'))
                                const dragDuration = Date.now() - (dragStartTime || Date.now())
                                const isLongDragAction = dragDuration >= 500 // 500ms threshold for better UX

                                if (source === 'hand' && !isNaN(cardIndex)) {
                                    const card = hand[cardIndex]
                                    console.log('Dropping card:', card)
                                    console.log('Target stack:', battleField)
                                    if (battleField && canStack(card, battleField)) {
                                        console.log('Stacking on battlefield')
                                        stackOnBattleField(cardIndex, isLongDragAction)
                                    } else {
                                        console.log('Replacing battlefield card (canStack failed or battleField null)')
                                        playToBattleField(cardIndex)
                                    }
                                    setBattleField(bench[cardIndex])
                                } else if (source === 'damage' && battleField) {
                                    // Add damage counter
                                    const damage = parseInt(e.dataTransfer.getData('value'))
                                    if (!isNaN(damage)) {
                                        setBattleField({
                                            ...battleField,
                                            damage: battleField.damage + damage
                                        })
                                    }
                                }
                                setDragStartTime(null)
                                setIsLongDrag(false)
                            }}
                        >
                            <CascadingStack stack={battleField} width={sizes.battle.w} height={sizes.battle.h} />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    battleFieldToTrash()
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition z-50"
                            >
                                トラッシュ
                            </button>
                        </div>
                    ) : (
                        <div
                            className="rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs cursor-pointer hover:border-blue-400"
                            style={{ width: sizes.battle.w, height: sizes.battle.h }}
                            onClick={() => {
                                if (selectedCard?.source === 'bench' && selectedCard.index !== undefined) {
                                    benchToBattleField(selectedCard.index)
                                    setSelectedCard(null)
                                }
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                const source = e.dataTransfer.getData('source')
                                const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'))

                                if (source === 'damage') {
                                    return
                                }

                                if (source === 'hand' && !isNaN(cardIndex)) {
                                    playToBattleField(cardIndex)
                                } else if (source === 'bench' && !isNaN(cardIndex)) {
                                    benchToBattleField(cardIndex)
                                }
                                setDragStartTime(null)
                                setIsLongDrag(false)
                            }}
                            // Touch Drop Zone
                            data-drop-zone="battle"
                        >
                            なし
                        </div>
                    )}
                </div>
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
                <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
                    {bench.slice(0, benchSize).map((stack, i) => (
                        <div key={i} className="flex-shrink-0">
                            {stack ? (
                                <div
                                    draggable={!isTouchDevice}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onDragStart={(e) => {
                                        if (!isTouchDevice) handleDragStart(e, i, 'bench')
                                    }}

                                    // Removed touch-none
                                    className={`relative group inline-block cursor-move select-none ${selectedCard?.source === 'bench' && selectedCard.index === i ? 'ring-2 ring-blue-500' : ''}`}
                                    onClick={() => setSelectedCard({ card: getTopCard(stack), source: 'bench', index: i })}
                                    // Touch Drop Zone for Occupied Bench
                                    data-drop-zone="bench"
                                    data-index={i}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const source = e.dataTransfer.getData('source')
                                        const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'))
                                        const dragDuration = Date.now() - (dragStartTime || Date.now())
                                        const isLongDragAction = dragDuration >= 500

                                        if (source === 'hand' && !isNaN(cardIndex)) {
                                            const card = hand[cardIndex]
                                            console.log('Dropping on bench:', card)
                                            if (stack && canStack(card, stack)) {
                                                stackOnBench(cardIndex, i, isLongDragAction)
                                            } else {
                                                // Ask confirmation or just fail? For now, if can't stack, do nothing or replace?
                                                // Typically in valid game state we shouldn't replace.
                                                console.log('Comparison failed for bench stack')
                                            }
                                        } else if (source === 'bench' && !isNaN(cardIndex) && cardIndex !== i) {
                                            // Swap bench slots
                                            const newBench = [...bench]
                                            const temp = newBench[i]
                                            newBench[i] = newBench[cardIndex]
                                            newBench[cardIndex] = temp
                                            setBench(newBench)
                                            // Move from battle to occupied bench (swap)
                                            if (battleField) {
                                                const newBench = [...bench]
                                                newBench[i] = battleField
                                                setBench(newBench)
                                                setBattleField(stack)
                                            }
                                        } else if (source === 'damage' && stack) {
                                            const damage = parseInt(e.dataTransfer.getData('value'))
                                            if (!isNaN(damage)) {
                                                const newBench = [...bench]
                                                newBench[i] = {
                                                    ...stack,
                                                    damage: stack.damage + damage
                                                }
                                                setBench(newBench)
                                            }
                                        }
                                        setDragStartTime(null)
                                        setIsLongDrag(false)
                                    }}
                                    // Touch Handlers
                                    onTouchStart={(e) => handleTouchStart(e, stack, i, 'bench')}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <CascadingStack stack={stack} width={sizes.bench.w} height={sizes.bench.h} />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            benchToTrash(i)
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition z-50"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs cursor-pointer hover:border-blue-400"
                                    style={{ width: sizes.bench.w, height: sizes.bench.h }}
                                    onClick={() => {
                                        if (selectedCard?.source === 'hand') {
                                            playToBench(hand.indexOf(selectedCard.card), i)
                                            setSelectedCard(null)
                                        } else if (selectedCard?.source === 'battle') {
                                            // Move battle to empty bench
                                            const newBench = [...bench]
                                            newBench[i] = battleField!
                                            setBench(newBench)
                                            setBattleField(null)
                                            setSelectedCard(null)
                                        } else if (selectedCard?.source === 'bench' && selectedCard.index !== undefined) {
                                            // Move bench to empty bench
                                            const newBench = [...bench]
                                            newBench[i] = bench[selectedCard.index]
                                            newBench[selectedCard.index] = null
                                            setBench(newBench)
                                            setSelectedCard(null)
                                        }
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const source = e.dataTransfer.getData('source')
                                        const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'))
                                        if (source === 'hand' && !isNaN(cardIndex)) {
                                            playToBench(cardIndex, i)
                                        } else if (source === 'bench' && !isNaN(cardIndex) && cardIndex !== i) {
                                            // Move bench to empty slot
                                            const newBench = [...bench]
                                            newBench[i] = newBench[cardIndex]
                                            newBench[cardIndex] = null
                                            setBench(newBench)
                                        } else if (source === 'battle') {
                                            // Move battle to empty bench slot
                                            if (battleField) {
                                                const newBench = [...bench]
                                                newBench[i] = battleField
                                                setBattleField(null)
                                                setBench(newBench)
                                            }
                                        }
                                        setDragStartTime(null)
                                        setIsLongDrag(false)
                                    }}
                                    // Touch Drop Zone
                                    data-drop-zone="bench"
                                    data-index={i}
                                >
                                    空き
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>


            {/* Hand */}
            <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">手札</h2>
                {
                    hand.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 text-xs sm:text-sm">手札がありません</p>
                    ) : (
                        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
                            {hand.map((card, i) => (
                                <div
                                    key={i}
                                    draggable={!isTouchDevice}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onDragStart={(e) => {
                                        if (!isTouchDevice) handleDragStart(e, i, 'hand')
                                    }}

                                    className={`flex-shrink-0 cursor-move select-none relative transition-all ${selectedCard?.source === 'hand' && selectedCard.index === i
                                            ? 'ring-4 ring-blue-500 transform -translate-y-2 z-10'
                                            : 'hover:transform hover:-translate-y-1'
                                        }`}
                                    onClick={() => {
                                        if (selectedCard?.source === 'hand' && selectedCard.index === i) {
                                            setSelectedCard(null) // Deselect if already selected
                                        } else {
                                            setSelectedCard({ card, source: 'hand', index: i })
                                        }
                                    }}
                                    // Touch Handlers
                                    onTouchStart={(e) => handleTouchStart(e, card, i, 'hand')}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <Image
                                        src={card.imageUrl}
                                        alt={card.name}
                                        width={sizes.hand.w}
                                        height={sizes.hand.h}
                                        className="rounded-lg shadow-lg hover:shadow-xl transition"
                                    />
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>

            {/* Deck Viewer Modal */}
            {
                showDeckViewer && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeckViewer(false)}
                    >
                        <div
                            className="bg-white rounded-lg p-4 w-fit max-w-[95vw] max-h-[80vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">山札確認 ({remaining.length}枚)</h2>
                                <button
                                    onClick={() => setShowDeckViewer(false)}
                                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                >
                                    閉じる
                                </button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
                                {remaining.map((card, i) => (
                                    <div key={i} className="relative">
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={100}
                                            height={140}
                                            className="rounded shadow cursor-pointer hover:ring-2 hover:ring-blue-500"
                                            onClick={() => setSelectedCard({ card, source: 'hand', index: i })}
                                        />
                                        {selectedCard?.index === i && selectedCard?.source === 'hand' && (
                                            <div className="absolute top-0 left-full ml-2 bg-white rounded-lg shadow-xl p-2 z-[9999] min-w-[200px] border border-gray-200">
                                                <button
                                                    onClick={() => {
                                                        setHand([...hand, card])
                                                        setRemaining(remaining.filter((_, idx) => idx !== i))
                                                        setSelectedCard(null)
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 bg-white text-gray-900 rounded text-sm font-bold border-b border-gray-100"
                                                >
                                                    手札に加える
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const emptySlot = bench.findIndex(slot => slot === null)
                                                        if (emptySlot !== -1) {
                                                            const newBench = [...bench]
                                                            newBench[emptySlot] = createStack(card)
                                                            setBench(newBench)
                                                            setRemaining(remaining.filter((_, idx) => idx !== i))
                                                            setSelectedCard(null)
                                                        }
                                                    }}
                                                    disabled={!bench.some(slot => slot === null)}
                                                    className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    ベンチへ
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Trash Viewer Modal */}
            {
                showTrashViewer && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowTrashViewer(false)}
                    >
                        <div
                            className="bg-white rounded-lg p-4 w-fit max-w-[95vw] max-h-[80vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">トラッシュ確認 ({trash.length}枚)</h2>
                                <button
                                    onClick={() => setShowTrashViewer(false)}
                                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                >
                                    閉じる
                                </button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
                                {trash.map((card, i) => (
                                    <div key={i} className="relative">
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={100}
                                            height={140}
                                            className="rounded shadow cursor-pointer hover:ring-2 hover:ring-blue-500"
                                            onClick={() => setSelectedCard({ card, source: 'hand', index: i })}
                                        />
                                        {selectedCard?.index === i && selectedCard?.source === 'hand' && (
                                            <div className="absolute top-0 left-full ml-2 bg-white rounded-lg shadow-xl p-2 z-[9999] min-w-[200px] border border-gray-200">
                                                <button
                                                    onClick={() => {
                                                        setRemaining([...remaining, card])
                                                        setTrash(trash.filter((_, idx) => idx !== i))
                                                        setSelectedCard(null)
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 bg-white text-gray-900 rounded text-sm font-bold border-b border-gray-100"
                                                >
                                                    山札へ加える
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setHand([...hand, card])
                                                        setTrash(trash.filter((_, idx) => idx !== i))
                                                        setSelectedCard(null)
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm"
                                                >
                                                    手札へ加える
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div >
                )
            }
            {/* Drag Proxy for Touch Devices */}
            {
                touchDragItem && (
                    <div
                        className="fixed pointer-events-none z-[9999] opacity-80"
                        style={{
                            left: touchDragItem.x,
                            top: touchDragItem.y,
                            transform: 'translate(-50%, -50%)',
                            width: sizes.hand.w, // Approximate size
                        }}
                    >
                        {/* Simple visual proxy */}
                        <div className="bg-blue-500 text-white p-2 rounded shadow-lg text-xs font-bold">
                            Moving...
                        </div>
                    </div>
                )
            }
        </div >
    )
}

// Cascading Stack Component
function CascadingStack({ stack, width = 60, height = 84 }: { stack: CardStack, width?: number, height?: number }) {
    const cardOffset = 20 // pixels
    const maxVisible = 5 // Show max 5 cards
    const visibleCards = stack.cards.slice(-maxVisible)

    // Calculate dimensions based on typical card size ratio (63/88)
    // Assuming base size w=60, h=84 from sizes in DeckPractice
    const totalHeight = height + ((visibleCards.length - 1) * cardOffset)

    return (
        <div
            className="relative"
            style={{
                width: width,
                height: totalHeight,
                marginBottom: (visibleCards.length - 1) * cardOffset
            }}
        >
            {visibleCards.map((card, i) => (
                <div
                    key={i}
                    className="absolute top-0 left-0 transition-transform hover:z-50"
                    style={{
                        transform: `translateY(${i * cardOffset}px)`,
                        zIndex: i,
                        height: height
                    }}
                >
                    <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={width}
                        height={height}
                        className="rounded shadow-md hover:shadow-xl transition border border-gray-200 bg-white"
                    />
                </div>
            ))}

            {/* Stack Info Badge */}
            {(stack.cards.length > 1 || stack.energyCount > 0 || stack.toolCount > 0) && (
                <div className="absolute -bottom-2 -right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded-full flex gap-1 z-50 pointer-events-none whitespace-nowrap">
                    {stack.cards.length > 1 && <span>📚{stack.cards.length}</span>}
                    {stack.energyCount > 0 && <span className="text-yellow-400">⚡{stack.energyCount}</span>}
                    {stack.toolCount > 0 && <span className="text-purple-400">🔧{stack.toolCount}</span>}
                </div>
            )}

            {/* Damage Counters Display */}
            {stack.damage > 0 && (
                <div className="absolute top-0 right-0 p-1 flex flex-col gap-0.5 z-40 pointer-events-none">
                    {/* Simplified total display, could be more elaborate with 10/50/100 counters */}
                    <div className="bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-sm">
                        {stack.damage}
                    </div>
                </div>
            )}
        </div>
    )
}
