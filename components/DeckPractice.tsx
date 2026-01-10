
'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import Image from 'next/image'
import { type Card } from '@/lib/deckParser'
import { CardStack, createStack, getTopCard, canStack, isEnergy, isTool, isPokemon, isStadium } from '@/lib/cardStack'
import {
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragEndEvent,
    DragStartEvent,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface DeckPracticeProps {
    deck: Card[]
    onReset: () => void
    playerName?: string
    compact?: boolean
    stadium?: Card | null
    onStadiumChange?: (stadium: Card | null) => void
    idPrefix?: string
    mobile?: boolean
    isOpponent?: boolean
}

export interface DeckPracticeRef {
    handleExternalDragEnd: (event: any) => void
    playStadium: (index: number) => void
}

interface MenuState {
    isOpen: boolean
    card: Card | CardStack
    source: 'hand' | 'battle' | 'bench'
    index: number
    x: number
    y: number
    rect?: {
        top: number
        left: number
        right: number
        bottom: number
        width: number
        height: number
    }
}

// Track if we are in "Swap Mode" (selecting a target to swap with)
interface SwapState {
    active: boolean
    sourceIndex: number // Index in bench (if source is bench)
    sourceType: 'battle' | 'bench'
}

interface DeckMenuState {
    index: number
    x: number
    y: number
}

interface AttachMode {
    active: boolean
    card: Card
    sourceIndex: number // Index in trash
}

const DeckPractice = forwardRef<DeckPracticeRef, DeckPracticeProps>(({ deck, onReset, playerName = "プレイヤー", compact = false, stadium: externalStadium, onStadiumChange, idPrefix = "", mobile = false, isOpponent = false }, ref) => {
    const [hand, setHand] = useState<Card[]>([])
    const [remaining, setRemaining] = useState<Card[]>(deck)
    const [trash, setTrash] = useState<Card[]>([])
    const [battleField, setBattleField] = useState<CardStack | null>(null)
    const [benchSize, setBenchSize] = useState(5)
    // Initialize bench with 8 slots but valid based on benchSize
    const [bench, setBench] = useState<(CardStack | null)[]>(new Array(8).fill(null))
    const [prizeCards, setPrizeCards] = useState<Card[]>([])
    const [initialized, setInitialized] = useState(false)

    // Missing state variables for menu and drag state
    const [menu, setMenu] = useState<MenuState | null>(null)
    const [swapMode, setSwapMode] = useState<SwapState | null>(null)
    const [deckCardMenu, setDeckCardMenu] = useState<DeckMenuState | null>(null)
    const [trashCardMenu, setTrashCardMenu] = useState<DeckMenuState | null>(null)
    const [attachMode, setAttachMode] = useState<AttachMode | null>(null)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [activeDragData, setActiveDragData] = useState<any>(null)

    useImperativeHandle(ref, () => ({
        handleExternalDragEnd: (event: any) => {
            const { active, over } = event
            if (!over) return

            const source = active.data.current as any
            const targetId = over.id as string

            // Route based on prefixed target
            const ownPrefix = idPrefix ? `${idPrefix}-` : ""
            if (!targetId.startsWith(ownPrefix) && targetId !== 'stadium-zone') return

            let localTargetId = targetId.startsWith(ownPrefix) ? targetId.slice(ownPrefix.length) : targetId

            // Normalize card targets to zone targets for damage counters and attachments
            if (localTargetId === 'battle-card') localTargetId = 'battle-field'
            if (localTargetId.startsWith('bench-card-')) {
                localTargetId = localTargetId.replace('bench-card-', 'bench-slot-')
            }

            // Hand logic (card plays)
            if (source.type === 'hand' && source.playerPrefix === idPrefix) {
                const card = hand[source.index]
                if (localTargetId === 'stadium-zone') {
                    if (isStadium(card)) {
                        playStadium(source.index)
                    } else {
                        alert("スタジアムカードではありません")
                    }
                } else if (localTargetId === 'battle-field') {
                    if (isPokemon(card)) {
                        if (!battleField || canStack(card, battleField)) {
                            playToBattleField(source.index)
                        } else {
                            alert("このカードはバトル場のポケモンに付けられません")
                        }
                    } else if ((isEnergy(card) || isTool(card)) && battleField) {
                        if (canStack(card, battleField)) {
                            playToBattleField(source.index)
                        } else {
                            alert("このカードはバトル場のポケモンに付けられません")
                        }
                    } else {
                        alert("ポケモン以外のカードは直接場に出せません")
                    }
                } else if (localTargetId.startsWith('bench-slot-')) {
                    const targetIndex = parseInt(localTargetId.replace('bench-slot-', ''))
                    const targetStack = bench[targetIndex]

                    if (isPokemon(card)) {
                        if (!targetStack || canStack(card, targetStack)) {
                            playToBench(source.index, targetIndex)
                        } else {
                            alert("このカードは選択したポケモンに重ねられません")
                        }
                    } else if ((isEnergy(card) || isTool(card)) && targetStack) {
                        if (canStack(card, targetStack)) {
                            playToBench(source.index, targetIndex)
                        } else {
                            alert("このカードは選択したポケモンに付けられません")
                        }
                    } else if (!targetStack) {
                        alert("空のベンチにはポケモンのみ置けます")
                    }
                } else if (localTargetId === 'trash-zone') {
                    trashFromHand(source.index)
                }
            }
            // Internal movement (Battle to Bench, etc)
            else if (source.playerPrefix === idPrefix) {
                if (source.type === 'battle') {
                    if (localTargetId.startsWith('bench-slot-')) {
                        const targetIndex = parseInt(localTargetId.replace('bench-slot-', ''))
                        performSwapFromDnd('battle', 0, targetIndex)
                    } else if (localTargetId === 'trash-zone') {
                        battleToTrash()
                    }
                } else if (source.type === 'bench') {
                    if (localTargetId === 'battle-field') {
                        swapBenchToBattle(source.index)
                    } else if (localTargetId === 'trash-zone') {
                        benchToTrash(source.index)
                    } else if (localTargetId.startsWith('bench-slot-')) {
                        const targetIndex = parseInt(localTargetId.replace('bench-slot-', ''))
                        if (targetIndex !== source.index) {
                            performSwapFromDnd('bench', source.index, targetIndex)
                        }
                    }
                }
            }
            // Damage Counter logic (shared)
            if (source.type === 'counter') {
                if (localTargetId === 'battle-field') {
                    updateDamage('battle', 0, source.amount)
                } else if (localTargetId.startsWith('bench-slot-')) {
                    const targetIndex = parseInt(localTargetId.replace('bench-slot-', ''))
                    updateDamage('bench', targetIndex, source.amount)
                }
            }
        },
        playStadium: (index: number) => {
            playStadium(index)
        }
    }))

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

        // If in Attach Mode, perform attachment instead of opening menu
        if (attachMode && (source === 'battle' || source === 'bench')) {
            handleAttach(source, index)
            return
        }

        // If in swap mode and clicking a valid target (Bench), perform swap
        if (swapMode && swapMode.active && source === 'bench') {
            performSwap(index)
            return
        }

        // Otherwise open menu
        const rect = e.currentTarget.getBoundingClientRect()
        setMenu({
            isOpen: true,
            card,
            source,
            index,
            x: e.clientX,
            y: e.clientY,
            rect: {
                top: rect.top,
                left: rect.left,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height
            }
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
            if (canStack(card, battleField)) {
                setBattleField({
                    ...battleField,
                    cards: [...battleField.cards, card],
                    energyCount: battleField.energyCount + (isEnergy(card) ? 1 : 0),
                    toolCount: battleField.toolCount + (isTool(card) ? 1 : 0)
                })
            } else {
                setTrash([...trash, ...battleField.cards])
                setBattleField(createStack(card))
            }
        } else {
            setBattleField(createStack(card))
        }
        setHand(hand.filter((_, i) => i !== handIndex))
        closeMenu()
    }

    const playToBench = (handIndex: number, targetIndex?: number) => {
        const card = hand[handIndex]
        const newBench = [...bench]

        if (targetIndex !== undefined) {
            const stack = bench[targetIndex]
            if (stack) {
                if (canStack(card, stack)) {
                    newBench[targetIndex] = {
                        ...stack,
                        cards: [...stack.cards, card],
                        energyCount: stack.energyCount + (isEnergy(card) ? 1 : 0),
                        toolCount: stack.toolCount + (isTool(card) ? 1 : 0)
                    }
                } else {
                    setTrash([...trash, ...stack.cards])
                    newBench[targetIndex] = createStack(card)
                }
            } else {
                newBench[targetIndex] = createStack(card)
            }
        } else {
            const emptySlotIndex = bench.findIndex((slot, i) => i < benchSize && slot === null)
            if (emptySlotIndex !== -1) {
                newBench[emptySlotIndex] = createStack(card)
            } else {
                alert("ベンチがいっぱいです")
                return
            }
        }

        setBench(newBench)
        setHand(hand.filter((_, i) => i !== handIndex))
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

    const handleDragStart = (event: DragStartEvent) => {
        // Parent will handle global start if needed,
        // but internal drags still need metadata
        lockScroll()
    }

    const handleDragEnd = (event: DragEndEvent) => {
        unlockScroll()
        // Removed undefined parentHandleDragEnd
    }

    const playStadium = (handIndex: number) => {
        const card = hand[handIndex]
        if (!isStadium(card)) {
            alert("スタジアムカードではありません")
            return
        }

        if (onStadiumChange) {
            onStadiumChange(card)
            setHand(hand.filter((_, i) => i !== handIndex))
        } else {
            alert("スタジアムの設定ができません（Props未定義）")
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

    // Deck movement functions
    const moveFromDeckToHand = (index: number) => {
        const card = remaining[index]
        setHand([...hand, card])
        setRemaining(remaining.filter((_, i) => i !== index))
    }

    const moveFromDeckToBench = (index: number) => {
        const card = remaining[index]
        const firstEmptyIndex = bench.findIndex(s => s === null)
        if (firstEmptyIndex !== -1 && firstEmptyIndex < benchSize) {
            const newBench = [...bench]
            newBench[firstEmptyIndex] = createStack(card)
            setBench(newBench)
            setRemaining(remaining.filter((_, i) => i !== index))
        } else {
            alert("ベンチに空きがありません")
        }
    }

    const moveFromDeckToTrash = (index: number) => {
        const card = remaining[index]
        setTrash([...trash, card])
        setRemaining(remaining.filter((_, i) => i !== index))
    }

    const moveFromDeckToBattleField = (index: number) => {
        const card = remaining[index]
        if (!battleField) {
            setBattleField(createStack(card))
            setRemaining(remaining.filter((_, i) => i !== index))
        } else {
            alert("バトル場が埋まっています")
        }
    }

    const updateDamage = (source: 'battle' | 'bench', index: number, delta: number) => {
        if (source === 'battle') {
            if (!battleField) return
            const newDamage = Math.max(0, battleField.damage + delta)
            setBattleField({ ...battleField, damage: newDamage })
        } else {
            const stack = bench[index]
            if (!stack) return
            const newDamage = Math.max(0, stack.damage + delta)
            const newBench = [...bench]
            newBench[index] = { ...stack, damage: newDamage }
            setBench(newBench)
        }
    }

    // Trash Menu Actions
    const moveFromTrashToHand = (index: number) => {
        const card = trash[index]
        setHand([...hand, card])
        setTrash(trash.filter((_, i) => i !== index))
        setTrashCardMenu(null)
    }

    const moveFromTrashToDeck = (index: number) => {
        const card = trash[index]
        const newDeck = [...remaining, card].sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setTrash(trash.filter((_, i) => i !== index))
        setTrashCardMenu(null)
        alert("山札に戻してシャッフルしました")
    }

    const startAttachFromTrash = (index: number) => {
        const card = trash[index]
        setAttachMode({ active: true, card, sourceIndex: index })
        setShowTrashViewer(false)
        setTrashCardMenu(null)
    }

    const handleAttach = (targetType: 'battle' | 'bench', targetIndex: number) => {
        if (!attachMode) return

        const card = attachMode.card
        if (targetType === 'battle') {
            if (battleField && canStack(card, battleField)) {
                setBattleField({
                    ...battleField,
                    cards: [...battleField.cards, card],
                    energyCount: battleField.energyCount + (isEnergy(card) ? 1 : 0),
                    toolCount: battleField.toolCount + (isTool(card) ? 1 : 0)
                })
                setTrash(trash.filter((_, i) => i !== attachMode.sourceIndex))
                setAttachMode(null)
            } else {
                alert("このカードはバトル場のポケモンに付けられません")
            }
        } else {
            const stack = bench[targetIndex]
            if (stack && canStack(card, stack)) {
                const newBench = [...bench]
                newBench[targetIndex] = {
                    ...stack,
                    cards: [...stack.cards, card],
                    energyCount: stack.energyCount + (isEnergy(card) ? 1 : 0),
                    toolCount: stack.toolCount + (isTool(card) ? 1 : 0)
                }
                setBench(newBench)
                setTrash(trash.filter((_, i) => i !== attachMode.sourceIndex))
                setAttachMode(null)
            } else {
                alert("このカードは選択したポケモンに付けられません")
            }
        }
    }

    // --- UI Helpers ---

    const SIZES = {
        standard: {
            battle: { w: 100, h: 140 },
            bench: { w: 80, h: 112 },
            hand: { w: 90, h: 126 }
        },
        mobile: {
            battle: { w: 50, h: 70 },
            bench: { w: 40, h: 56 },
            hand: { w: 45, h: 63 }
        }
    }
    const sizes = mobile ? SIZES.mobile : SIZES.standard



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
        <div className={`w-full ${compact ? "space-y-0.5 sm:space-y-2" : "space-y-4"} relative`}>
            {/* Context Menu */}
            {menu && (
                <div
                    className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[170px]"
                    style={{
                        top: menu.rect ? Math.min(menu.rect.top, window.innerHeight - 250) : Math.min(menu.y, window.innerHeight - 200),
                        left: menu.rect
                            ? (menu.rect.right + 180 < window.innerWidth
                                ? menu.rect.right + 10
                                : (menu.rect.left - 180 > 0
                                    ? menu.rect.left - 180
                                    : Math.max(10, window.innerWidth - 180)))
                            : Math.min(menu.x, window.innerWidth - 170)
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-gray-50 px-3 py-2 border-b text-xs font-bold text-gray-700">
                        {menu.source === 'hand' ? '手札 ' : menu.source === 'battle' ? 'バトル場 ' : 'ベンチ '}: {(menu.card as any).name || 'カード'}
                    </div>
                    <div className="flex flex-col">
                        {menu.source === 'hand' && (
                            <>
                                {isPokemon(menu.card as Card) && (
                                    <>
                                        <button onClick={() => playToBattleField(menu.index)} className="text-left px-4 py-3 hover:bg-purple-50 text-sm border-b transition-colors text-black font-bold">
                                            バトル場に出す
                                        </button>
                                        <button onClick={() => playToBench(menu.index)} className="text-left px-4 py-3 hover:bg-blue-50 text-sm border-b transition-colors text-black font-bold">
                                            ベンチに出す
                                        </button>
                                    </>
                                )}
                                {isStadium(menu.card as Card) && (
                                    <button onClick={() => { playStadium(menu.index); closeMenu(); }} className="text-left px-4 py-3 hover:bg-green-50 text-sm border-b transition-colors text-green-700 font-bold">
                                        スタジアムを出す
                                    </button>
                                )}
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

            {/* Attach Prompt */}
            {attachMode && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-bounce font-bold flex items-center gap-3">
                    <span>付ける先のポケモンを選択してください: {attachMode.card.name}</span>
                    <button
                        onClick={() => setAttachMode(null)}
                        className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs"
                    >キャンセル</button>
                </div>
            )}
            {/* Reverted Layout - Vertical Stack */}
            <div className="flex flex-col gap-4">
                {/* Compact Control Header */}
                <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-gray-100 flex flex-wrap items-center gap-2 sm:gap-4 justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{playerName}</span>
                        <div className="h-4 w-px bg-gray-200 mx-1"></div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Hand</span>
                                <span className="text-sm font-black text-green-600">{hand.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1 sm:gap-2">
                        <button onClick={() => drawCards(1)} disabled={remaining.length === 0} className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600 transition disabled:opacity-50">引く</button>
                        <button onClick={shuffleDeck} className="px-3 py-1 bg-purple-500 text-white rounded text-xs font-bold hover:bg-purple-600 transition tracking-tighter">シャッフル</button>
                        <button onClick={mulligan} className="px-3 py-1 bg-cyan-600 text-white rounded text-xs font-bold hover:bg-cyan-700 transition tracking-tighter">引き直し</button>
                        <button onClick={useNanjamo} className="px-3 py-1 bg-pink-500 text-white rounded text-xs font-bold hover:bg-pink-600 transition">ナンジャモ</button>
                        <button onClick={useJudge} className="px-3 py-1 bg-indigo-500 text-white rounded text-xs font-bold hover:bg-indigo-600 transition">ジャッジマン</button>
                        <button onClick={() => setShowDeckViewer(true)} className="px-3 py-1 bg-amber-500 text-white rounded text-xs font-bold hover:bg-amber-600 transition">山札</button>
                        <button onClick={() => setShowTrashViewer(true)} disabled={trash.length === 0} className="px-3 py-1 bg-red-400 text-white rounded text-xs font-bold hover:bg-red-500 transition disabled:opacity-50">トラッシュ</button>
                        <button onClick={onReset} className="px-3 py-1 bg-gray-500 text-white rounded text-xs font-bold hover:bg-gray-600 transition">リセット</button>
                    </div>
                </div>

            </div>

            {/* Hand - Top for Opponent */}
            {/* Hand - Top for Opponent (Mobile Only) */}
            {(mobile && isOpponent) && (
                <div className="bg-white rounded-lg shadow p-0.5 sm:p-3 border border-gray-100 overflow-hidden mb-1">
                    <h2 className="text-[10px] sm:text-sm font-bold text-gray-900 mb-0.5 uppercase">手札 ({hand.length}枚)</h2>
                    <div className="flex overflow-x-auto gap-1 sm:gap-3 py-1 sm:py-4 px-1 sm:px-4 scrollbar-black">
                        {hand.map((card, i) => (
                            <DraggableCard
                                key={i}
                                id={`${idPrefix}-hand-card-${i}`}
                                data={{ type: 'hand', index: i, card, playerPrefix: idPrefix }}
                                onClick={(e) => handleCardClick(e, card, 'hand', i)}
                                className="flex-shrink-0"
                            >
                                <div className="relative hover:scale-105 transition-transform cursor-pointer shadow-md rounded">
                                    <Image
                                        src={card.imageUrl}
                                        alt={card.name}
                                        width={sizes.hand.w}
                                        height={sizes.hand.h}
                                        className="rounded"
                                    />
                                </div>
                            </DraggableCard>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Battle Area: Dynamically ordered based on isOpponent */}
            {/* 
                   Normal (P1): Main Row (Battle/Prizes) -> Bench Row
                   Opponent (P2): Bench Row -> Main Row (Battle/Prizes)
                */}
            <div className={`flex flex-col gap-0.5 sm:gap-2 ${(mobile && isOpponent) ? 'flex-col-reverse' : ''}`}>

                {/* Main Row: Prizes, Battle */}
                <div className="flex flex-row gap-0.5 sm:gap-4 items-start justify-center order-none">
                    {/* Prizes - Desktop Only */}
                    {!mobile && (
                        <div className={`bg-white rounded-lg shadow p-0.5 sm:p-2 border border-gray-100 min-w-[140px]`}>
                            <h2 className="text-[8px] sm:text-[10px] font-bold text-gray-400 mb-0.5 sm:mb-2 uppercase tracking-tight">サイド ({prizeCards.length})</h2>
                            <div className="flex -space-x-8 sm:-space-x-10 px-1 sm:px-2 py-1 sm:py-4 h-20 sm:h-32 items-center">
                                {prizeCards.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => takePrizeCard(i)}
                                        className="w-8 h-12 sm:w-14 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-700 rounded shadow hover:scale-105 hover:-translate-y-2 transition flex items-center justify-center text-white font-bold text-xs sm:text-lg border border-white/20 transform"
                                        style={{ zIndex: prizeCards.length - i }}
                                    >
                                        ?
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Battle Field */}
                    <div className="flex-1 flex justify-center">
                        <DroppableZone id={`${idPrefix}-battle-field`} className={`bg-white rounded-lg shadow-lg p-1 sm:p-3 border border-gray-100 ${attachMode ? 'ring-2 ring-green-400 animate-pulse' : ''} ${mobile ? 'min-w-[70px]' : 'min-w-[180px]'} flex flex-col items-center`}>
                            <h2 className="text-[10px] sm:text-sm font-bold text-gray-900 uppercase mb-1 sm:mb-2 w-full text-center">バトル場</h2>
                            {battleField ? (
                                <DraggableCard
                                    id={`${idPrefix}-battle-card`}
                                    data={{ type: 'battle', index: 0, card: battleField, playerPrefix: idPrefix }}
                                    onClick={(e) => handleCardClick(e, battleField!, 'battle', 0)}
                                >
                                    <CascadingStack stack={battleField} width={sizes.battle.w} height={sizes.battle.h} />
                                </DraggableCard>
                            ) : (
                                <div
                                    className="rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs cursor-pointer hover:border-blue-400"
                                    style={{ width: sizes.battle.w, height: sizes.battle.h }}
                                >
                                    Active Pokemon
                                </div>
                            )}
                        </DroppableZone>
                    </div>

                    {/* Deck & Trash - Desktop Only (Restored PC Layout) */}
                    {!mobile && (
                        <div className={`flex flex-col gap-2 w-[120px]`}>
                            {/* Visual Deck */}
                            <div
                                className={`bg-blue-50 rounded-lg shadow p-2 border-2 border-blue-200 h-[100px] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition`}
                                onClick={() => setShowDeckViewer(true)}
                            >
                                <h2 className="text-[10px] font-bold text-blue-500 mb-1 uppercase tracking-tight">Deck</h2>
                                <div className="text-xl font-black text-blue-700">{remaining.length}</div>
                            </div>

                            {/* Trash */}
                            <DroppableZone id={`${idPrefix}-trash-zone`} className="w-full">
                                <div
                                    className={`bg-red-50 rounded-lg shadow p-2 relative cursor-pointer hover:bg-red-100 transition border-2 border-dashed border-red-200 h-[100px] flex flex-col items-center justify-center`}
                                    onClick={() => setShowTrashViewer(true)}
                                >
                                    <h2 className="text-[10px] font-bold text-red-400 mb-1 uppercase tracking-tight">Trash</h2>
                                    <div className="text-xl font-black text-red-600">{trash.length}</div>
                                </div>
                            </DroppableZone>
                        </div>
                    )}
                </div>

                {/* Bench Row: Includes Deck/Trash on the Right */}
                <div className="bg-gray-50/50 rounded-lg shadow p-1 sm:p-3 w-full overflow-hidden border border-gray-100 order-none flex flex-row">
                    {/* Mobile Only: Side (Prizes) on Left of Bench */}
                    {/* Mobile Only: Side (Prizes) on Left of Bench - True Absolute Stack */}
                    {mobile && (
                        <div className="flex flex-col items-center justify-center pr-1 border-r border-gray-200 mr-1 h-[80px]">
                            {/* Stack Container - Relative, fixed size */}
                            <div className="relative w-8 h-12 mb-1">
                                {prizeCards.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => takePrizeCard(i)}
                                        className="absolute left-0 w-8 h-10 bg-gradient-to-br from-blue-500 to-indigo-700 rounded shadow hover:scale-105 transition flex items-center justify-center text-white font-bold text-[8px] border border-white/20 transform rotate-90 origin-center"
                                        style={{
                                            zIndex: prizeCards.length - i,
                                            top: `${i * 3}px` // 3px vertical offset per card
                                        }}
                                    >
                                        ?
                                    </button>
                                ))}
                            </div>
                            <h2 className="text-[8px] font-bold text-gray-400 text-center leading-none mt-1">サイド</h2>
                        </div>
                    )}

                    {/* Left: Bench Cards (Scrollable) */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-[10px] sm:text-sm font-bold text-gray-900 uppercase">ベンチ</h2>
                            <button onClick={increaseBenchSize} disabled={benchSize >= 8} className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] shadow hover:bg-blue-600">+</button>
                            <span className="text-[8px] text-gray-500">Max: {benchSize}</span>
                        </div>
                        <div className="flex gap-1 sm:gap-6 overflow-x-auto py-2 px-1 scrollbar-black items-end h-[80px] sm:h-auto">
                            {bench.slice(0, benchSize).map((stack, i) => (
                                <DroppableZone key={i} id={`${idPrefix}-bench-slot-${i}`} className={`flex-shrink-0 ${attachMode && stack ? 'ring-2 ring-green-400 rounded animate-pulse' : ''}`}>
                                    {stack ? (
                                        <DraggableCard
                                            id={`${idPrefix}-bench-card-${i}`}
                                            data={{ type: 'bench', index: i, card: stack, playerPrefix: idPrefix }}
                                            onClick={(e) => handleCardClick(e, stack, 'bench', i)}
                                            className={swapMode?.active ? 'ring-2 ring-blue-400 animate-pulse' : ''}
                                        >
                                            <CascadingStack stack={stack} width={sizes.bench.w} height={sizes.bench.h} />
                                        </DraggableCard>
                                    ) : (
                                        <div
                                            className="rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[8px] hover:border-blue-400 cursor-pointer"
                                            style={{ width: sizes.bench.w, height: sizes.bench.h }}
                                        >
                                            {i + 1}
                                        </div>
                                    )}
                                </DroppableZone>
                            ))}
                        </div>
                    </div>

                    {/* Right: Deck & Trash (Compact Column) - Mobile Only */}
                    {mobile && (
                        <div className={`flex flex-col gap-1 ml-1 flex-shrink-0 w-[50px]`}>
                            {/* Visual Deck */}
                            <div
                                className={`bg-blue-50 rounded shadow p-0.5 border-2 border-blue-200 h-[40px] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition`}
                                onClick={() => setShowDeckViewer(true)}
                            >
                                <h2 className="text-[8px] font-bold text-blue-500 uppercase tracking-tight leading-none">Deck</h2>
                                <div className="text-xs font-black text-blue-700 leading-none">{remaining.length}</div>
                            </div>

                            {/* Trash */}
                            <DroppableZone id={`${idPrefix}-trash-zone`} className="w-full">
                                <div
                                    className={`bg-red-50 rounded shadow p-0.5 relative cursor-pointer hover:bg-red-100 transition border-2 border-dashed border-red-200 h-[40px] flex flex-col items-center justify-center`}
                                    onClick={() => setShowTrashViewer(true)}
                                >
                                    <h2 className="text-[8px] font-bold text-red-400 uppercase tracking-tight leading-none">Trash</h2>
                                    <div className="text-xs font-black text-red-600 leading-none">{trash.length}</div>
                                </div>
                            </DroppableZone>
                        </div>
                    )}
                </div>
            </div>

            {/* Hand - Keep at bottom or hide for opponent */}
            {/* Hand - Keep at bottom for Self, or for Opponent on Desktop */}
            {!(mobile && isOpponent) && (
                <div className="bg-white rounded-lg shadow p-0.5 sm:p-3 border border-gray-100 overflow-hidden mt-1">
                    <h2 className="text-[10px] sm:text-sm font-bold text-gray-900 mb-0.5 uppercase">手札 ({hand.length}枚)</h2>
                    <div className="flex overflow-x-auto gap-1 sm:gap-3 py-1 sm:py-4 px-1 sm:px-4 scrollbar-black">
                        {hand.map((card, i) => (
                            <DraggableCard
                                key={i}
                                id={`${idPrefix}-hand-card-${i}`}
                                data={{ type: 'hand', index: i, card, playerPrefix: idPrefix }}
                                onClick={(e) => handleCardClick(e, card, 'hand', i)}
                                className="flex-shrink-0"
                            >
                                <div className="relative hover:scale-105 transition-transform cursor-pointer shadow-md rounded">
                                    <Image
                                        src={card.imageUrl}
                                        alt={card.name}
                                        width={sizes.hand.w}
                                        height={sizes.hand.h}
                                        className="rounded"
                                    />
                                </div>
                            </DraggableCard>
                        ))}
                    </div>
                </div>
            )}



            {/* Modals */}
            {/* Deck Viewer Modal */}
            {
                showDeckViewer && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeckViewer(false)}>
                        <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">山札確認 ({remaining.length}枚)</h2>
                                <button onClick={() => setShowDeckViewer(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded">閉じる</button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-6">
                                {remaining.map((card, i) => (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            setDeckCardMenu({
                                                index: i,
                                                x: rect.left,
                                                y: rect.bottom + window.scrollY
                                            })
                                        }}
                                    >
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={80}
                                            height={112}
                                            className="rounded shadow no-touch-menu no-select no-tap-highlight"
                                            draggable={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Deck Card Menu */}
            {
                deckCardMenu && (
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setDeckCardMenu(null)}
                    >
                        <div
                            className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col min-w-[120px]"
                            style={{
                                top: deckCardMenu.y,
                                left: Math.min(deckCardMenu.x, window.innerWidth - 130)
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => { moveFromDeckToHand(deckCardMenu.index); setDeckCardMenu(null); }}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >手札へ</button>
                            <button
                                onClick={() => { moveFromDeckToBattleField(deckCardMenu.index); setDeckCardMenu(null); }}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >バトル場へ</button>
                            <button
                                onClick={() => { moveFromDeckToBench(deckCardMenu.index); setDeckCardMenu(null); }}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >ベンチへ</button>
                            <button
                                onClick={() => { moveFromDeckToTrash(deckCardMenu.index); setDeckCardMenu(null); }}
                                className="px-4 py-3 hover:bg-red-50 text-red-600 text-left text-sm font-black"
                            >トラッシュへ</button>
                        </div>
                    </div>
                )
            }

            {/* Trash Viewer Modal */}
            {
                showTrashViewer && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTrashViewer(false)}>
                        <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-red-600">トラッシュ ({trash.length}枚)</h2>
                                <button onClick={() => setShowTrashViewer(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded">閉じる</button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {trash.map((card, i) => (
                                    <div key={i} className="relative group cursor-pointer" onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        setTrashCardMenu({
                                            index: i,
                                            x: rect.left,
                                            y: rect.bottom + window.scrollY
                                        })
                                    }}>
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={80}
                                            height={112}
                                            className="rounded shadow no-touch-menu no-select no-tap-highlight"
                                            draggable={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Trash Card Menu */}
            {
                trashCardMenu && (
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setTrashCardMenu(null)}
                    >
                        <div
                            className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col min-w-[140px]"
                            style={{
                                top: Math.min(trashCardMenu.y, window.innerHeight - 150),
                                left: Math.min(trashCardMenu.x, window.innerWidth - 150)
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => moveFromTrashToHand(trashCardMenu.index)}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >手札に加える</button>
                            <button
                                onClick={() => moveFromTrashToDeck(trashCardMenu.index)}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >山札に戻す</button>
                            {isEnergy(trash[trashCardMenu.index]) && (
                                <button
                                    onClick={() => startAttachFromTrash(trashCardMenu.index)}
                                    className="px-4 py-3 hover:bg-green-50 text-green-700 text-left text-sm font-black"
                                >ポケモンにつける</button>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    )
})

export default DeckPractice

// Helpers for D&D
function DraggableCard({ id, data, children, className = "", onClick }: { id: string, data: any, children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent) => void }) {
    const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
        id,
        data,
    })

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id,
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : undefined,
        zIndex: isDragging ? 100 : 1,
        scale: isDragging ? '1.05' : '1',
    }

    return (
        <div
            ref={(node) => {
                setDraggableRef(node)
                setDroppableRef(node)
            }}
            style={style}
            {...listeners}
            {...attributes}
            className={`relative group inline-block cursor-grab active:cursor-grabbing select-none no-touch-menu no-select no-tap-highlight touch-none ${className} ${isOver ? 'ring-4 ring-red-400 rounded-lg' : ''}`}
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
export function CascadingStack({ stack, width, height }: { stack: CardStack, width: number, height: number }) {
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
                // Pokémon (index 0) sits underneath with z-index, Energy/Tools on top peeking out
                // BUT user wants Pokemon on TOP of the z-order, and others peek out ABOVE (top offset)
                // So Pokemon is index 0, zIndex = high, top = 0
                // Energy is index 1+, zIndex = lower, top = -i * cardOffset
                const zIndexValue = stack.cards.length - i

                return (
                    <div
                        key={i}
                        className="absolute left-0 transition-all"
                        style={{
                            bottom: 0, // Align all to bottom of container
                            marginBottom: i * cardOffset, // Peek out from TOP
                            zIndex: zIndexValue
                        }}
                    >
                        <Image
                            src={card.imageUrl}
                            alt={card.name}
                            width={width}
                            height={height}
                            className="rounded shadow bg-white no-touch-menu no-select no-tap-highlight ring-1 ring-black/5"
                            draggable={false}
                        />
                    </div>
                )
            })}

            {/* Stack info badge */}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex gap-1 z-50 pointer-events-none">
                {stack.damage > 0 && <span className="bg-red-600 px-1 rounded font-bold">💥{stack.damage}</span>}
                {stack.cards.length > 1 && <span>📚{stack.cards.length}</span>}
                {stack.energyCount > 0 && <span>⚡{stack.energyCount}</span>}
                {stack.toolCount > 0 && <span>🔧{stack.toolCount}</span>}
            </div>
        </div>
    )
}
