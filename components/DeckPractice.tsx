
'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { type Card } from '@/lib/deckParser'
import { CardStack, createStack, getTopCard, canStack, isEnergy, isTool, isPokemon, isStadium } from '@/lib/cardStack'
import {
    DndContext,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragEndEvent,
    DragStartEvent,
    useDraggable,
    useDroppable,
    DragOverlay,
} from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import { CSS } from '@dnd-kit/utilities'

interface DeckPracticeProps {
    deck: Card[]
    onReset: () => void
    playerName?: string
    compact?: boolean
    stadium?: Card | null
    onStadiumChange?: (stadium: Card | null) => void
    onEffectTrigger?: (effect: 'judge' | 'apollo' | 'unfair_stamp', target: 'opponent') => void
    idPrefix?: string
    mobile?: boolean
    isOpponent?: boolean
}

export interface DeckPracticeRef {
    handleExternalDragEnd: (event: any) => void
    playStadium: (index: number) => void
    receiveEffect: (effect: 'judge' | 'apollo' | 'unfair_stamp') => void
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
    align?: 'up' | 'down'
}

interface AttachMode {
    active: boolean
    card: Card
    sourceIndex: number // Index in trash
}

interface AttachmentTarget {
    type: 'battle' | 'bench'
    index: number
}

const DeckPractice = forwardRef<DeckPracticeRef, DeckPracticeProps>(({ deck, onReset, playerName = "プレイヤー", compact = false, stadium: externalStadium, onStadiumChange, idPrefix = "", mobile = false, isOpponent = false, onEffectTrigger }, ref) => {
    const [hand, setHand] = useState<Card[]>([])
    const [remaining, setRemaining] = useState<Card[]>(deck)
    const [trash, setTrash] = useState<Card[]>([])
    const [battleField, setBattleField] = useState<CardStack | null>(null)
    const [benchSize, setBenchSize] = useState(5)

    // UI Theme based on Player
    const isSelf = idPrefix === 'player1'
    const theme = isSelf ? {
        bg: 'bg-blue-50/90',
        border: 'border-blue-100',
        accent: 'bg-blue-100',
        active: 'border-blue-300'
    } : {
        bg: 'bg-red-50/90',
        border: 'border-red-100',
        accent: 'bg-red-100',
        active: 'border-red-300'
    }
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
    const [attachmentTarget, setAttachmentTarget] = useState<AttachmentTarget | null>(null)
    const [teisatsuCards, setTeisatsuCards] = useState<Card[] | null>(null)
    const [pokegearCards, setPokegearCards] = useState<Card[] | null>(null)
    const [showDetailModal, setShowDetailModal] = useState<Card | null>(null)
    const [toast, setToast] = useState<string | null>(null)
    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }


    // Updated Detail Modal State: Holds context about the stack being viewed
    interface DetailModalState {
        stack: CardStack
        type: 'battle' | 'bench'
        index: number
    }
    const [detailModal, setDetailModal] = useState<DetailModalState | null>(null)

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
                        // User requested Energy to be attached
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
                const delta = source.amount === -999 ? -99999 : source.amount
                if (localTargetId === 'battle-field') {
                    updateDamage('battle', 0, delta)
                } else if (localTargetId.startsWith('bench-slot-')) {
                    const targetIndex = parseInt(localTargetId.replace('bench-slot-', ''))
                    updateDamage('bench', targetIndex, delta)
                }
            }
        },
        playStadium: (index: number) => {
            playStadium(index)
        },
        receiveEffect: (effect: 'judge' | 'apollo' | 'unfair_stamp') => {
            // Triggered by opponent usage
            const newDeck = [...remaining, ...hand].sort(() => Math.random() - 0.5)
            setRemaining(newDeck)
            setHand([])

            let drawCount = 0
            if (effect === 'judge') drawCount = 4
            else if (effect === 'apollo') drawCount = 3
            else if (effect === 'unfair_stamp') drawCount = 2

            const drawn = newDeck.slice(0, drawCount)
            setHand(drawn)
            setRemaining(newDeck.slice(drawCount))

            const effectName = effect === 'judge' ? 'ジャッジマン' : (effect === 'apollo' ? 'アポロ' : 'アンフェアスタンプ')
            alert(`相手が${effectName}を使用しました。\n手札をシャッフルし、${drawCount}枚引きました。`)
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

    // --- UI Helpers ---

    // Dynamic Mobile Scaling
    const [mobileScale, setMobileScale] = useState(1)

    useEffect(() => {
        if (!mobile) return

        const updateScale = () => {
            const width = window.innerWidth
            // Base reference: iPhone SE/8 width (375px)
            const wRatio = width / 375
            const hRatio = window.innerHeight / 750
            setMobileScale(Math.min(wRatio, hRatio, 1.2))
        }

        updateScale()
        window.addEventListener('resize', updateScale)
        return () => window.removeEventListener('resize', updateScale)
    }, [mobile])

    const SIZES = {
        standard: {
            battle: { w: 100, h: 140 },
            bench: { w: 80, h: 112 },
            hand: { w: 90, h: 126 }
        },
        mobile: {
            battle: { w: Math.floor(50 * mobileScale), h: Math.floor(70 * mobileScale) },
            bench: { w: Math.floor(48 * mobileScale), h: Math.floor(67 * mobileScale) },
            hand: { w: Math.floor(45 * mobileScale), h: Math.floor(63 * mobileScale) }
        }
    }
    const sizes = mobile ? SIZES.mobile : SIZES.standard

    // Scroll lock utilities
    const lockScroll = () => {
        document.body.style.overflow = 'hidden'
    }
    const unlockScroll = () => {
        document.body.style.overflow = 'auto'
    }

    // Portal Target for Mobile
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

    useEffect(() => {
        if (mobile) {
            const targetId = idPrefix === 'player1' ? 'mobile-battle-p1' : 'mobile-battle-p2'
            const el = document.getElementById(targetId)
            setPortalTarget(el)
        } else {
            setPortalTarget(null)
        }
    }, [mobile, idPrefix])

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
        showToast('引き直しました')
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

    const battleToDeck = () => {
        if (battleField) {
            const newDeck = [...remaining, ...battleField.cards].sort(() => Math.random() - 0.5)
            setRemaining(newDeck)
            setBattleField(null)
            alert("山札に戻してシャッフルしました")
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
        showToast('山札をシャッフルしました')
    }

    // Supporter Card Effects
    const useLillie = () => {
        // 1. Return hand to deck and shuffle
        const newDeck = [...remaining, ...hand].sort(() => Math.random() - 0.5)

        // 2. Check prize count and determine draw amount
        // If prizes are full (6) -> Draw 8
        // If prizes are 5 or less -> Draw 6
        const drawCount = prizeCards.length === 6 ? 8 : 6

        // 3. Draw cards
        const drawn = newDeck.slice(0, drawCount)
        const newRemaining = newDeck.slice(drawCount)

        setHand(drawn)
        setRemaining(newRemaining)
        alert(`手札を山札に戻してシャッフルし、${drawCount}枚引きました。\n(サイド残数: ${prizeCards.length})`)
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

        // Notify parent to trigger opponent
        if (onEffectTrigger) {
            onEffectTrigger('judge', 'opponent')
        }
    }

    const useApollo = () => {
        // Shuffle hand into deck, self draws 5
        const newDeck = [...remaining, ...hand].sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setHand([])

        const drawn = newDeck.slice(0, 5)
        setHand(drawn)
        setRemaining(newDeck.slice(5))

        // Notify parent to trigger opponent (opponent draws 3)
        if (onEffectTrigger) {
            onEffectTrigger('apollo', 'opponent')
        }
        alert('手札を全て山札に戻し、自分は5枚引きました。\n相手は3枚引きます。')
    }

    const useAthena = () => {
        // Draw until hand has 5 cards
        const currentHandSize = hand.length
        if (currentHandSize >= 5) {
            alert('手札が5枚以上あるため引けません')
            return
        }

        const drawCount = 5 - currentHandSize
        const drawn = remaining.slice(0, drawCount)
        setHand([...hand, ...drawn])
        setRemaining(remaining.slice(drawCount))

        // Simplification: Not checking for Rocket text for now, as agreed
        alert(`手札が5枚になるように${drawCount}枚引きました`)
    }

    const useTeisatsuShirei = () => {
        if (remaining.length === 0) {
            alert("山札がありません")
            return
        }
        // Look at top 2
        const cards = remaining.slice(0, 2)
        setTeisatsuCards(cards)
        // Remove them from deck temporarily to prevent other actions
        setRemaining(remaining.slice(cards.length))
    }

    const handleTeisatsuSelect = (selectedIndex: number) => {
        if (!teisatsuCards) return

        const selected = teisatsuCards[selectedIndex]
        const unselected = teisatsuCards.filter((_, i) => i !== selectedIndex)

        // Add selected to hand
        setHand([...hand, selected])

        // Add unselected to bottom of deck
        setRemaining([...remaining, ...unselected])

        setTeisatsuCards(null)
        alert(`1枚を手札に加え、残りを山札の下に戻しました`)
    }

    const usePokegear = () => {
        if (remaining.length === 0) {
            alert("山札がありません")
            return
        }
        // Look at top 7
        const count = Math.min(remaining.length, 7)
        const cards = remaining.slice(0, count)
        setPokegearCards(cards)
        // Remove them from deck temporarily
        setRemaining(remaining.slice(count))
    }

    const handlePokegearSelect = (selectedIndex: number) => {
        if (!pokegearCards) return

        const selected = pokegearCards[selectedIndex]
        const unselected = pokegearCards.filter((_, i) => i !== selectedIndex)

        // Add selected to hand
        setHand([...hand, selected])

        // Add unselected back to deck and shuffle
        const newDeck = [...remaining, ...unselected].sort(() => Math.random() - 0.5)
        setRemaining(newDeck)

        setPokegearCards(null)
        alert(`1枚を手札に加え、残りを山札に戻してシャッフルしました`)
    }

    const handlePokegearCancel = () => {
        if (!pokegearCards) return

        // Return all to deck and shuffle
        const newDeck = [...remaining, ...pokegearCards].sort(() => Math.random() - 0.5)
        setRemaining(newDeck)

        setPokegearCards(null)
        alert(`山札に戻してシャッフルしました`)
    }

    // Deck Viewer
    const [showDeckViewer, setShowDeckViewer] = useState(false)

    // Trash Viewer
    const [showTrashViewer, setShowTrashViewer] = useState(false)

    // Action Menu Toggle for compact view
    const [showActionMenu, setShowActionMenu] = useState(false)

    const handleDragStart = (event: DragStartEvent) => {
        // Parent will handle global start if needed,
        // but internal drags still need metadata
        lockScroll()
    }

    // Unified Detail Modal Definition


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


    // Attachment Management
    const handleRemoveAttachment = (cardIndex: number) => {
        if (!attachmentTarget) return

        const { type, index } = attachmentTarget
        if (type === 'battle') {
            if (!battleField) return

            const cardToRemove = battleField.cards[cardIndex]

            // Cannot remove the base Pokemon (index 0) directly via this manager usually, 
            // but let's allow it if user really wants, or restrict to attachments (index > 0).
            // User said "Attached cards energy/tools", so usually attachments.
            // But if they remove the base pokemon, the whole stack should probably go or logical error.
            // Let's assume this is for attachments (index > 0) usually, but we implement generic removal.

            const newCards = battleField.cards.filter((_, i) => i !== cardIndex)

            if (newCards.length === 0) {
                setBattleField(null)
            } else {
                setBattleField({
                    ...battleField,
                    cards: newCards,
                    energyCount: battleField.energyCount - (isEnergy(cardToRemove) ? 1 : 0),
                    toolCount: battleField.toolCount - (isTool(cardToRemove) ? 1 : 0)
                })
            }
            setTrash([...trash, cardToRemove])
        } else {
            const stack = bench[index]
            if (!stack) return

            const cardToRemove = stack.cards[cardIndex]
            const newCards = stack.cards.filter((_, i) => i !== cardIndex)

            const newBench = [...bench]
            if (newCards.length === 0) {
                newBench[index] = null
            } else {
                newBench[index] = {
                    ...stack,
                    cards: newCards,
                    energyCount: stack.energyCount - (isEnergy(cardToRemove) ? 1 : 0),
                    toolCount: stack.toolCount - (isTool(cardToRemove) ? 1 : 0)
                }
            }
            setBench(newBench)
            setTrash([...trash, cardToRemove])
        }
    }

    const returnAttachmentToHand = (cardIndex: number) => {
        if (!attachmentTarget) return
        const { type, index } = attachmentTarget
        const stack = type === 'battle' ? battleField : bench[index]
        if (!stack) return

        const card = stack.cards[cardIndex]
        setHand([...hand, card])

        const newCards = stack.cards.filter((_, i) => i !== cardIndex)

        // Inline update logic
        const updated = {
            ...stack,
            cards: newCards,
            energyCount: stack.energyCount - (isEnergy(card) ? 1 : 0),
            toolCount: stack.toolCount - (isTool(card) ? 1 : 0)
        }

        if (type === 'battle') {
            setBattleField(updated)
        } else {
            const newBench = [...bench]
            if (newCards.length === 0 && stack.cards.length === 1) { // Was the only card (base), though unlikely for attachment logic
                newBench[index] = null
            } else {
                newBench[index] = updated
            }
            setBench(newBench)
        }
        // Don't close modal yet, user might want to manage more? Or maybe close.
        // Let's close for now to be safe/simple, or keep open. User didn't specify.
        // handleRemoveAttachment doesn't close modal implicitly? 
        // Wait, handleRemoveAttachment doesn't show closing logic in the snippet.
        // Actually the modal renders list of cards. Removing one updates the state/list.
    }

    const returnAttachmentToDeck = (cardIndex: number) => {
        if (!attachmentTarget) return
        const { type, index } = attachmentTarget
        const stack = type === 'battle' ? battleField : bench[index]
        if (!stack) return

        const card = stack.cards[cardIndex]
        const newDeck = [...remaining, card].sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        alert("山札に戻してシャッフルしました")

        const newCards = stack.cards.filter((_, i) => i !== cardIndex)

        const updated = {
            ...stack,
            cards: newCards,
            energyCount: stack.energyCount - (isEnergy(card) ? 1 : 0),
            toolCount: stack.toolCount - (isTool(card) ? 1 : 0)
        }

        if (type === 'battle') {
            setBattleField(updated)
        } else {
            const newBench = [...bench]
            if (newCards.length === 0 && stack.cards.length === 1) {
                newBench[index] = null
            } else {
                newBench[index] = updated
            }
            setBench(newBench)
        }
    }



    // Render logic for menu items (Add "View Detail" button)
    const renderMenu = () => {
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
            const MENU_HEIGHT = 300 // Estimated max height including actions

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

        // Determine available actions based on source
        return createPortal(
            <div className="fixed inset-0 z-[9999]" onClick={closeMenu}>
                <div
                    className="absolute bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
                    style={style}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bg-gray-50 px-3 py-2 border-b text-xs font-bold text-gray-900">
                        カード操作
                    </div>

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
                        <span>🔍</span> 詳細を見る
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
                            <button onClick={startSwapWithBench} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 font-bold">ベンチと交代</button>
                            <button onClick={battleToDeck} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-900 font-bold">山札に戻す</button>
                            <button onClick={battleToTrash} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-bold">きぜつ（トラッシュ）</button>
                            {/* Attachments list logic could go here if crowded */}
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
    }

    // Unified Detail Modal
    const renderDetailModal = () => {
        // Fallback for Hand (Single Card) - Legacy showDetailModal
        if (showDetailModal && !detailModal) {
            return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowDetailModal(null)}>
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setDetailModal(null)}>
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
    }

    // Safe Remove Helper for Modal
    const handleSafeRemove = (targetType: 'battle' | 'bench', targetIndex: number, cardIndex: number, destination: 'hand' | 'deck' | 'trash') => {
        const stack = targetType === 'battle' ? battleField : bench[targetIndex]
        if (!stack) return

        const card = stack.cards[cardIndex]
        const newCards = stack.cards.filter((_, i) => i !== cardIndex)

        // Calculate new counts
        const updatedStack = {
            ...stack,
            cards: newCards,
            energyCount: stack.energyCount - (isEnergy(card) ? 1 : 0),
            toolCount: stack.toolCount - (isTool(card) ? 1 : 0)
        }

        // Apply State Update
        if (targetType === 'battle') {
            setBattleField(updatedStack.cards.length === 0 ? null : updatedStack)
        } else {
            const newBench = [...bench]
            newBench[targetIndex] = updatedStack.cards.length === 0 ? null : updatedStack
            setBench(newBench)
        }

        // Move Card
        if (destination === 'hand') {
            setHand([...hand, card])
        } else if (destination === 'deck') {
            setRemaining([...remaining, card].sort(() => Math.random() - 0.5))
        } else {
            setTrash([...trash, card])
        }
    }

    // Discard Top Deck
    const discardTopDeck = () => {
        if (remaining.length === 0) return
        const topCard = remaining[0]
        const newRemaining = remaining.slice(1)
        setRemaining(newRemaining)
        setTrash([...trash, topCard])
    }

    // Discard Random Hand
    const discardRandomHand = () => {
        if (hand.length === 0) return
        const randomIndex = Math.floor(Math.random() * hand.length)
        const card = hand[randomIndex]
        const newHand = hand.filter((_, i) => i !== randomIndex)
        setHand(newHand)
        setTrash([...trash, card])
    }

    const useUnfairStamp = () => {
        const newDeck = [...remaining, ...hand].sort(() => Math.random() - 0.5)
        setHand(newDeck.slice(0, 5))
        setRemaining(newDeck.slice(5))
        setTrash([...trash])

        // Notify parent to trigger opponent (opponent draws 2)
        if (onEffectTrigger) {
            onEffectTrigger('unfair_stamp', 'opponent')
        }
        alert('手札を全て山札に戻し、自分は5枚引きました。\n相手は2枚引きます。')
    }

    // Action Menu Render (Updated with new buttons)
    const renderActionMenu = () => {
        // ... existing implementation details for Action Menu need to be updated or replaced
        // Since we are replacing lines, I'll rewrite the Action Menu section fully or rely on where it is called
        // Let's implement the Action Menu content here to be used in the render function
        return (
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
                    <button onClick={discardRandomHand} disabled={hand.length === 0} className="col-span-2 md:col-span-1 bg-white border hover:bg-red-50 text-red-600 px-3 py-2 rounded text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        手札ランダムトラッシュ
                    </button>
                    {/* Supporters */}
                    <div className="col-span-2 md:col-span-1 border-t pt-2 mt-1 md:mt-2">
                        <p className="text-xs text-center text-gray-400 font-bold mb-1">サポート</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={useLillie} className="bg-pink-100 hover:bg-pink-200 text-pink-700 px-3 py-1 rounded text-xs font-bold">
                                リーリエ
                            </button>
                            <button onClick={useJudge} className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded text-xs font-bold">
                                ジャッジマン
                            </button>
                            <button onClick={useApollo} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-bold">
                                アポロ
                            </button>
                            <button onClick={useAthena} className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-xs font-bold">
                                アテナ
                            </button>
                            <button onClick={useTeisatsuShirei} className="col-span-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded text-xs font-bold flex items-center justify-center gap-1">
                                <span>👁️</span> 偵察指令
                            </button>
                            <button onClick={useUnfairStamp} className="col-span-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs font-bold ring-1 ring-red-300">
                                アンフェアスタンプ (自分5枚)
                            </button>
                            <button onClick={usePokegear} className="col-span-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold flex items-center justify-center gap-1 border border-blue-200">
                                <span>📱</span> ポケギア3.0 (7枚)
                            </button>
                        </div>
                    </div>
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
    }


    const BattleFieldContent = (
        <DroppableZone id={`${idPrefix}-battle-field`} className={`${theme.bg} rounded-lg shadow-lg p-1 sm:p-3 ${theme.border} border ${attachMode ? 'ring-2 ring-green-400 animate-pulse' : ''} ${mobile ? 'w-full h-full min-w-[60px]' : 'min-w-[180px]'} flex flex-col items-center justify-center`}>
            <h2 className={`text-[10px] sm:text-sm font-bold text-gray-900 uppercase mb-1 sm:mb-2 w-full text-center ${mobile ? 'hidden' : ''}`}>バトル場</h2>
            {battleField ? (
                <DraggableCard
                    id={`${idPrefix}-battle-card`}
                    data={{ type: 'battle', index: 0, card: battleField, playerPrefix: idPrefix }}
                    onClick={(e) => handleCardClick(e, battleField!, 'battle', 0)}
                >
                    <CascadingStack
                        stack={battleField}
                        width={sizes.battle.w}
                        height={sizes.battle.h}
                        onDamageChange={(delta) => updateDamage('battle', 0, delta)}
                    />
                </DraggableCard>
            ) : (
                <div
                    className="rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs cursor-pointer hover:border-blue-400"
                    style={{ width: sizes.battle.w, height: sizes.battle.h }}
                >
                    {mobile ? (isSelf ? '自分' : '相手') : (isSelf ? 'バトル場(自分)' : 'バトル場(相手)')}
                </div>
            )}
        </DroppableZone>
    )

    return (
        <div className={`w-full ${compact ? "space-y-0.5 sm:space-y-2" : "space-y-4"} relative`}>
            {/* Context Menu */}
            {/* Render Context Menu */}
            {renderMenu()}

            {/* Render Detail Modal */}
            {renderDetailModal()}

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

                    <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2 relative">
                        <button onClick={() => drawCards(1)} disabled={remaining.length === 0} className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600 transition disabled:opacity-50 whitespace-nowrap">1枚引く</button>

                        {/* Desktop View Buttons (Hidden on Mobile) */}
                        <div className="hidden md:flex gap-1">
                            <button onClick={useLillie} className="px-3 py-1 bg-pink-500 text-white rounded text-xs font-bold hover:bg-pink-600 transition whitespace-nowrap">リーリエ</button>
                            <button onClick={useJudge} className="px-3 py-1 bg-orange-500 text-white rounded text-xs font-bold hover:bg-orange-600 transition whitespace-nowrap">ジャッジマン</button>
                            <button onClick={useApollo} className="px-3 py-1 bg-indigo-500 text-white rounded text-xs font-bold hover:bg-indigo-600 transition whitespace-nowrap">アポロ</button>
                            <button onClick={useAthena} className="px-3 py-1 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 transition whitespace-nowrap">アテナ</button>
                            <button onClick={useTeisatsuShirei} className="px-3 py-1 bg-teal-500 text-white rounded text-xs font-bold hover:bg-teal-600 transition whitespace-nowrap">偵察指令</button>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowActionMenu(!showActionMenu)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold hover:bg-gray-300 transition whitespace-nowrap flex items-center lg:hidden"
                            >
                                メニュー ▼
                            </button>
                            {/* PC 'Others' Button */}
                            <button
                                onClick={() => setShowActionMenu(!showActionMenu)}
                                className="hidden lg:flex px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold hover:bg-gray-300 transition whitespace-nowrap items-center"
                            >
                                その他 ▼
                            </button>

                            {/* Action Menu Dropdown/Modal */}
                            {showActionMenu && renderActionMenu()}
                        </div>
                    </div>
                </div>

            </div>

            {/* Hand - Top for Opponent */}
            {/* Hand - Top for Opponent (Mobile Only) */}
            {(mobile && isOpponent) && (
                <div className={`${theme.bg} rounded-lg shadow p-0.5 sm:p-3 ${theme.border} border overflow-hidden mb-1`}>
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
                                        unoptimized
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
                {/* Main Row: Prizes, Battle */}
                <div className={`flex flex-row gap-0.5 sm:gap-4 items-start justify-center order-none ${mobile && portalTarget ? 'hidden' : ''}`}>
                    {/* Prizes - Desktop Only */}
                    {/* Prizes - Desktop Only (Simplified Numeric) */}
                    {!mobile && (
                        <div className={`bg-white rounded-lg shadow p-0.5 sm:p-2 border border-gray-100 min-w-[100px] flex flex-col items-center justify-center`}>
                            <h2 className="text-[10px] sm:text-xs font-black text-gray-500 mb-1 uppercase tracking-tight">SIDE</h2>
                            <div className="text-4xl font-black text-blue-600 mb-1 leading-none">
                                {prizeCards.length}
                            </div>
                            <div className="text-[9px] text-gray-400 font-bold mb-2">MAX: 6</div>
                            {prizeCards.length > 0 && (
                                <button
                                    onClick={() => takePrizeCard(0)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-transform active:scale-95"
                                >
                                    1枚取る
                                </button>
                            )}
                        </div>
                    )}

                    {/* Battle Field */}
                    <div className="flex-1 flex justify-center">
                        {mobile && portalTarget ? createPortal(BattleFieldContent, portalTarget) : BattleFieldContent}
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
                <div className={`${theme.bg} rounded-lg shadow p-1 sm:p-3 w-full overflow-hidden ${theme.border} border order-none flex flex-row`}>
                    {/* Mobile Only: Side (Prizes) on Left of Bench */}
                    {/* Mobile Only: Side (Prizes) on Left of Bench - True Absolute Stack */}
                    {mobile && (
                        <div className="flex flex-col items-center justify-center pr-1 border-r border-gray-200 mr-1 min-w-[40px]">
                            <h2 className="text-[8px] font-bold text-gray-400 text-center leading-none mb-1">SIDE</h2>
                            <div className="text-xl font-black text-blue-600 leading-none mb-2">{prizeCards.length}</div>
                            {prizeCards.length > 0 && (
                                <button
                                    onClick={() => takePrizeCard(0)}
                                    className="bg-blue-500 text-white text-[10px] w-6 h-6 rounded flex items-center justify-center font-bold shadow"
                                >
                                    ↓
                                </button>
                            )}
                        </div>
                    )}

                    {/* Left: Bench Cards (Scrollable) */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-[10px] sm:text-sm font-bold text-gray-900 uppercase">ベンチ</h2>
                            <button onClick={increaseBenchSize} disabled={benchSize >= 8} className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] shadow hover:bg-blue-600">+</button>
                            <span className="text-[8px] text-gray-500">Max: {benchSize}</span>
                        </div>
                        <div className="flex gap-1 sm:gap-6 overflow-x-auto py-2 px-1 scrollbar-black items-end h-[100px] sm:h-auto">
                            {bench.slice(0, benchSize).map((stack, i) => (
                                <DroppableZone key={i} id={`${idPrefix}-bench-slot-${i}`} className={`flex-shrink-0 ${attachMode && stack ? 'ring-2 ring-green-400 rounded animate-pulse' : ''}`}>
                                    {stack ? (
                                        <DraggableCard
                                            id={`${idPrefix}-bench-card-${i}`}
                                            data={{ type: 'bench', index: i, card: stack, playerPrefix: idPrefix }}
                                            onClick={(e) => handleCardClick(e, stack, 'bench', i)}
                                            className={swapMode?.active ? 'ring-2 ring-blue-400 animate-pulse' : ''}
                                        >
                                            <CascadingStack
                                                stack={stack}
                                                width={sizes.bench.w}
                                                height={sizes.bench.h}
                                                onDamageChange={(delta) => updateDamage('bench', i, delta)}
                                            />
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
                                        unoptimized
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
                                <div className="flex gap-2">
                                    <button onClick={() => { setShowDeckViewer(false); shuffleDeck(); }} className="bg-blue-600 text-white font-bold px-3 py-1 rounded shadow hover:bg-blue-700">シャッフルして閉じる</button>
                                    <button onClick={() => setShowDeckViewer(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">閉じる</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-6">
                                {remaining.map((card, i) => (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            const spaceBelow = window.innerHeight - rect.bottom
                                            const alignUp = spaceBelow < 220 // Threshold for menu visibility

                                            setDeckCardMenu({
                                                index: i,
                                                x: rect.left,
                                                y: alignUp ? rect.top + window.scrollY : rect.bottom + window.scrollY,
                                                align: alignUp ? 'up' : 'down'
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
                                            unoptimized
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
                                left: Math.min(deckCardMenu.x, window.innerWidth - 130),
                                // If align is 'up', position bottom at Y. If 'down', position top at Y.
                                ...(deckCardMenu.align === 'up'
                                    ? { bottom: window.innerHeight - (deckCardMenu.y - window.scrollY) }
                                    : { top: deckCardMenu.y - window.scrollY }
                                )
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

            {/* Teisatsu Shirei Modal */}
            {
                teisatsuCards && (
                    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl animate-fade-in-up">
                            <h2 className="text-xl font-bold mb-2 text-center">ていさつしれい</h2>
                            <p className="text-gray-600 text-center mb-6 text-sm">手札に加えるカードを1枚選んでください。<br />（選ばなかったカードは山札の下に戻ります）</p>

                            <div className="flex justify-center gap-6 sm:gap-10">
                                {teisatsuCards.map((card, i) => (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => handleTeisatsuSelect(i)}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            手札に加える
                                        </div>
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={140}
                                            height={196}
                                            className="rounded-lg shadow-lg border-2 border-transparent hover:border-blue-500"
                                            unoptimized
                                        />
                                        <div className="mt-2 text-center text-sm font-bold text-gray-700">{card.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Pokegear 3.0 Modal */}
            {
                pokegearCards && (
                    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-2 text-center text-blue-600">ポケギア3.0</h2>
                            <p className="text-gray-600 text-center mb-6 text-sm">手札に加えるカードを1枚選んでください。<br />（選ばなかったカードは山札に戻してシャッフルされます）</p>

                            <div className="flex flex-wrap justify-center gap-4">
                                {pokegearCards.map((card, i) => (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => handlePokegearSelect(i)}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow z-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            手札に加える
                                        </div>
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={120}
                                            height={168}
                                            className="rounded-lg shadow-lg border-2 border-transparent hover:border-blue-500"
                                            unoptimized
                                        />
                                        <div className="mt-1 text-center text-xs font-bold text-gray-700 truncate w-[120px]">{card.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={handlePokegearCancel}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-6 py-2 rounded-full"
                                >
                                    加えない (全て戻す)
                                </button>
                            </div>
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
                                            unoptimized
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

            {/* Detail Modal Render */}
            {renderDetailModal()}

            {/* Drag Overlay */}
            <DragOverlay dropAnimation={null}>
                {activeDragId ? (
                    <div className="w-[100px] h-[140px] rounded-lg shadow-2xl overflow-hidden ring-2 ring-yellow-400 opacity-90 pointer-events-none transform scale-110">
                        {(() => {
                            const findCardImage = () => {
                                // Search hand
                                if (activeDragId && activeDragId.startsWith(`${idPrefix}-hand-card-`)) {
                                    const index = parseInt(activeDragId.replace(`${idPrefix}-hand-card-`, ''))
                                    const handCard = hand[index]
                                    if (handCard) return handCard.imageUrl
                                }

                                // Search Battle
                                if (activeDragId === `${idPrefix}-battle-card` && battleField) {
                                    let topPokemonIndex = -1
                                    for (let i = battleField.cards.length - 1; i >= 0; i--) {
                                        if (isPokemon(battleField.cards[i])) {
                                            topPokemonIndex = i
                                            break
                                        }
                                    }
                                    if (topPokemonIndex === -1 && battleField.cards.length > 0) topPokemonIndex = 0
                                    return battleField.cards[topPokemonIndex]?.imageUrl
                                }

                                // Search Bench
                                if (activeDragId && activeDragId.startsWith(`${idPrefix}-bench-card-`)) {
                                    const index = parseInt(activeDragId.replace(`${idPrefix}-bench-card-`, ''))
                                    const stack = bench[index]
                                    if (stack) {
                                        let topPokemonIndex = -1
                                        for (let i = stack.cards.length - 1; i >= 0; i--) {
                                            if (isPokemon(stack.cards[i])) {
                                                topPokemonIndex = i
                                                break
                                            }
                                        }
                                        if (topPokemonIndex === -1 && stack.cards.length > 0) topPokemonIndex = 0
                                        return stack.cards[topPokemonIndex]?.imageUrl
                                    }
                                }
                                return null
                            }
                            const imgUrl = findCardImage()
                            if (imgUrl) return <Image src={imgUrl} alt="dragging" fill className="object-cover" unoptimized />
                            return <div className="bg-blue-900 w-full h-full border-2 border-white" />
                        })()}
                    </div>
                ) : null}
            </DragOverlay>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl z-[2000] pointer-events-none whitespace-nowrap"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
})

export default DeckPractice

// Helpers for D&D
interface CardWithMetadata {
    playerPrefix: string
    type: string
    index: number
    card: unknown
}

function DraggableCard({ id, data, children, className = "", onClick }: { id: string, data: CardWithMetadata, children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent) => void }) {
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

function DroppableZone({ id, children, className = "", style = {}, onClick }: { id: string, children: React.ReactNode, className?: string, style?: React.CSSProperties, onClick?: (e: React.MouseEvent) => void }) {
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
export function CascadingStack({ stack, width, height, onDamageChange }: { stack: CardStack, width: number, height: number, onDamageChange?: (delta: number) => void }) {
    const cardOffset = 15 // pixels to show of card below
    const maxVisible = 5

    // Find the index of the top-most Pokemon (the operational active card)
    let topPokemonIndex = -1
    for (let i = stack.cards.length - 1; i >= 0; i--) {
        if (isPokemon(stack.cards[i])) {
            topPokemonIndex = i
            break
        }
    }
    if (topPokemonIndex === -1 && stack.cards.length > 0) topPokemonIndex = 0

    // Calculate visible stack size (excluding Energy/Tools) for height
    const visibleCardsCount = stack.cards.filter(c => !isEnergy(c) && !isTool(c)).length

    return (
        <div
            className="relative"
            style={{
                width: width,
                // Fixed height since we are validating stacking
                height: height
            }}
        >
            {stack.cards.map((card, i) => {
                const isEnergyCard = isEnergy(card)
                const isToolCard = isTool(card)
                const isTopPokemon = i === topPokemonIndex

                // Hide attached Energy and Tools from the main stack
                // But SHOW Pokemon (evolutions)
                const hideFromStack = (isEnergyCard || isToolCard)

                if (hideFromStack) return null

                const zIndexValue = isTopPokemon ? (stack.cards.length + 10) : (stack.cards.length - i)

                // Calculate visual position (how many Visible cards are below this one)
                let visualPos = 0
                for (let k = 0; k < i; k++) {
                    const c = stack.cards[k]
                    if (!isEnergy(c) && !isTool(c)) {
                        visualPos++
                    }
                }

                const marginBottomValue = 0 // No offset, stack directly

                return (
                    <div
                        key={i}
                        className="absolute left-0 transition-all"
                        style={{
                            bottom: 0,
                            marginBottom: marginBottomValue,
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
                            unoptimized
                        />
                    </div>
                )
            })}

            {/* Attached Energy Icons Layer (Bottom Left) */}
            {stack.cards.filter(c => isEnergy(c)).map((card, i) => (
                <div
                    key={`energy-${i}`}
                    className="absolute z-[100] drop-shadow-md hover:scale-150 transition-transform origin-bottom-left"
                    style={{
                        bottom: 4 + (i * 8), // Tighter stacking
                        left: -4,
                        width: width / 3.5, // Slightly smaller
                        height: height / 3.5,
                    }}
                >
                    <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={width / 3.5}
                        height={height / 3.5}
                        className="rounded-sm border border-white bg-white"
                        unoptimized
                    />
                </div>
            ))}

            {/* Attached Tool Icons Layer (Top Left) - Moved from Top Right/Bottom Right */}
            {stack.cards.filter(c => isTool(c)).map((card, i) => (
                <div
                    key={`tool-${i}`}
                    className="absolute z-[100] drop-shadow-md hover:scale-150 transition-transform origin-top-left"
                    style={{
                        top: 25 + (i * 8), // Start slightly down to avoid potential badge overlap if any
                        left: -4,
                        width: width / 3.5,
                        height: height / 3.5,
                    }}
                >
                    <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={width / 3.5}
                        height={height / 3.5}
                        className="rounded-sm border border-white bg-white"
                        unoptimized
                    />
                </div>
            ))}

            {/* Damage Counter Badge (Read Only) */}
            {stack.damage > 0 && (
                <div
                    className="absolute bottom-1 right-1 z-[200] flex items-end justify-end pointer-events-none"
                >
                    <div className="bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md border border-white/20 backdrop-blur-sm">
                        <span className="text-center">{stack.damage}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

