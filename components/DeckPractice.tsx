
'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { type Card, shuffle } from '@/lib/deckParser'
import NumericalSidePrize from './NumericalSidePrize'
import { CardStack, createStack, getTopCard, canStack, isEnergy, isTool, isPokemon, isStadium, isRuleBox, isTrainer, isSupporter } from '@/lib/cardStack'
import { getPrizeTrainerFeedbackAction } from '@/app/aiActions'
import {
    DndContext,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'
import { useCardEffectHandlers } from '@/hooks/useCardEffectHandlers'
import { useMenuBuilder } from '@/hooks/useMenuBuilder'
import { DraggableCard, DroppableZone } from './practice/DraggableCard'
import { CascadingStack } from './practice/CascadingStack'
import { CardEffectModals } from './practice/CardEffectModals'
import { GameModals } from './practice/GameModals'
import {
    type DeckPracticeProps,
    type DeckPracticeRef,
    type MenuState,
    type SwapState,
    type DeckMenuState,
    type AttachMode,
    type AttachmentTarget,
    type DetailModalState,
    type UltraBallState,
    type PoffinState,
    type ToukoState,
    type FightGongState,
    type LambdaState,
    type NightStretcherState,
    type GenesectState,
    type ArchaludonState,
    type TatsugiriState,
    type OgerponState,
    type ZoroarkState,
    type MeowthEXState,
    type IronLeavesEXState,
    type NPointUpState,
    type CyanoState,
    type OgerponWellspringState,
    type BugCatchingSetState,
    type EnergySwitchState,
    type EnergyRetrievalState,
    type NoctowlState,
    type MegaLucarioEXAttackState,
    type PreciousCarrierState,
    type PrimeCatcherState,
    type PecharuntState,
    type FlareonState,
    type MunkidoriState,
    type DawnState,
    type FanCallState,
    type GlassTrumpetState,
    type TeraOrbState,
    type BrocksScoutState,
    type RagingBoltState,
    type AkamatsuState,
} from './practice/types'

export type { DeckPracticeRef }

const DeckPractice = forwardRef<DeckPracticeRef, DeckPracticeProps>(({ deck, onReset, playerName = "プレイヤー", compact = false, stadium: externalStadium, onStadiumChange, idPrefix = "", mobile = false, isOpponent = false, isActive = true, onEffectTrigger, onAttackTrigger }, ref) => {
    const [hand, setHand] = useState<Card[]>([])
    const [remaining, setRemaining] = useState<Card[]>(deck)
    const [trash, setTrash] = useState<Card[]>([])
    const [isBackfilling, setIsBackfilling] = useState(false)
    const [backfillCount, setBackfillCount] = useState<number | null>(null)
    const [isCalculating, setIsCalculating] = useState(false)
    const [retreatState, setRetreatState] = useState<{
        isOpen: boolean;
        targetBenchIndex: number | null;
        selectedCardIndices: number[];
    }>({ isOpen: false, targetBenchIndex: null, selectedCardIndices: [] });
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
    const [battle, setBattle] = useState<CardStack | null>(null)
    const [bench, setBench] = useState<(CardStack | null)[]>(new Array(8).fill(null))
    const [prizeCards, setPrizeCards] = useState<Card[]>([])
    const [initialized, setInitialized] = useState(false)
    const [showDeckTopModal, setShowDeckTopModal] = useState(false)
    const [isPerspectiveRotated, setIsPerspectiveRotated] = useState(false)
    const [damageTarget, setDamageTarget] = useState<{ type: 'battle' | 'bench', index: number } | null>(null)

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
    const [onBoardSelection, setOnBoardSelection] = useState<{
        type: 'move',
        source: string,
        title: string,
        onSelect: (type: 'battle' | 'bench', index: number) => void
    } | null>(null)
    const [akamatsuState, setAkamatsuState] = useState<AkamatsuState | null>(null)
    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const [peekDeckSearch, setPeekDeckSearch] = useState(false)
    const [damageSelector, setDamageSelector] = useState<{
        isOpen: boolean
        source: 'battle' | 'bench'
        index: number
        damage?: number
    } | null>(null)

    const [detailModal, setDetailModal] = useState<DetailModalState | null>(null)
    const [pokePadState, setPokePadState] = useState<Card[] | null>(null)

    const [ultraBallState, setUltraBallState] = useState<UltraBallState | null>(null)

    const [poffinState, setPoffinState] = useState<PoffinState | null>(null)

    const [toukoState, setToukoState] = useState<ToukoState | null>(null)

    const [fightGongState, setFightGongState] = useState<FightGongState | null>(null)

    const [lambdaState, setLambdaState] = useState<LambdaState | null>(null)

    const [nightStretcherState, setNightStretcherState] = useState<NightStretcherState | null>(null)

    // Genesect ex (Metal Signal) State
    const [genesectState, setGenesectState] = useState<GenesectState | null>(null)

    // Archaludon ex (Alloy Build) State
    const [archaludonState, setArchaludonState] = useState<ArchaludonState | null>(null)

    // Tatsugiri State
    const [tatsugiriState, setTatsugiriState] = useState<TatsugiriState | null>(null)

    // Ogerpon Teal Mask ex State
    const [ogerponState, setOgerponState] = useState<OgerponState | null>(null)

    // Zoroark ex State
    const [zoroarkState, setZoroarkState] = useState<ZoroarkState | null>(null)

    // Meowth ex State
    const [meowthEXState, setMeowthEXState] = useState<MeowthEXState | null>(null)
    const [okunoteUsedThisTurn, setOkunoteUsedThisTurn] = useState(false)

    // Iron Leaves ex State
    const [ironLeavesEXState, setIronLeavesEXState] = useState<IronLeavesEXState | null>(null)

    // Nのポイントアップ State
    const [nPointUpState, setNPointUpState] = useState<NPointUpState | null>(null)

    // シアノ State
    const [cyanoState, setCyanoState] = useState<CyanoState | null>(null)

    const [ogerponWellspringState, setOgerponWellspringState] = useState<OgerponWellspringState | null>(null)

    // むしとりセット State
    const [bugCatchingSetState, setBugCatchingSetState] = useState<BugCatchingSetState | null>(null)

    // エネルギーつけかえ State
    const [energySwitchState, setEnergySwitchState] = useState<EnergySwitchState | null>(null)

    // エネルギー回収 State
    const [energyRetrievalState, setEnergyRetrievalState] = useState<EnergyRetrievalState | null>(null)

    // ヨルノズク State
    const [noctowlState, setNoctowlState] = useState<NoctowlState | null>(null)

    // メガルカリオex State
    const [megaLucarioEXAttackState, setMegaLucarioEXAttackState] = useState<MegaLucarioEXAttackState | null>(null)
    const [megaBraveUsedLastTurn, setMegaBraveUsedLastTurn] = useState(false)

    // ルナトーン State
    const [lunacycleUsedThisTurn, setLunacycleUsedThisTurn] = useState(false)

    // プレシャスキャリー State
    const [preciousCarrierState, setPreciousCarrierState] = useState<PreciousCarrierState | null>(null)

    // プライムキャッチャー State
    const [primeCatcherState, setPrimeCatcherState] = useState<PrimeCatcherState | null>(null)

    // モモワロウex State
    const [pecharuntUsedThisTurn, setPecharuntUsedThisTurn] = useState(false)
    const [pecharuntState, setPecharuntState] = useState<PecharuntState | null>(null)

    // ブースターex State
    const [flareonState, setFlareonState] = useState<FlareonState | null>(null)

    // マシマシラ State
    const [munkidoriUsedThisTurn, setMunkidoriUsedThisTurn] = useState(false)
    const [munkidoriState, setMunkidoriState] = useState<MunkidoriState | null>(null)
    const [fanCallUsedThisTurn, setFanCallUsedThisTurn] = useState(false)

    // ヒカリ State
    const [dawnState, setDawnState] = useState<DawnState | null>(null)

    // スピンロトム (Fan Call) State
    const [fanCallState, setFanCallState] = useState<FanCallState | null>(null)

    // ガラスのラッパ State
    const [glassTrumpetState, setGlassTrumpetState] = useState<GlassTrumpetState | null>(null)

    // テラスタルオーブ State
    const [teraOrbState, setTeraOrbState] = useState<TeraOrbState | null>(null)

    // タケシのスカウト State
    const [brocksScoutState, setBrocksScoutState] = useState<BrocksScoutState | null>(null)

    // タケルライコex State
    const [ragingBoltState, setRagingBoltState] = useState<RagingBoltState | null>(null)




    // サマヨール・ヨノワール (Dusclops/Dusknoir) Logic

    const switchPokemon = (benchIndex: number) => {
        if (!battleField || !bench[benchIndex]) return

        setBattleField(bench[benchIndex])
        setBench(prev => {
            const next = [...prev]
            next[benchIndex] = battleField
            return next
        })
    }

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
        switchPokemon: (benchIndex: number) => {
            switchPokemon(benchIndex)
        },
        startSelection: (config: { title: string; onSelect: (type: 'battle' | 'bench', index: number) => void }) => {
            setOnBoardSelection({
                type: 'move',
                source: 'remote',
                title: config.title,
                onSelect: config.onSelect
            })
        },
        receiveEffect: (effect: 'judge' | 'apollo' | 'unfair_stamp' | 'boss_orders' | 'apply_damage' | 'special_red_card' | 'xerosic', amount?: number, targetType?: 'battle' | 'bench', targetIndex?: number) => {
            if (effect === 'boss_orders') {
                return
            }

            if (effect === 'apply_damage' && amount !== undefined) {
                const targetRef = targetType || 'battle'
                const targetIdx = targetIndex || 0

                if (targetRef === 'battle') {
                    if (battleField) {
                        const newDamage = (battleField.damage || 0) + amount
                        setBattleField({ ...battleField, damage: newDamage })
                        showToast(`相手の技により バトル場に ${amount} ダメージを受けました`)
                    } else {
                        showToast('バトル場にポケモンがいません（ダメージ不発）')
                    }
                } else if (targetRef === 'bench') {
                    const stack = bench[targetIdx]
                    if (stack) {
                        const newBench = [...bench]
                        const newDamage = (stack.damage || 0) + amount
                        newBench[targetIdx] = { ...stack, damage: newDamage }
                        setBench(newBench)
                        showToast(`相手の技により ベンチ(${targetIdx + 1})に ${amount} ダメージを受けました`)
                    } else {
                        showToast('指定されたベンチにポケモンがいません')
                    }
                }
                return
            }

            if (effect === 'special_red_card') {
                // 手札を裏にして切り、山札の下に戻し、3枚引く
                const shuffledHand = shuffle([...hand])
                setRemaining(prev => [...prev, ...shuffledHand])
                setHand([])

                const drawCount = Math.min(3, remaining.length + shuffledHand.length)
                const combined = [...remaining, ...shuffledHand]
                setHand(combined.slice(0, drawCount))
                setRemaining(combined.slice(drawCount))

                alert(`相手がスペシャルレッドカードを使用しました。\n手札を山札の下に戻し、3枚引きました。`)
                return
            }

            if (effect === 'xerosic') {
                if (hand.length > 3) {
                    alert(`相手が「クセロシキのたくらみ」を使用しました。\n手札が3枚になるようにトラッシュしてください。`)
                } else {
                    alert(`相手が「クセロシキのたくらみ」を使用しましたが、あなたの手札はすでに3枚以下です。`)
                }
                return
            }

            // Triggered by opponent usage (other hand destruction effects)
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
        },
        getPrizeCount: () => {
            return prizeCards.length
        },
        takePrize: () => {
            takePrizeCard()
        }
    }))

    // Auto-setup prize cards and draw initial hand when deck is first loaded
    useEffect(() => {
        if (!initialized && deck.length === 60) {
            // Use the prop 'deck' directly instead of 'remaining' which might be stale
            const prizes = deck.slice(0, 6)
            setPrizeCards(prizes)
            const afterPrizes = deck.slice(6)

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
        setRemaining(prev => prev.slice(6))
    }

    const drawCards = (count: number) => {
        const drawn = remaining.slice(0, count)
        setHand(prev => [...prev, ...drawn])
        setRemaining(prev => prev.slice(count))
    }

    const mulligan = () => {
        // Capture current states to calculate new deck
        const currentRemaining = remaining
        const currentHand = hand
        const newDeck = [...currentRemaining, ...currentHand].sort(() => Math.random() - 0.5)

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
        if (!card) return
        setTrash(prev => [...prev, card])
        setHand(prev => prev.filter((_, i) => i !== index))
    }

    // Menu Actions
    const handleCardClick = (e: React.MouseEvent, card: Card | CardStack, source: 'hand' | 'battle' | 'bench', index: number) => {
        e.stopPropagation()

        // If in OnBoard Selection mode, perform that action
        if (onBoardSelection && (source === 'battle' || source === 'bench')) {
            onBoardSelection.onSelect(source, index)
            if (onBoardSelection.source === 'remote') {
                setOnBoardSelection(null)
            }
            return
        }

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
                setBattleField(current => {
                    if (!current) return createStack(card)
                    return {
                        ...current,
                        cards: [...current.cards, card],
                        energyCount: current.energyCount + (isEnergy(card) ? 1 : 0),
                        toolCount: current.toolCount + (isTool(card) ? 1 : 0)
                    }
                })
            } else {
                setTrash(prev => [...prev, ...battleField.cards])
                setBattleField(createStack(card))
            }
        } else {
            setBattleField(createStack(card))
        }
        setHand(prev => prev.filter((_, i) => i !== handIndex))
        closeMenu()
    }

    const playToBench = (handIndex: number, targetIndex?: number) => {
        const card = hand[handIndex]
        if (!card) return

        if (targetIndex !== undefined) {
            setBench(currentBench => {
                const stack = currentBench[targetIndex]
                const nextBench = [...currentBench]
                if (stack) {
                    if (canStack(card, stack)) {
                        nextBench[targetIndex] = {
                            ...stack,
                            cards: [...stack.cards, card],
                            energyCount: stack.energyCount + (isEnergy(card) ? 1 : 0),
                            toolCount: stack.toolCount + (isTool(card) ? 1 : 0)
                        }
                    } else {
                        setTrash(prev => [...prev, ...stack.cards])
                        nextBench[targetIndex] = createStack(card)
                    }
                } else {
                    nextBench[targetIndex] = createStack(card)
                }
                return nextBench
            })
        } else {
            setBench(currentBench => {
                const emptySlotIndex = currentBench.findIndex((slot, i) => i < benchSize && slot === null)
                if (emptySlotIndex !== -1) {
                    const nextBench = [...currentBench]
                    nextBench[emptySlotIndex] = createStack(card)
                    return nextBench
                } else {
                    alert("ベンチがいっぱいです")
                    return currentBench
                }
            })
        }

        setHand(prev => prev.filter((_, i) => i !== handIndex))
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
            const cards = battleField.cards
            setHand(prev => [...prev, ...cards])
            setBattleField(null)
        }
        closeMenu()
    }

    const battleToTrash = () => {
        if (battleField) {
            const cards = battleField.cards
            setTrash(prev => [...prev, ...cards])
            setBattleField(null)
        }
        closeMenu()
    }

    const battleToDeck = () => {
        if (battleField) {
            const cards = battleField.cards
            setRemaining(prev => [...prev, ...cards].sort(() => Math.random() - 0.5))
            setBattleField(null)
            alert("山札に戻してシャッフルしました")
        }
        closeMenu()
    }

    // Swap Execution (Step 2)
    const performSwap = (targetBenchIndex: number) => {
        if (!swapMode) return

        if (swapMode.sourceType === 'battle') {
            const currentBattle = battleField
            const targetBench = bench[targetBenchIndex]

            // Check if retreat cost selection is needed (Battle field only for now)
            const hasEnergy = currentBattle?.cards?.some(c => isEnergy(c))
            if (hasEnergy) {
                setRetreatState({
                    isOpen: true,
                    targetBenchIndex: targetBenchIndex,
                    selectedCardIndices: []
                })
                setSwapMode(null)
                return
            }

            // Standard swap (no energy)
            setBattleField(targetBench)
            setBench(prev => {
                const next = [...prev]
                next[targetBenchIndex] = currentBattle
                return next
            })
        } else {
            // Source is bench (target is battle)
            const sourceBench = bench[swapMode.sourceIndex]
            if (!sourceBench) return

            const currentBattle = battleField
            setBattleField(sourceBench)
            setBench(prev => {
                const next = [...prev]
                next[swapMode.sourceIndex] = currentBattle
                return next
            })
        }

        setSwapMode(null)
    }

    const executeRetreat = () => {
        if (!retreatState.targetBenchIndex === null || !battleField) return

        const targetIndex = retreatState.targetBenchIndex!
        const currentBattle = battleField
        const targetBench = bench[targetIndex]

        // 1. Identify cards to trash and cards to keep
        const toTrash: Card[] = []
        const toKeep: Card[] = []

        currentBattle.cards.forEach((card, idx) => {
            if (retreatState.selectedCardIndices.includes(idx)) {
                toTrash.push(card)
            } else {
                toKeep.push(card)
            }
        })

        // 2. Perform Movement
        // Trash the selected energies
        if (toTrash.length > 0) {
            setTrash(prev => [...prev, ...toTrash])
        }

        // New stack for the bench (the one that retreated)
        const retreatedStack = { ...currentBattle, cards: toKeep }

        // Swap positions
        setBattleField(targetBench)
        setBench(prev => {
            const next = [...prev]
            next[targetIndex] = retreatedStack
            return next
        })

        // 3. Reset State
        setRetreatState({ isOpen: false, targetBenchIndex: null, selectedCardIndices: [] })
        showToast(`エネルギー ${toTrash.length} 枚をトラッシュして逃げました`)
    }

    const startSwapWithBench = () => {
        setSwapMode({ active: true, sourceType: 'battle', sourceIndex: 0 })
        closeMenu()
    }

    // Bench Actions
    const benchToHand = (index: number) => {
        const stack = bench[index]
        if (stack) {
            const cards = stack.cards
            setHand(prev => [...prev, ...cards])
            setBench(prev => {
                const next = [...prev]
                next[index] = null
                return next
            })
        }
        closeMenu()
    }

    const benchToTrash = (index: number) => {
        const stack = bench[index]
        if (stack) {
            const cards = stack.cards
            setTrash(prev => [...prev, ...cards])
            setBench(prev => {
                const next = [...prev]
                next[index] = null
                return next
            })
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

    // performSwap logic consolidated into earlier definition


    const takePrizeCard = (index: number = 0) => {
        const prize = prizeCards[index]
        if (!prize) return
        setHand(prev => [...prev, prize])
        setPrizeCards(prev => prev.filter((_, i) => i !== index))
        showToast('サイドを1枚取りました')
    }

    const shuffleDeck = () => {
        setRemaining(prev => [...prev].sort(() => Math.random() - 0.5))
        showToast('山札をシャッフルしました')
    }

    const nextTurn = () => {
        setLunacycleUsedThisTurn(false)
        setOkunoteUsedThisTurn(false)
        setPecharuntUsedThisTurn(false)
        setMunkidoriUsedThisTurn(false)
        setFanCallUsedThisTurn(false)

        // Mega Brave reset logic:
        // If it was used this turn, it becomes "used last turn" (still restricted).
        // If it was already "used last turn", it becomes false (usable again).
        setMegaBraveUsedLastTurn(false)

        showToast('次の番になりました')
    }


    const handlers = useCardEffectHandlers({
        hand, setHand,
        remaining, setRemaining,
        trash, setTrash,
        battle, setBattle,
        battleField, setBattleField,
        bench, setBench,
        benchSize,
        prizeCards,
        ragingBoltState, setRagingBoltState,
        dawnState, setDawnState,
        fanCallState, setFanCallState,
        glassTrumpetState, setGlassTrumpetState,
        teraOrbState, setTeraOrbState,
        brocksScoutState, setBrocksScoutState,
        lambdaState, setLambdaState,
        nightStretcherState, setNightStretcherState,
        tatsugiriState, setTatsugiriState,
        ogerponState, setOgerponState,
        zoroarkState, setZoroarkState,
        meowthEXState, setMeowthEXState,
        ironLeavesEXState, setIronLeavesEXState,
        nPointUpState, setNPointUpState,
        cyanoState, setCyanoState,
        ogerponWellspringState, setOgerponWellspringState,
        bugCatchingSetState, setBugCatchingSetState,
        energySwitchState, setEnergySwitchState,
        energyRetrievalState, setEnergyRetrievalState,
        genesectState, setGenesectState,
        archaludonState, setArchaludonState,
        noctowlState, setNoctowlState,
        megaLucarioEXAttackState, setMegaLucarioEXAttackState,
        preciousCarrierState, setPreciousCarrierState,
        primeCatcherState, setPrimeCatcherState,
        pecharuntState, setPecharuntState,
        flareonState, setFlareonState,
        munkidoriState, setMunkidoriState,
        ultraBallState, setUltraBallState,
        poffinState, setPoffinState,
        toukoState, setToukoState,
        fightGongState, setFightGongState,
        akamatsuState, setAkamatsuState,
        teisatsuCards, setTeisatsuCards,
        pokegearCards, setPokegearCards,
        pokePadState, setPokePadState,
        okunoteUsedThisTurn, setOkunoteUsedThisTurn,
        munkidoriUsedThisTurn, setMunkidoriUsedThisTurn,
        lunacycleUsedThisTurn, setLunacycleUsedThisTurn,
        pecharuntUsedThisTurn, setPecharuntUsedThisTurn,
        fanCallUsedThisTurn, setFanCallUsedThisTurn,
        megaBraveUsedLastTurn, setMegaBraveUsedLastTurn,
        showToast,
        moveToTrash,
        shuffleDeck,
        setSwapMode,
        setDamageSelector,
        setOnBoardSelection,
        onEffectTrigger,
        onAttackTrigger,
    })
    const {
        handleCursedBomb, handlePsychicDraw, handleBurstingRoar,
        handleExtremeAscentToggleEnergy, handleExtremeAscentConfirm,
        handleDawnSelect, handleDawnConfirm, handleDawnCancel,
        handleFanCallSelect, handleFanCallConfirm, handleFanCallCancel,
        handleGlassTrumpetEnergySelect, handleGlassTrumpetConfirmEnergy, handleGlassTrumpetTargetSelect,
        handleTeraOrbSelect, handleBrocksScoutSelect, handleBrocksScoutConfirm,
        useLillie, useTeisatsuShirei, handleTeisatsuSelect,
        usePokegear, handlePokegearSelect, handlePokegearCancel,
        useLambda, handleLambdaSelect, handleLambdaConfirm,
        useNightStretcher, handleNightStretcherSelect, handleNightStretcherConfirm,
        useTatsugiri, handleTatsugiriSelect, handleTatsugiriConfirm,
        useOgerpon, handleOgerponSelect, handleOgerponConfirm,
        useZoroark, handleZoroarkSelect, handleZoroarkConfirm,
        useFezandipiti, useDudunsparce,
        useMeowthEX, handleMeowthEXSelect, handleMeowthEXConfirm,
        useIronLeavesEX, handleIronLeavesEXClickPokemon,
        useNPointUp, handleNPointUpSelectEnergy, handleNPointUpConfirmEnergy, handleNPointUpClickPokemon,
        useCyano, handleCyanoSelect, handleCyanoConfirm,
        useOgerponWellspring, handleOgerponWellspringSelectCost, handleOgerponWellspringConfirmCost,
        useBugCatchingSet, handleBugCatchingSetSelect, handleBugCatchingSetConfirm,
        useEnergySwitch, handleEnergySwitchClickPokemon, handleEnergySwitchSelectEnergy,
        useEnergyRetrieval, handleEnergyRetrievalSelect, handleEnergyRetrievalConfirm,
        useKangaskhanEX, useGenesectEX, handleGenesectSelect, handleGenesectConfirm,
        useArchaludonEX, handleArchaludonEnergySelect, handleArchaludonTargetSelect,
        useNoctowl, handleNoctowlSelect, handleNoctowlConfirm,
        useMegaLucarioEX, handleMegaLucarioEXSelectEnergy, handleMegaLucarioEXConfirmEnergy, handleMegaLucarioEXAttachClick,
        handleMegaLucarioEnergySelect, startMegaLucarioEnergyAttachment, applyMegaLucarioEnergy, resetMegaBrave,
        usePreciousCarrier, handlePreciousCarrierSelect, handlePreciousCarrierConfirm,
        usePrimeCatcher, handlePrimeCatcherOpponentClick,
        usePokemonSwitch, usePecharuntChainOfCommand, handlePecharuntSelectTarget,
        useFlareonBurningCharge, handleFlareonSelectEnergy, handleFlareonConfirmEnergy, handleFlareonAttachClick,
        useMunkidoriAdrenalBrain, handleMunkidoriSourceClick, handleMunkidoriConfirmCount, handleMunkidoriTargetClick,
        useLunaCycle,
        useUltraBall, handleUltraBallDiscardSelection, handleUltraBallConfirmDiscard, handleUltraBallSearchSelect, handleUltraBallCancel,
        usePoffin, handlePoffinSelect, handlePoffinConfirm,
        useBossOrders,
        useTouko, handleToukoSelect, handleToukoConfirm,
        useFightGong, handleFightGongSelect, handleFightGongConfirm,
        useCarmine, useJudge, useApollo, useAthena, useUnfairStamp,
        handleAkamatsuSelectEnergy, handleAkamatsuConfirmTwo, handleAkamatsuSelectForHand,
    } = handlers

    const { getCardSpecificActions } = useMenuBuilder({
        remaining,
        trash,
        fanCallUsedThisTurn,
        setAkamatsuState,
        setDawnState,
        setFanCallState,
        setFanCallUsedThisTurn,
        setGlassTrumpetState,
        setTeraOrbState,
        setBrocksScoutState,
        setRagingBoltState,
        setNoctowlState,
        setPokePadState,
        closeMenu,
        moveToTrash,
        useLillie,
        useAthena,
        useApollo,
        useJudge,
        useCarmine,
        usePoffin,
        useBossOrders,
        useTouko,
        useFightGong,
        useUnfairStamp,
        usePokegear,
        useTatsugiri,
        useOgerpon,
        useZoroark,
        useFezandipiti,
        useDudunsparce,
        useMeowthEX,
        useBugCatchingSet,
        useEnergySwitch,
        useEnergyRetrieval,
        useNoctowl,
        useMegaLucarioEX,
        useKangaskhanEX,
        useGenesectEX,
        useArchaludonEX,
        useLunaCycle,
        useNPointUp,
        useCyano,
        useOgerponWellspring,
        usePreciousCarrier,
        usePrimeCatcher,
        usePokemonSwitch,
        usePecharuntChainOfCommand,
        useFlareonBurningCharge,
        useMunkidoriAdrenalBrain,
        useUltraBall,
        useTeisatsuShirei,
        useNightStretcher,
        useLambda,
        handleCursedBomb,
        handlePsychicDraw,
        handleBurstingRoar,
        onEffectTrigger,
    })

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
        if (!card) return
        setHand(h => [...h, card])
        setRemaining(prev => prev.filter((_, i) => i !== index))
    }

    const moveFromDeckToBench = (index: number) => {
        const card = remaining[index]
        if (!card) return

        const firstEmptyIndex = bench.findIndex(s => s === null)
        if (firstEmptyIndex !== -1 && firstEmptyIndex < benchSize) {
            setBench(currentBench => {
                const newBench = [...currentBench]
                newBench[firstEmptyIndex] = createStack(card)
                return newBench
            })
            setRemaining(prev => prev.filter((_, i) => i !== index))
        } else {
            alert("ベンチに空きがありません")
        }
    }

    const moveFromDeckToTrash = (index: number) => {
        const card = remaining[index]
        if (!card) return
        setTrash(t => [...t, card])
        setRemaining(prev => prev.filter((_, i) => i !== index))
    }

    const moveFromDeckToBattleField = (index: number) => {
        const card = remaining[index]
        if (!card) return

        if (!battleField) {
            setBattleField(createStack(card))
            setRemaining(prev => prev.filter((_, i) => i !== index))
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

    const updateStatus = (source: 'battle' | 'bench', index: number, status: 'none' | 'poison' | 'burn' | 'confused' | 'asleep' | 'paralyzed') => {
        if (source === 'battle') {
            if (!battleField) return
            setBattleField({ ...battleField, status })
        } else {
            const stack = bench[index]
            if (!stack) return
            const newBench = [...bench]
            newBench[index] = { ...stack, status }
            setBench(newBench)
        }
    }

    // Trash Menu Actions
    const moveFromTrashToHand = (index: number) => {
        const card = trash[index]
        if (!card) return
        setHand(h => [...h, card])
        setTrash(prev => prev.filter((_, i) => i !== index))
        setTrashCardMenu(null)
    }

    const moveFromTrashToDeck = (index: number) => {
        const card = trash[index]
        if (!card) return

        setRemaining(prevRemaining => {
            return [...prevRemaining, card].sort(() => Math.random() - 0.5)
        })
        setTrash(prevTrash => prevTrash.filter((_, i) => i !== index))
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
        let attached = false

        if (targetType === 'battle') {
            setBattleField(currentBattleField => {
                if (currentBattleField && canStack(card, currentBattleField)) {
                    attached = true
                    return {
                        ...currentBattleField,
                        cards: [...currentBattleField.cards, card],
                        energyCount: currentBattleField.energyCount + (isEnergy(card) ? 1 : 0),
                        toolCount: currentBattleField.toolCount + (isTool(card) ? 1 : 0)
                    }
                } else {
                    alert("このカードはバトル場のポケモンに付けられません")
                    return currentBattleField
                }
            })
        } else {
            setBench(currentBench => {
                const stack = currentBench[targetIndex]
                if (stack && canStack(card, stack)) {
                    attached = true
                    const newBench = [...currentBench]
                    newBench[targetIndex] = {
                        ...stack,
                        cards: [...stack.cards, card],
                        energyCount: stack.energyCount + (isEnergy(card) ? 1 : 0),
                        toolCount: stack.toolCount + (isTool(card) ? 1 : 0)
                    }
                    return newBench
                } else {
                    alert("このカードは選択したポケモンに付けられません")
                    return currentBench
                }
            })
        }

        if (attached) {
            setTrash(prev => {
                const next = prev.filter((_, i) => i !== attachMode.sourceIndex)
                return next
            })
            setAttachMode(null)
        } else {
            // Even if failed to attach, we probably want to reset attachMode to stop interaction
            setAttachMode(null)
        }
    }


    // Attachment Management
    const handleRemoveAttachment = (cardIndex: number) => {
        if (!attachmentTarget) return

        const { type, index } = attachmentTarget
        if (type === 'battle') {
            if (!battleField) return
            const cardToRemove = battleField.cards[cardIndex]

            setBattleField(current => {
                if (!current) return null
                const newCards = current.cards.filter((_, i) => i !== cardIndex)
                if (newCards.length === 0) return null
                return {
                    ...current,
                    cards: newCards,
                    energyCount: current.energyCount - (isEnergy(cardToRemove) ? 1 : 0),
                    toolCount: current.toolCount - (isTool(cardToRemove) ? 1 : 0)
                }
            })
            setTrash(prev => [...prev, cardToRemove])
        } else {
            const stack = bench[index]
            if (!stack) return
            const cardToRemove = stack.cards[cardIndex]

            setBench(currentBench => {
                const targetStack = currentBench[index]
                if (!targetStack) return currentBench
                const newCards = targetStack.cards.filter((_, i) => i !== cardIndex)
                const newBench = [...currentBench]
                if (newCards.length === 0) {
                    newBench[index] = null
                } else {
                    newBench[index] = {
                        ...targetStack,
                        cards: newCards,
                        energyCount: targetStack.energyCount - (isEnergy(cardToRemove) ? 1 : 0),
                        toolCount: targetStack.toolCount - (isTool(cardToRemove) ? 1 : 0)
                    }
                }
                return newBench
            })
            setTrash(prev => [...prev, cardToRemove])
        }
    }

    const returnAttachmentToHand = (cardIndex: number) => {
        if (!attachmentTarget) return
        const { type, index } = attachmentTarget
        const stack = type === 'battle' ? battleField : bench[index]
        if (!stack) return

        const card = stack.cards[cardIndex]
        if (!card) return
        setHand(prev => [...prev, card])

        if (type === 'battle') {
            setBattleField(current => {
                if (!current) return null
                const newCards = current.cards.filter((_, i) => i !== cardIndex)
                if (newCards.length === 0) return null
                return {
                    ...current,
                    cards: newCards,
                    energyCount: current.energyCount - (isEnergy(card) ? 1 : 0),
                    toolCount: current.toolCount - (isTool(card) ? 1 : 0)
                }
            })
        } else {
            setBench(currentBench => {
                const targetStack = currentBench[index]
                if (!targetStack) return currentBench
                const newCards = targetStack.cards.filter((_, i) => i !== cardIndex)
                const newBench = [...currentBench]
                if (newCards.length === 0) {
                    newBench[index] = null
                } else {
                    newBench[index] = {
                        ...targetStack,
                        cards: newCards,
                        energyCount: targetStack.energyCount - (isEnergy(card) ? 1 : 0),
                        toolCount: targetStack.toolCount - (isTool(card) ? 1 : 0)
                    }
                }
                return newBench
            })
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
        if (!card) return

        if (type === 'battle') {
            setBattleField(current => {
                if (!current) return null
                const newCards = current.cards.filter((_, i) => i !== cardIndex)
                if (newCards.length === 0) return null
                return {
                    ...current,
                    cards: newCards,
                    energyCount: current.energyCount - (isEnergy(card) ? 1 : 0),
                    toolCount: current.toolCount - (isTool(card) ? 1 : 0)
                }
            })
        } else {
            setBench(currentBench => {
                const targetStack = currentBench[index]
                if (!targetStack) return currentBench
                const newCards = targetStack.cards.filter((_, i) => i !== cardIndex)
                const newBench = [...currentBench]
                if (newCards.length === 0) {
                    newBench[index] = null
                } else {
                    newBench[index] = {
                        ...targetStack,
                        cards: newCards,
                        energyCount: targetStack.energyCount - (isEnergy(card) ? 1 : 0),
                        toolCount: targetStack.toolCount - (isTool(card) ? 1 : 0)
                    }
                }
                return newBench
            })
        }

        setRemaining(prev => [...prev, card].sort(() => Math.random() - 0.5))
        alert("山札に戻してシャッフルしました")
    }



    // Rocket Gang Actions

    /*
    const useGiovanni = (playedIndex?: number) => {
        // Check if there is at least one Pokemon on the bench to switch with
        const hasBenchPokemon = bench.some(stack => stack && getTopPokemon(stack))
        if (!hasBenchPokemon) {
            alert("ベンチにポケモンがいません。入れ替えができません。")
            return
        }
     
        if (playedIndex !== undefined) moveToTrash(playedIndex)
     
        // Step 1: Select Self Bench (Any Pokemon)
        setOnBoardSelection({
            type: 'move',
            source: 'local', // Indicates local player selection
            title: 'サカキ: 入れ替えるベンチポケモンを選んでください',
            onSelect: (type, index) => {
                if (type !== 'bench') return
     
                const stack = bench[index]
                if (!stack || stack.cards.length === 0) return
     
                // Execute Self Switch
                switchPokemon(index)
                setOnBoardSelection(null)
     
                // Step 2: Trigger Opponent Switch
                onEffectTrigger?.('boss_orders', 'opponent')
            }
        })
    }
    */

    // --- Akamatsu (Crispin) Logic ---

    // Akamatsu logic handled via closure in onBoardSelection

    const handlePokePadSelect = (index: number) => {
        if (!pokePadState) return
        const card = pokePadState[index]

        if (!isPokemon(card)) {
            alert("ポケモンを選択してください")
            return
        }
        if (isRuleBox(card)) {
            alert("ルールを持つポケモンは選択できません")
            return
        }

        // Add to hand
        setHand(prev => [...prev, card])

        // Remove from deck
        setRemaining(prev => {
            let removed = false
            return prev.filter(c => {
                if (!removed && c.name === card.name) {
                    removed = true
                    return false
                }
                return true
            })
        })

        setPokePadState(null)
        shuffleDeck()
        showToast(`${card.name}を手札に加え、山札をシャッフルしました`)
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
            setHand(prev => [...prev, card])
        } else if (destination === 'deck') {
            setRemaining(prev => [...prev, card].sort(() => Math.random() - 0.5))
        } else {
            setTrash(prev => [...prev, card])
        }
    }

    // Discard Top Deck
    const discardTopDeck = () => {
        if (remaining.length === 0) return
        const topCard = remaining[0]
        const newRemaining = remaining.slice(1)
        setRemaining(newRemaining)
        setTrash(prev => [...prev, topCard])
    }

    // Discard Random Hand
    const discardRandomHand = () => {
        const currentHand = hand
        if (currentHand.length === 0) return
        const randomIndex = Math.floor(Math.random() * currentHand.length)
        const card = currentHand[randomIndex]
        setHand(prev => prev.filter((_, i) => i !== randomIndex))
        setTrash(prev => [...prev, card])
    }




    const BattleFieldContent = (
        <DroppableZone id={`${idPrefix}-battle-field`} className={`${theme.bg} rounded-lg shadow-lg p-1 sm:p-3 ${theme.border} border ${attachMode ? 'ring-2 ring-green-400 animate-pulse' : ''} ${mobile ? 'w-full h-full min-w-[60px]' : 'min-w-[180px]'} flex flex-col items-center justify-center`}>
            <h2 className={`text-[10px] sm:text-sm font-bold text-gray-900 uppercase mb-1 sm:mb-2 w-full text-center ${mobile ? 'hidden' : ''}`}>バトル場</h2>
            {battleField ? (
                <DraggableCard
                    id={`${idPrefix}-battle-card`}
                    data={{ type: 'battle', index: 0, card: battleField, playerPrefix: idPrefix }}
                    onClick={(e) => {
                        if (ironLeavesEXState?.active) {
                            handleIronLeavesEXClickPokemon('battle', 0)
                        } else if (nPointUpState?.step === 'select_target') {
                            handleNPointUpClickPokemon('battle', 0)
                        } else if (energySwitchState?.step === 'select_source_pokemon' || energySwitchState?.step === 'select_target_pokemon') {
                            handleEnergySwitchClickPokemon('battle', 0)
                        }
                        if (glassTrumpetState?.step === 'select_target') {
                            handleGlassTrumpetTargetSelect('battle', 0)
                            return
                        }
                        if (megaLucarioEXAttackState && megaLucarioEXAttackState.step === 'attach_energy') {
                            applyMegaLucarioEnergy('battle', 0)
                            return
                        }
                        handleCardClick(e, battleField!, 'battle', 0)
                    }}
                >
                    <CascadingStack
                        stack={battleField}
                        width={sizes.battle.w}
                        height={sizes.battle.h}
                        onDamageChange={(delta) => updateDamage('battle', 0, delta)}
                        onDamageClick={() => setDamageTarget({ type: 'battle', index: 0 })}
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
            {/* Render Modals */}
            <GameModals
                damageTarget={damageTarget}
                setDamageTarget={setDamageTarget}
                updateDamage={updateDamage}
                updateStatus={updateStatus}
                battleField={battleField}
                bench={bench}
                menu={menu}
                setMenu={setMenu}
                closeMenu={closeMenu}
                getCardSpecificActions={getCardSpecificActions}
                setBattleField={setBattleField}
                setBench={setBench}
                setDetailModal={setDetailModal}
                setShowDetailModal={setShowDetailModal}
                playToBattleField={playToBattleField}
                playToBench={playToBench}
                trashFromHand={trashFromHand}
                battleToHand={battleToHand}
                startSwapWithBench={startSwapWithBench}
                battleToDeck={battleToDeck}
                battleToTrash={battleToTrash}
                benchToHand={benchToHand}
                swapBenchToBattle={swapBenchToBattle}
                benchToTrash={benchToTrash}
                damageSelector={damageSelector}
                setDamageSelector={setDamageSelector}
                onAttackTrigger={onAttackTrigger}
                showToast={showToast}
                retreatState={retreatState}
                setRetreatState={setRetreatState}
                executeRetreat={executeRetreat}
                showDetailModal={showDetailModal}
                detailModal={detailModal}
                handleSafeRemove={handleSafeRemove}
                showActionMenu={showActionMenu}
                setShowActionMenu={setShowActionMenu}
                shuffleDeck={shuffleDeck}
                mulligan={mulligan}
                discardTopDeck={discardTopDeck}
                discardRandomHand={discardRandomHand}
                nextTurn={nextTurn}
                remaining={remaining}
                hand={hand}
            />

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

                            {/* Action Menu Dropdown/Modal - rendered via GameModals */}
                        </div>
                    </div>
                </div>

            </div>

            {/* Top Slot Hand feature removed: Always rendering Hand at Bottom for both P1 and P2 on PC */}

            {/* Main Battle Area: Dynamically ordered based on isOpponent or isActive on mobile */}
            <div className={`flex flex-col gap-0.5 sm:gap-2 ${(mobile && !isActive) ? 'flex-col-reverse' : ''}`}>

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
                                    onClick={() => takePrizeCard()}
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-transform active:scale-95"
                                >
                                    1枚取る
                                </button>
                            )}
                        </div>
                    )}

                {/* Main Row: Prizes, Battle */}
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
                <div className="rounded-2xl shadow-2xl p-1 sm:p-3 w-full overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 order-none flex flex-row">
                    {/* Mobile Only: Side (Prizes) on Left of Bench */}
                    {mobile && (
                        <div className="flex-shrink-0 mr-1 flex items-center">
                            <NumericalSidePrize 
                                count={prizeCards.length} 
                                isPlayer1={idPrefix === 'player1'} 
                                onClick={() => takePrizeCard()}
                            />
                        </div>
                    )}

                    {/* Left: Bench Cards (4x2 Grid for Mobile) */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-[10px] sm:text-sm font-bold text-gray-900 uppercase">ベンチ</h2>
                            <button onClick={increaseBenchSize} disabled={benchSize >= 8} className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] shadow hover:bg-blue-600">+</button>
                            <span className="text-[8px] text-gray-500">Max: {benchSize}</span>
                        </div>
                        <div className={`
                            ${mobile ? 'grid grid-cols-4 grid-rows-2 gap-x-1 gap-y-1.5' : 'flex gap-1 sm:gap-6 overflow-x-auto scrollbar-black items-end'} 
                            py-1 px-1 sm:h-auto
                        `}>
                            {bench.slice(0, benchSize).map((stack, i) => (
                                <DroppableZone key={i} id={`${idPrefix}-bench-slot-${i}`} className={`flex-shrink-0 ${attachMode && stack ? 'ring-2 ring-green-400 rounded animate-pulse' : ''}`}>
                                    {stack ? (
                                        <DraggableCard
                                            id={`${idPrefix}-bench-card-${i}`}
                                            data={{ type: 'bench', index: i, card: stack, playerPrefix: idPrefix }}
                                            onClick={(e) => {
                                                if (ironLeavesEXState?.active) {
                                                    handleIronLeavesEXClickPokemon('bench', i)
                                                } else if (nPointUpState?.step === 'select_target') {
                                                    handleNPointUpClickPokemon('bench', i)
                                                } else if (energySwitchState?.step === 'select_source_pokemon' || energySwitchState?.step === 'select_target_pokemon') {
                                                    handleEnergySwitchClickPokemon('bench', i)
                                                } else if (glassTrumpetState?.step === 'select_target') {
                                                    handleGlassTrumpetTargetSelect('bench', i)
                                                } else if (megaLucarioEXAttackState?.step === 'attach_energy') {
                                                    handleMegaLucarioEXAttachClick('bench', i)
                                                } else {
                                                    handleCardClick(e, stack, 'bench', i)
                                                }
                                            }}
                                            className={swapMode?.active ? 'ring-2 ring-blue-400 animate-pulse' : ''}
                                        >
                                            <CascadingStack
                                                stack={stack}
                                                width={sizes.bench.w}
                                                height={sizes.bench.h}
                                                onDamageChange={(delta) => updateDamage('bench', i, delta)}
                                                onDamageClick={() => setDamageTarget({ type: 'bench', index: i })}
                                            />
                                        </DraggableCard>
                                    ) : (
                                        <div
                                            className="rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[8px] hover:border-blue-400 cursor-pointer"
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

            {/* Hand - Bottom Slot (Show on Mobile if Active, or Always on Desktop) */}
            {((mobile && isActive) || (!mobile)) && (
                <div className="rounded-2xl shadow-2xl p-2 sm:p-5 bg-white/[0.05] backdrop-blur-md border border-white/10 mt-4 z-[50] overflow-visible">
                    <h2 className="text-[10px] sm:text-xs font-black text-white/40 mb-4 uppercase tracking-[0.3em] text-center">{playerName}の手札 — {hand.length}枚</h2>
                    
                    <div className={mobile ? "hand-fanning-container-mobile hide-scrollbar w-full px-1" : "hand-fanning-container-pc hide-scrollbar px-10"}>
                        {hand.map((card, i) => {
                            return (
                                <div
                                    key={`${idPrefix}-hand-item-${i}`}
                                    className={`relative ${mobile ? 'hand-card-wrapper-mobile' : 'hand-card-wrapper-pc'}`}
                                >
                                    <DraggableCard
                                        id={`${idPrefix}-hand-card-${i}`}
                                        data={{ type: 'hand', index: i, card, playerPrefix: idPrefix }}
                                        onClick={(e) => handleCardClick(e, card, 'hand', i)}
                                    >
                                        <div className="relative cursor-pointer shadow-[0_8px_16px_rgba(0,0,0,0.5)] rounded-lg group overflow-hidden border border-white/5">
                                            <Image
                                                src={card.imageUrl}
                                                alt={card.name}
                                                width={sizes.hand.w * 1.1}
                                                height={sizes.hand.h * 1.1}
                                                className="rounded-lg transition-opacity group-hover:opacity-100 opacity-95"
                                                unoptimized
                                            />
                                            {/* Subtle reflection/shine effect like PTCGL */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                    </DraggableCard>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}



            {/* Modals */}
            <CardEffectModals
                hand={hand}
                remaining={remaining}
                setRemaining={setRemaining}
                trash={trash}
                battle={battle}
                battleField={battleField}
                bench={bench}
                idPrefix={idPrefix}
                mobile={mobile}
                sizes={sizes}
                showDeckViewer={showDeckViewer}
                setShowDeckViewer={setShowDeckViewer}
                showTrashViewer={showTrashViewer}
                setShowTrashViewer={setShowTrashViewer}
                deckCardMenu={deckCardMenu}
                setDeckCardMenu={setDeckCardMenu}
                trashCardMenu={trashCardMenu}
                setTrashCardMenu={setTrashCardMenu}
                peekDeckSearch={peekDeckSearch}
                setPeekDeckSearch={setPeekDeckSearch}
                activeDragId={activeDragId}
                activeDragData={activeDragData}
                ultraBallState={ultraBallState}
                setUltraBallState={setUltraBallState}
                poffinState={poffinState}
                setPoffinState={setPoffinState}
                toukoState={toukoState}
                setToukoState={setToukoState}
                fightGongState={fightGongState}
                setFightGongState={setFightGongState}
                lambdaState={lambdaState}
                setLambdaState={setLambdaState}
                nightStretcherState={nightStretcherState}
                setNightStretcherState={setNightStretcherState}
                genesectState={genesectState}
                setGenesectState={setGenesectState}
                archaludonState={archaludonState}
                setArchaludonState={setArchaludonState}
                tatsugiriState={tatsugiriState}
                ogerponState={ogerponState}
                setOgerponState={setOgerponState}
                zoroarkState={zoroarkState}
                setZoroarkState={setZoroarkState}
                meowthEXState={meowthEXState}
                ironLeavesEXState={ironLeavesEXState}
                setIronLeavesEXState={setIronLeavesEXState}
                nPointUpState={nPointUpState}
                setNPointUpState={setNPointUpState}
                cyanoState={cyanoState}
                ogerponWellspringState={ogerponWellspringState}
                setOgerponWellspringState={setOgerponWellspringState}
                bugCatchingSetState={bugCatchingSetState}
                energySwitchState={energySwitchState}
                setEnergySwitchState={setEnergySwitchState}
                energyRetrievalState={energyRetrievalState}
                setEnergyRetrievalState={setEnergyRetrievalState}
                noctowlState={noctowlState}
                setNoctowlState={setNoctowlState}
                megaLucarioEXAttackState={megaLucarioEXAttackState}
                setMegaLucarioEXAttackState={setMegaLucarioEXAttackState}
                ragingBoltState={ragingBoltState}
                setRagingBoltState={setRagingBoltState}
                dawnState={dawnState}
                fanCallState={fanCallState}
                glassTrumpetState={glassTrumpetState}
                setGlassTrumpetState={setGlassTrumpetState}
                teraOrbState={teraOrbState}
                setTeraOrbState={setTeraOrbState}
                brocksScoutState={brocksScoutState}
                setBrocksScoutState={setBrocksScoutState}
                akamatsuState={akamatsuState}
                setAkamatsuState={setAkamatsuState}
                teisatsuCards={teisatsuCards}
                pokegearCards={pokegearCards}
                pokePadState={pokePadState}
                setPokePadState={setPokePadState}
                setOnBoardSelection={setOnBoardSelection}
                shuffleDeck={shuffleDeck}
                moveFromDeckToHand={moveFromDeckToHand}
                moveFromDeckToBench={moveFromDeckToBench}
                moveFromDeckToTrash={moveFromDeckToTrash}
                moveFromDeckToBattleField={moveFromDeckToBattleField}
                moveFromTrashToHand={moveFromTrashToHand}
                moveFromTrashToDeck={moveFromTrashToDeck}
                startAttachFromTrash={startAttachFromTrash}
                handlePokePadSelect={handlePokePadSelect}
                handleUltraBallDiscardSelection={handleUltraBallDiscardSelection}
                handleUltraBallConfirmDiscard={handleUltraBallConfirmDiscard}
                handleUltraBallSearchSelect={handleUltraBallSearchSelect}
                handleUltraBallCancel={handleUltraBallCancel}
                handlePoffinSelect={handlePoffinSelect}
                handlePoffinConfirm={handlePoffinConfirm}
                handleToukoSelect={handleToukoSelect}
                handleToukoConfirm={handleToukoConfirm}
                handleFightGongSelect={handleFightGongSelect}
                handleFightGongConfirm={handleFightGongConfirm}
                handleLambdaSelect={handleLambdaSelect}
                handleLambdaConfirm={handleLambdaConfirm}
                handleNightStretcherSelect={handleNightStretcherSelect}
                handleNightStretcherConfirm={handleNightStretcherConfirm}
                handleGenesectSelect={handleGenesectSelect}
                handleGenesectConfirm={handleGenesectConfirm}
                handleArchaludonEnergySelect={handleArchaludonEnergySelect}
                handleArchaludonTargetSelect={handleArchaludonTargetSelect}
                handleTatsugiriSelect={handleTatsugiriSelect}
                handleTatsugiriConfirm={handleTatsugiriConfirm}
                handleOgerponSelect={handleOgerponSelect}
                handleOgerponConfirm={handleOgerponConfirm}
                handleZoroarkSelect={handleZoroarkSelect}
                handleZoroarkConfirm={handleZoroarkConfirm}
                handleMeowthEXSelect={handleMeowthEXSelect}
                handleMeowthEXConfirm={handleMeowthEXConfirm}
                handleNPointUpSelectEnergy={handleNPointUpSelectEnergy}
                handleNPointUpConfirmEnergy={handleNPointUpConfirmEnergy}
                handleCyanoSelect={handleCyanoSelect}
                handleCyanoConfirm={handleCyanoConfirm}
                handleOgerponWellspringSelectCost={handleOgerponWellspringSelectCost}
                handleOgerponWellspringConfirmCost={handleOgerponWellspringConfirmCost}
                handleBugCatchingSetSelect={handleBugCatchingSetSelect}
                handleBugCatchingSetConfirm={handleBugCatchingSetConfirm}
                handleEnergySwitchSelectEnergy={handleEnergySwitchSelectEnergy}
                handleEnergyRetrievalSelect={handleEnergyRetrievalSelect}
                handleEnergyRetrievalConfirm={handleEnergyRetrievalConfirm}
                handleNoctowlSelect={handleNoctowlSelect}
                handleNoctowlConfirm={handleNoctowlConfirm}
                handleMegaLucarioEXSelectEnergy={handleMegaLucarioEXSelectEnergy}
                handleMegaLucarioEXConfirmEnergy={handleMegaLucarioEXConfirmEnergy}
                handleExtremeAscentToggleEnergy={handleExtremeAscentToggleEnergy}
                handleExtremeAscentConfirm={handleExtremeAscentConfirm}
                handleDawnSelect={handleDawnSelect}
                handleDawnConfirm={handleDawnConfirm}
                handleDawnCancel={handleDawnCancel}
                handleFanCallSelect={handleFanCallSelect}
                handleFanCallConfirm={handleFanCallConfirm}
                handleFanCallCancel={handleFanCallCancel}
                handleGlassTrumpetEnergySelect={handleGlassTrumpetEnergySelect}
                handleGlassTrumpetConfirmEnergy={handleGlassTrumpetConfirmEnergy}
                handleTeraOrbSelect={handleTeraOrbSelect}
                handleBrocksScoutSelect={handleBrocksScoutSelect}
                handleBrocksScoutConfirm={handleBrocksScoutConfirm}
                handleAkamatsuSelectEnergy={handleAkamatsuSelectEnergy}
                handleAkamatsuConfirmTwo={handleAkamatsuConfirmTwo}
                handleAkamatsuSelectForHand={handleAkamatsuSelectForHand}
                handleTeisatsuSelect={handleTeisatsuSelect}
                handlePokegearSelect={handlePokegearSelect}
                handlePokegearCancel={handlePokegearCancel}
            />
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

// Re-export for backward compatibility
export { CascadingStack } from './practice/CascadingStack'
