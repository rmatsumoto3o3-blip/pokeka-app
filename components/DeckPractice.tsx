
'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { type Card, shuffle } from '@/lib/deckParser'
import { CardStack, createStack, getTopCard, canStack, isEnergy, isTool, isPokemon, isStadium, isRuleBox, isTrainer, isSupporter } from '@/lib/cardStack'
import { getPrizeTrainerFeedbackAction } from '@/app/aiActions'
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
    onEffectTrigger?: (effect: 'judge' | 'apollo' | 'unfair_stamp' | 'boss_orders', amount?: number) => void
    idPrefix?: string
    mobile?: boolean
    isOpponent?: boolean
}

export interface DeckPracticeRef {
    handleExternalDragEnd: (event: any) => void
    playStadium: (index: number) => void
    switchPokemon: (benchIndex: number) => void
    receiveEffect: (effect: 'judge' | 'apollo' | 'unfair_stamp' | 'boss_orders', amount?: number) => void
    startSelection: (config: { title: string; onSelect: (type: 'battle' | 'bench', index: number) => void }) => void
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
    const [battle, setBattle] = useState<CardStack | null>(null)
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
    const [onBoardSelection, setOnBoardSelection] = useState<{
        type: 'move',
        source: string,
        title: string,
        onSelect: (type: 'battle' | 'bench', index: number) => void
    } | null>(null)
    const [akamatsuState, setAkamatsuState] = useState<{
        step: 'select_two' | 'select_for_hand' | 'select_target',
        candidates: Card[],
        selectedIndices: number[],
        forHandIndex: number | null
    } | null>(null)
    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const [peekDeckSearch, setPeekDeckSearch] = useState(false)

    // Updated Detail Modal State: Holds context about the stack being viewed
    interface DetailModalState {
        stack: CardStack
        type: 'battle' | 'bench'
        index: number
    }
    const [detailModal, setDetailModal] = useState<DetailModalState | null>(null)
    const [pokePadState, setPokePadState] = useState<Card[] | null>(null)

    interface UltraBallState {
        step: 'discard' | 'search'
        candidates: Card[]
        handIndices: number[] // Used in 'discard' step
    }
    const [ultraBallState, setUltraBallState] = useState<UltraBallState | null>(null)

    interface PoffinState {
        step: 'search'
        candidates: Card[]
        selectedIndices: number[]
    }
    const [poffinState, setPoffinState] = useState<PoffinState | null>(null)

    interface ToukoState {
        step: 'search'
        candidates: Card[]
        selectedPokemonIndex: number | null
        selectedEnergyIndex: number | null
    }
    const [toukoState, setToukoState] = useState<ToukoState | null>(null)

    interface FightGongState {
        step: 'search'
        candidates: Card[]
        selectedIndex: number | null
    }
    const [fightGongState, setFightGongState] = useState<FightGongState | null>(null)

    // Rocket's Lambda State
    interface LambdaState {
        step: 'search'
        candidates: Card[]
        selectedIndex: number | null
    }
    const [lambdaState, setLambdaState] = useState<LambdaState | null>(null)

    // Night Stretcher State
    interface NightStretcherState {
        step: 'select'
        candidates: Card[] // From Trash
        selectedIndex: number | null
    }
    const [nightStretcherState, setNightStretcherState] = useState<NightStretcherState | null>(null)

    // Tatsugiri State
    interface TatsugiriState {
        step: 'search'
        candidates: Card[]
        selectedIndex: number | null
    }
    const [tatsugiriState, setTatsugiriState] = useState<TatsugiriState | null>(null)

    // Ogerpon Teal Mask ex State
    interface OgerponState {
        step: 'select_energy'
        candidates: Card[]
        selectedIndex: number | null
        targetSource: string
        targetIndex: number
    }
    const [ogerponState, setOgerponState] = useState<OgerponState | null>(null)

    // Zoroark ex State
    interface ZoroarkState {
        step: 'discard'
        candidates: Card[]
        selectedIndex: number | null
    }
    const [zoroarkState, setZoroarkState] = useState<ZoroarkState | null>(null)

    // Meowth ex State
    interface MeowthEXState {
        step: 'search'
        candidates: Card[]
        selectedIndex: number | null
    }
    const [meowthEXState, setMeowthEXState] = useState<MeowthEXState | null>(null)
    const [okunoteUsedThisTurn, setOkunoteUsedThisTurn] = useState(false)

    // Iron Leaves ex State
    interface IronLeavesEXState {
        active: boolean
        targetType: 'battle' | 'bench'
        targetIndex: number
    }
    const [ironLeavesEXState, setIronLeavesEXState] = useState<IronLeavesEXState | null>(null)

    // Nのポイントアップ State
    interface NPointUpState {
        step: 'select_energy' | 'select_target',
        candidates: Card[],
        selectedIndex: number | null
    }
    const [nPointUpState, setNPointUpState] = useState<NPointUpState | null>(null)

    // シアノ State
    interface CyanoState {
        step: 'search',
        candidates: Card[],
        selectedIndices: number[]
    }
    const [cyanoState, setCyanoState] = useState<CyanoState | null>(null)

    interface OgerponWellspringState {
        active: boolean,
        step: 'select_cost',
        selectedIndices: number[]
    }
    const [ogerponWellspringState, setOgerponWellspringState] = useState<OgerponWellspringState | null>(null)

    // むしとりセット State
    interface BugCatchingSetState {
        step: 'search',
        candidates: Card[],
        selectedIndices: number[]
    }
    const [bugCatchingSetState, setBugCatchingSetState] = useState<BugCatchingSetState | null>(null)

    // エネルギーつけかえ State
    interface EnergySwitchState {
        step: 'select_source_pokemon' | 'select_energy' | 'select_target_pokemon',
        sourceType: 'battle' | 'bench' | null,
        sourceIndex: number | null,
        energyIndex: number | null,
        targetType: 'battle' | 'bench' | null,
        targetIndex: number | null
    }
    const [energySwitchState, setEnergySwitchState] = useState<EnergySwitchState | null>(null)

    // エネルギー回収 State
    interface EnergyRetrievalState {
        step: 'select',
        candidates: Card[],
        selectedIndices: number[]
    }
    const [energyRetrievalState, setEnergyRetrievalState] = useState<EnergyRetrievalState | null>(null)

    // ヨルノズク State
    interface NoctowlState {
        step: 'search',
        candidates: Card[],
        selectedIndices: number[]
    }
    const [noctowlState, setNoctowlState] = useState<NoctowlState | null>(null)

    // メガルカリオex State
    interface MegaLucarioEXAttackState {
        step: 'select_energy' | 'attach_energy',
        candidates: Card[],
        selectedIndices: number[],
        attachingIndex: number
    }
    const [megaLucarioEXAttackState, setMegaLucarioEXAttackState] = useState<MegaLucarioEXAttackState | null>(null)
    const [megaBraveUsedLastTurn, setMegaBraveUsedLastTurn] = useState(false)

    // ルナトーン State
    const [lunacycleUsedThisTurn, setLunacycleUsedThisTurn] = useState(false)

    // プレシャスキャリー State
    interface PreciousCarrierState {
        step: 'search',
        candidates: Card[],
        selectedIndices: number[]
    }
    const [preciousCarrierState, setPreciousCarrierState] = useState<PreciousCarrierState | null>(null)

    // プライムキャッチャー State
    interface PrimeCatcherState {
        step: 'select_opponent' | 'select_own',
        opponentIndex: number | null
    }
    const [primeCatcherState, setPrimeCatcherState] = useState<PrimeCatcherState | null>(null)

    // モモワロウex State
    const [pecharuntUsedThisTurn, setPecharuntUsedThisTurn] = useState(false)
    interface PecharuntState {
        step: 'select_target'
    }
    const [pecharuntState, setPecharuntState] = useState<PecharuntState | null>(null)

    // ブースターex State
    interface FlareonState {
        step: 'search' | 'attach',
        candidates: Card[],
        selectedIndices: number[],
        attachingIndex: number
    }
    const [flareonState, setFlareonState] = useState<FlareonState | null>(null)

    // マシマシラ State
    const [munkidoriUsedThisTurn, setMunkidoriUsedThisTurn] = useState(false)
    interface MunkidoriState {
        step: 'select_source' | 'select_count' | 'select_target',
        sourceType: 'battle' | 'bench' | null,
        sourceIndex: number | null,
        count: number
    }
    const [munkidoriState, setMunkidoriState] = useState<MunkidoriState | null>(null)
    const [fanCallUsedThisTurn, setFanCallUsedThisTurn] = useState(false)

    // ヒカリ State
    interface DawnState {
        step: 'search'
        candidates: Card[]
        selectedIndices: number[]
    }
    const [dawnState, setDawnState] = useState<DawnState | null>(null)

    // スピンロトム (Fan Call) State
    interface FanCallState {
        step: 'search'
        candidates: Card[]
        selectedIndices: number[]
    }
    const [fanCallState, setFanCallState] = useState<FanCallState | null>(null)

    // ガラスのラッパ State
    interface GlassTrumpetState {
        step: 'select_energy' | 'select_target'
        candidates: Card[] // Energies in trash
        selectedEnergyIndices: number[]
        targetBenchIndices: number[]
    }
    const [glassTrumpetState, setGlassTrumpetState] = useState<GlassTrumpetState | null>(null)

    // テラスタルオーブ State
    interface TeraOrbState {
        step: 'search'
        candidates: Card[]
        selectedIndex: number | null
    }
    const [teraOrbState, setTeraOrbState] = useState<TeraOrbState | null>(null)

    // タケシのスカウト State
    interface BrocksScoutState {
        step: 'search'
        candidates: Card[]
        selectedIndices: number[]
    }
    const [brocksScoutState, setBrocksScoutState] = useState<BrocksScoutState | null>(null)

    // タケルライコex State
    interface RagingBoltState {
        step: 'select_energy'
        selectedEnergies: {
            source: 'battle' | 'bench'
            targetIndex: number
            cardIndex: number
            card: Card
        }[]
    }
    const [ragingBoltState, setRagingBoltState] = useState<RagingBoltState | null>(null)




    // サマヨール・ヨノワール (Dusclops/Dusknoir) Logic
    const handleCursedBomb = (source: 'battle' | 'bench', index: number, damage: number) => {
        let stack: CardStack | null = null
        if (source === 'battle') {
            stack = battleField
            setBattleField(null)
        } else {
            stack = bench[index]
            setBench(prev => {
                const next = [...prev]
                next[index] = null
                return next
            })
        }

        if (stack) {
            setTrash(prev => [...prev, ...stack!.cards])
            alert(`カースドボムを使用。このポケモンをきぜつさせ、ダメカンを${damage}個のせます。`)
        }
    }

    // フーディン・ユンゲラー (Alakazam/Kadabra) Logic
    const handlePsychicDraw = (drawCount: number) => {
        const count = Math.min(drawCount, remaining.length)
        const drawnCards = remaining.slice(0, count)
        const newDeck = remaining.slice(count)
        setHand(prev => [...prev, ...drawnCards])
        setRemaining(newDeck)
        alert(`特性サイコドローで山札を${count}枚引きました。`)
    }

    // --- New Card Effect Handlers ---

    // タケルライコex (Raging Bolt ex) Logic
    const handleBurstingRoar = () => {
        // Discard hand
        setTrash(prev => [...prev, ...hand])
        setHand([])
        // Draw 6
        const drawCount = Math.min(6, remaining.length)
        const drawnCards = remaining.slice(0, drawCount)
        const newDeck = remaining.slice(drawCount)
        setHand(drawnCards)
        setRemaining(newDeck)
        alert(`手札をトラッシュし、山札を${drawCount}枚引きました`)
    }

    const handleExtremeAscentToggleEnergy = (source: 'battle' | 'bench', targetIndex: number, cardIndex: number, card: Card) => {
        if (!ragingBoltState) return
        setRagingBoltState(prev => {
            if (!prev) return null
            const isSelected = prev.selectedEnergies.some(e => e.source === source && e.targetIndex === targetIndex && e.cardIndex === cardIndex)
            if (isSelected) {
                return {
                    ...prev,
                    selectedEnergies: prev.selectedEnergies.filter(e => !(e.source === source && e.targetIndex === targetIndex && e.cardIndex === cardIndex))
                }
            } else {
                return {
                    ...prev,
                    selectedEnergies: [...prev.selectedEnergies, { source, targetIndex, cardIndex, card }]
                }
            }
        })
    }

    const handleExtremeAscentConfirm = () => {
        if (!ragingBoltState) return
        const toDiscard = ragingBoltState.selectedEnergies
        const discardedCards = toDiscard.map(e => e.card)

        // Group by target to handle multiple card removals from single stack
        const battleDiscardIndices = toDiscard.filter(e => e.source === 'battle').map(e => e.cardIndex)
        const benchDiscardsByIdx: { [key: number]: number[] } = {}
        toDiscard.filter(e => e.source === 'bench').forEach(e => {
            if (!benchDiscardsByIdx[e.targetIndex]) benchDiscardsByIdx[e.targetIndex] = []
            benchDiscardsByIdx[e.targetIndex].push(e.cardIndex)
        })

        // Execute discard
        if (battleField && battleDiscardIndices.length > 0) {
            setBattleField(prev => {
                if (!prev) return null
                const newCards = prev.cards.filter((_, i) => !battleDiscardIndices.includes(i))
                return { ...prev, cards: newCards }
            })
        }

        Object.entries(benchDiscardsByIdx).forEach(([idxStr, cardIndices]) => {
            const idx = parseInt(idxStr)
            setBench(prev => {
                const next = [...prev]
                const stack = next[idx]
                if (stack) {
                    const newCards = stack.cards.filter((_, i) => !cardIndices.includes(i))
                    next[idx] = { ...stack, cards: newCards }
                }
                return next
            })
        })

        setTrash(prev => [...prev, ...discardedCards])
        setRagingBoltState(null)
        alert(`${discardedCards.length}枚のエネルギーをトラッシュしました`)
    }



    // Dawn (ヒカリ) Logic
    const handleDawnSelect = (index: number) => {
        if (!dawnState) return
        setDawnState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 3) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleDawnConfirm = () => {
        if (!dawnState) return
        const selectedCards = dawnState.selectedIndices.map(idx => remaining[idx])
        setHand(prev => [...prev, ...selectedCards])
        const newDeck = remaining.filter((_, i) => !dawnState.selectedIndices.includes(i)).sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setDawnState(null)
        alert("手札に加え、山札をシャッフルしました")
    }

    const handleDawnCancel = () => {
        if (dawnState) {
            setRemaining(prev => [...prev].sort(() => Math.random() - 0.5))
            alert("山札をシャッフルしました")
        }
        setDawnState(null)
    }

    // Fan Call (スピンロトム) Logic
    const handleFanCallSelect = (index: number) => {
        if (!fanCallState) return
        setFanCallState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 3) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleFanCallConfirm = () => {
        if (!fanCallState) return
        const selectedCards = fanCallState.selectedIndices.map(idx => remaining[idx])
        setHand(prev => [...prev, ...selectedCards])
        const newDeck = remaining.filter((_, i) => !fanCallState.selectedIndices.includes(i)).sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setFanCallState(null)
        alert("手札に加え、山札をシャッフルしました")
    }

    const handleFanCallCancel = () => {
        if (fanCallState) {
            setRemaining(prev => [...prev].sort(() => Math.random() - 0.5))
            alert("山札をシャッフルしました")
        }
        setFanCallState(null)
    }

    // Glass Trumpet (ガラスのラッパ) Logic
    const handleGlassTrumpetEnergySelect = (candidateIndex: number) => {
        if (!glassTrumpetState) return
        setGlassTrumpetState(prev => {
            if (!prev) return null
            const current = [...prev.selectedEnergyIndices]
            const foundIdx = current.indexOf(candidateIndex)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 2) {
                current.push(candidateIndex)
            }
            return { ...prev, selectedEnergyIndices: current }
        })
    }

    const handleGlassTrumpetConfirmEnergy = () => {
        if (!glassTrumpetState) return
        setGlassTrumpetState(prev => prev ? { ...prev, step: 'select_target' } : null)
    }

    const handleGlassTrumpetTargetSelect = (type: 'battle' | 'bench', index: number) => {
        if (!glassTrumpetState || glassTrumpetState.step !== 'select_target') return
        if (glassTrumpetState.selectedEnergyIndices.length === 0) return

        if (type !== 'bench') {
            alert("ベンチのポケモンを選択してください")
            return
        }

        if (glassTrumpetState.targetBenchIndices.includes(index)) {
            alert("すでにこのポケモンにエネルギーを付けました")
            return
        }

        const energyIndexInCandidates = glassTrumpetState.selectedEnergyIndices[0]
        const energyCard = glassTrumpetState.candidates[energyIndexInCandidates]

        // Attach energy
        setBench(prev => {
            const next = [...prev]
            if (next[index]) {
                const stack = next[index]!
                next[index] = {
                    ...stack,
                    cards: [...stack.cards, energyCard],
                    energyCount: stack.energyCount + 1
                }
            }
            return next
        })

        // If this Pokemon is currently being viewed in the detail modal, we might need to update that state too, 
        // but usually the detail modal uses the latest props if passed down. 
        // In this component, renderDetailModal uses selectedDetail state.

        // Remove from trash
        setTrash(prev => {
            const next = [...prev]
            const foundIdx = next.indexOf(energyCard)
            if (foundIdx !== -1) next.splice(foundIdx, 1)
            return next
        })

        setGlassTrumpetState(prev => {
            if (!prev) return null
            const remainingEnergies = prev.selectedEnergyIndices.slice(1)
            const newTargetIndices = [...prev.targetBenchIndices, index]
            if (remainingEnergies.length === 0) return null
            return {
                ...prev,
                selectedEnergyIndices: remainingEnergies,
                targetBenchIndices: newTargetIndices,
                step: 'select_target'
            }
        })

        if (glassTrumpetState.selectedEnergyIndices.length === 1) {
            alert("エネルギーをつけました。効果を終了します。")
        }
    }

    // Tera Orb (テラスタルオーブ) Logic
    const handleTeraOrbSelect = (index: number) => {
        if (!teraOrbState) return
        const card = remaining[index]
        if (!isPokemon(card)) {
            alert("ポケモンを選んでください")
            return
        }
        setHand(prev => [...prev, card])
        const newDeck = remaining.filter((_, i) => i !== index).sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setTeraOrbState(null)
        alert(`${card.name}を手札に加え、山札をシャッフルしました`)
    }

    // Brock's Scout (タケシのスカウト) Logic
    const handleBrocksScoutSelect = (index: number) => {
        if (!brocksScoutState) return
        setBrocksScoutState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 2) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleBrocksScoutConfirm = () => {
        if (!brocksScoutState) return
        const selectedCards = brocksScoutState.selectedIndices.map(idx => remaining[idx])

        // Validation (heuristic)
        const hasEvolution = selectedCards.some(c => c.subtypes?.includes('Evolution') || c.name.includes('VMAX') || c.name.includes('VSTAR'))
        if (hasEvolution && selectedCards.length > 1) {
            alert("進化ポケモンを選ぶ場合は1枚までです")
            return
        }

        setHand(prev => [...prev, ...selectedCards])
        const newDeck = remaining.filter((_, i) => !brocksScoutState.selectedIndices.includes(i)).sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setBrocksScoutState(null)
        alert("手札に加え、山札をシャッフルしました")
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
        receiveEffect: (effect: 'judge' | 'apollo' | 'unfair_stamp' | 'boss_orders', amount?: number) => {
            if (effect === 'boss_orders') {
                return
            }
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
        if (!prize) return
        setHand(prev => [...prev, prize])
        setPrizeCards(prev => prev.filter((_, i) => i !== index))
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

    // Supporter Card Effects
    const useLillie = (playedIndex?: number) => {
        let handToReturn = [...hand]
        if (playedIndex !== undefined) {
            const playedCard = handToReturn[playedIndex]
            if (playedCard) {
                setTrash(prev => [...prev, playedCard])
                handToReturn = handToReturn.filter((_, i) => i !== playedIndex)
            }
        }
        const currentRemaining = remaining
        const newDeck = [...currentRemaining, ...handToReturn].sort(() => Math.random() - 0.5)
        const drawCount = prizeCards.length === 6 ? 8 : 6
        const drawn = newDeck.slice(0, drawCount)

        setHand(drawn)
        setRemaining(newDeck.slice(drawCount))
        alert(`手札を山札に戻してシャッフルし、${drawCount}枚引きました。\n(サイド残数: ${prizeCards.length})`)
    }



    const useTeisatsuShirei = () => {
        if (remaining.length === 0) {
            alert("山札がありません")
            return
        }
        const cards = remaining.slice(0, 2)
        setTeisatsuCards(cards)
        setRemaining(prev => prev.slice(cards.length))
    }

    const handleTeisatsuSelect = (selectedIndex: number) => {
        if (!teisatsuCards) return

        const selected = teisatsuCards[selectedIndex]
        const unselected = teisatsuCards.filter((_, i) => i !== selectedIndex)

        // Add selected to hand
        setHand(prev => [...prev, selected])

        // Add unselected to bottom of deck
        setRemaining(prev => [...prev, ...unselected])

        setTeisatsuCards(null)
        alert(`1枚を手札に加え、残りを山札の下に戻しました`)
    }

    const usePokegear = () => {
        if (remaining.length === 0) {
            alert("山札がありません")
            return
        }
        const count = Math.min(remaining.length, 7)
        const cards = remaining.slice(0, count)
        setPokegearCards(cards)
        setRemaining(prev => prev.slice(count))
    }

    const handlePokegearSelect = (selectedIndex: number) => {
        if (!pokegearCards) return

        const selected = pokegearCards[selectedIndex]
        const unselected = pokegearCards.filter((_, i) => i !== selectedIndex)

        // Add selected to hand
        setHand(prev => [...prev, selected])

        // Add unselected back to deck and shuffle
        setRemaining(prev => [...prev, ...unselected].sort(() => Math.random() - 0.5))

        setPokegearCards(null)
        alert(`1枚を手札に加え、残りを山札に戻してシャッフルしました`)
    }

    const handlePokegearCancel = () => {
        if (!pokegearCards) return
        setRemaining(prev => [...prev, ...pokegearCards].sort(() => Math.random() - 0.5)) // Shuffle back
        setPokegearCards(null)
    }

    // Rocket's Lambda Logic
    const useLambda = (playedIndex?: number) => {
        if (remaining.length === 0) {
            alert("山札がありません")
            return
        }
        if (playedIndex !== undefined) moveToTrash(playedIndex)
        setLambdaState({
            step: 'search',
            candidates: [...remaining],
            selectedIndex: null
        })
    }

    const handleLambdaSelect = (index: number) => {
        setLambdaState(prev => prev ? { ...prev, selectedIndex: index } : null)
    }

    const handleLambdaConfirm = () => {
        if (!lambdaState || lambdaState.selectedIndex === null) return

        const selected = lambdaState.candidates[lambdaState.selectedIndex]

        // Add to hand
        setHand(prev => [...prev, selected])

        // Remove from deck and shuffle
        // We use the index from candidates (which is a snapshot of remaining).
        // Safest is to filter remaining.
        // But since we are inside a closure where 'remaining' might be stale if we relied on it directly without candidates?
        // Actually, candidates IS the array we use for rendering.
        // We just need to reconstruct the deck without that one card.
        const newRemaining = lambdaState.candidates.filter((_, i) => i !== lambdaState.selectedIndex)
        setRemaining(shuffle(newRemaining))

        setLambdaState(null)
        showToast(`ラムダ: ${selected.name}を手札に加えました`)
    }

    // Night Stretcher Logic
    const useNightStretcher = (playedIndex?: number) => {
        if (trash.length === 0) {
            alert("トラッシュがありません")
            return
        }
        // Filter valid targets to check existence
        const hasTarget = trash.some(c => isPokemon(c) || isEnergy(c))
        if (!hasTarget) {
            alert("トラッシュにポケモンまたは基本エネルギーがありません")
            return
        }

        if (playedIndex !== undefined) moveToTrash(playedIndex)

        setNightStretcherState({
            step: 'select',
            candidates: [...trash], // Snapshot of current trash
            selectedIndex: null
        })
    }

    const handleNightStretcherSelect = (index: number) => {
        setNightStretcherState(prev => prev ? { ...prev, selectedIndex: index } : null)
    }

    const handleNightStretcherConfirm = () => {
        if (!nightStretcherState || nightStretcherState.selectedIndex === null) return

        const selectedIndex = nightStretcherState.selectedIndex
        const selected = nightStretcherState.candidates[selectedIndex]

        // Add to hand
        setHand(prev => [...prev, selected])

        // Remove from Trash
        // Removing by index is safe because NightStretcher (if played) is appended to end, preserving indices of previous cards.
        setTrash(prev => prev.filter((_, i) => i !== selectedIndex))

        setNightStretcherState(null)
        showToast(`夜のタンカ: ${selected.name}を手札に加えました`)
    }



    // Tatsugiri (Customer Service) Logic
    const useTatsugiri = () => {
        if (remaining.length === 0) {
            alert("山札がありません")
            return
        }
        // Look at top 6
        const top6 = remaining.slice(0, 6)
        setTatsugiriState({
            step: 'search',
            candidates: top6,
            selectedIndex: null
        })
    }

    const handleTatsugiriSelect = (index: number) => {
        setTatsugiriState(prev => prev ? { ...prev, selectedIndex: index } : null)
    }

    const handleTatsugiriConfirm = () => {
        if (!tatsugiriState || tatsugiriState.selectedIndex === null) {
            // If nothing selected, just shuffle all back? 
            // Text says "Select 1 Supporter... put it into hand. Shuffle the rest back."
            // If no supporter or user chooses none? Usually you can fail to find.
            // If chose none, we just shuffle all 6 back.
            const cardsToReturn = tatsugiriState?.candidates || []
            setRemaining(prev => shuffle([...prev.slice(tatsugiriState!.candidates.length), ...cardsToReturn]))
            setTatsugiriState(null)
            showToast("シャリタツ: 対象なしで終了しました")
            return
        }

        const selected = tatsugiriState.candidates[tatsugiriState.selectedIndex]
        // Add to hand
        setHand(prev => [...prev, selected])

        // Return others to deck and shuffle
        const others = tatsugiriState.candidates.filter((_, i) => i !== tatsugiriState.selectedIndex)
        // remaining currently starts with these 6. So we take remaining.slice(6) and add others, then shuffle.
        // Wait, `remaining` state hasn't changed yet, we just sliced it in `useTatsugiri` for display? 
        // No, `remaining` is state. `useTatsugiri` didn't modify `remaining`.
        // So `candidates` are copies of the top 6.
        // We need to remove the top 6 from `remaining`, add back the 5 unselected, and shuffle.
        // Actually, easiest is: take current remaining, remove the top 6, add back the unselected, shuffle.

        setRemaining(prev => {
            const rest = prev.slice(6)
            return shuffle([...rest, ...others])
        })

        setTatsugiriState(null)
        showToast(`シャリタツ: ${selected.name}を手札に加えました`)
    }

    // Ogerpon Teal Mask ex (Teal Dance) Logic
    const useOgerpon = (source: string, index: number) => {
        // Find Basic Energy in hand
        const energyCards = hand.filter(c => isEnergy(c) && c.name.includes('基本'))
        // Note: Text says "Basic Energy". `isEnergy` checks supertype. `name` check for "基本" (Basic) is rough but standard in this app context? 
        // Or does `uptype` or `subtypes` have 'Basic'? `lib/cardStack.ts` checks supertype.
        // Let's assume `isEnergy` is enough for now, or check for "Basic" in name/subtype if possible. 
        // The user request says "Basic Energy".

        if (energyCards.length === 0) {
            alert("手札に基本エネルギーがありません")
            return
        }

        setOgerponState({
            step: 'select_energy',
            candidates: [...hand], // Show full hand to let user pick
            selectedIndex: null,
            targetSource: source,
            targetIndex: index
        })
    }

    const handleOgerponSelect = (index: number) => {
        setOgerponState(prev => prev ? { ...prev, selectedIndex: index } : null)
    }

    const handleOgerponConfirm = () => {
        if (!ogerponState || ogerponState.selectedIndex === null) return

        const selectedIndex = ogerponState.selectedIndex
        const selected = ogerponState.candidates[selectedIndex]

        if (!isEnergy(selected)) {
            alert("エネルギーを選んでください") // Should generally be prevented by UI filtering but safe to check
            return
        }

        // 1. Attach to Ogerpon
        const { targetSource, targetIndex } = ogerponState

        // Remove from hand
        const newHand = hand.filter((_, i) => i !== selectedIndex)
        setHand(newHand)

        // Attach
        if (targetSource === 'battle') {
            if (battleField) {
                playToBattleField(selectedIndex) // Wait, `playToBattleField` expects index in HAND. 
                // But we modified hand! `playToBattleField` uses `hand[index]`.
                // We need to manually update the stack.
                // Actually `playToBattleField` does: `const card = hand[index]; ... setBattleField(...) ... setHand(...)`.
                // So we can't reuse it easily if we already manipulated hand or inside this logic.
                // Better to implement attach logic here manually.

                setBattleField(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        cards: [...prev.cards, selected],
                        energyCount: prev.energyCount + 1
                    }
                })
            }
        } else if (targetSource === 'bench') {
            setBench(prev => {
                const newBench = [...prev]
                const stack = newBench[targetIndex]
                if (stack) {
                    newBench[targetIndex] = {
                        ...stack,
                        cards: [...stack.cards, selected],
                        energyCount: stack.energyCount + 1
                    }
                }
                return newBench
            })
        }

        // 2. Draw 1 card
        if (remaining.length > 0) {
            const draw = remaining[0]
            setHand(prev => [...prev, draw]) // Append to potentially modified hand? 
            // We setHand(newHand) above, but `setHand(prev => ...)` queues updates. 
            // `prev` in second setHand will be `newHand`. Correct.
            setRemaining(prev => prev.slice(1))
            showToast("みどりのまい: エネ加速して1枚引きました")
        } else {
            showToast("みどりのまい: エネ加速しましたが、山札がないため引けませんでした")
        }

        setOgerponState(null)
    }

    // Zoroark ex (Trade) Logic
    const useZoroark = () => {
        if (hand.length === 0) {
            alert("手札がありません") // Trade requires discarding 1 card
            return
        }
        if (remaining.length === 0) {
            alert("山札がありません") // Can't draw 2
            return
        }

        setZoroarkState({
            step: 'discard',
            candidates: [...hand],
            selectedIndex: null
        })
    }

    const handleZoroarkSelect = (index: number) => {
        setZoroarkState(prev => prev ? { ...prev, selectedIndex: index } : null)
    }

    const handleZoroarkConfirm = () => {
        if (!zoroarkState || zoroarkState.selectedIndex === null) return

        const selectedIndex = zoroarkState.selectedIndex
        const selected = zoroarkState.candidates[selectedIndex]

        // 1. Discard
        setHand(prev => prev.filter((_, i) => i !== selectedIndex))
        setTrash(prev => [...prev, selected])

        // 2. Draw 2
        const drawCount = Math.min(2, remaining.length)
        if (drawCount > 0) {
            const drew = remaining.slice(0, drawCount)
            setRemaining(prev => prev.slice(drawCount))
            setHand(prev => [...prev, ...drew])
            showToast(`とりひき: 1枚トラッシュして${drawCount}枚引きました`)
        }

        setZoroarkState(null)
    }

    // Fezandipiti ex (Flip the Script) Logic
    const useFezandipiti = () => {
        // Draw 3 cards
        // Condition: "If your pokemon was KO'd last turn".
        // As defined in plan, we skip strict check for now or let user manage it.
        // We just draw 3.

        if (remaining.length === 0) {
            alert("山札がありません")
            return
        }

        const drawCount = Math.min(3, remaining.length)
        const drew = remaining.slice(0, drawCount)
        setRemaining(prev => prev.slice(drawCount))
        setHand(prev => [...prev, ...drew])
        showToast(`さかてにとる: ${drawCount}枚引きました`)
    }

    // --- Dudunsparce (Run Away Draw) Logic ---
    const useDudunsparce = (source: 'battle' | 'bench', index: number) => {
        const stack = source === 'battle' ? battleField : bench[index]
        if (!stack) return

        // 1. Draw 3
        const drawCount = Math.min(3, remaining.length)
        const drawn = remaining.slice(0, drawCount)
        setHand(prev => [...prev, ...drawn])
        setRemaining(prev => prev.slice(drawCount))

        // 2. Return stack to deck and shuffle
        const stackCards = stack.cards
        setRemaining(prev => shuffle([...prev, ...stackCards]))

        // 3. Remove from field
        if (source === 'battle') {
            setBattleField(null)
        } else {
            setBench(prev => {
                const next = [...prev]
                next[index] = null
                return next
            })
        }

        showToast(`にげあしドロー: ${drawCount}枚引き、山札に戻しました`)
    }

    // --- Meowth ex (Trump Card Catch) Logic ---
    const useMeowthEX = (handIndex: number) => {
        if (okunoteUsedThisTurn) {
            alert("この番、すでに名前に「おくのて」とつく特性を使っています")
            return
        }

        const card = hand[handIndex]
        if (!card) return

        // Search for empty bench slot
        const emptySlotIndex = bench.findIndex((slot, i) => i < benchSize && slot === null)
        if (emptySlotIndex === -1) {
            alert("ベンチがいっぱいです")
            return
        }

        // 1. Move to bench
        setBench(prev => {
            const next = [...prev]
            next[emptySlotIndex] = createStack(card)
            return next
        })
        setHand(prev => prev.filter((_, i) => i !== handIndex))

        // 2. Search deck for Supporter
        if (remaining.length === 0) {
            alert("山札がありません")
            return
        }

        setMeowthEXState({
            step: 'search',
            candidates: [...remaining],
            selectedIndex: null
        })
        setOkunoteUsedThisTurn(true)
    }

    const handleMeowthEXSelect = (index: number) => {
        const card = meowthEXState?.candidates[index]
        if (card && !isSupporter(card)) {
            alert("サポートカードを選択してください")
            return
        }
        setMeowthEXState(prev => prev ? { ...prev, selectedIndex: index } : null)
    }

    const handleMeowthEXConfirm = () => {
        if (!meowthEXState) return

        if (meowthEXState.selectedIndex !== null) {
            const selected = meowthEXState.candidates[meowthEXState.selectedIndex]
            setHand(prev => [...prev, selected])

            // Remove from remaining
            let removed = false
            setRemaining(prev => prev.filter(c => {
                if (!removed && c === selected) {
                    removed = true
                    return false
                }
                return true
            }))
        }

        shuffleDeck()
        setMeowthEXState(null)
    }

    // --- Iron Leaves ex (Rapid Vernier) Logic ---
    const useIronLeavesEX = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return

        // Search for empty bench slot
        const emptySlotIndex = bench.findIndex((slot, i) => i < benchSize && slot === null)
        if (emptySlotIndex === -1) {
            alert("ベンチがいっぱいです")
            return
        }

        // 1. Move to bench
        const leavesStack = createStack(card)
        setBench(prev => {
            const next = [...prev]
            next[emptySlotIndex] = leavesStack
            return next
        })
        setHand(prev => prev.filter((_, i) => i !== handIndex))

        // 2. Ask to swap with Battle
        if (confirm("バトル場と入れ替えますか？")) {
            const currentBattle = battleField
            setBattleField(leavesStack)
            setBench(prev => {
                const next = [...prev]
                next[emptySlotIndex] = currentBattle
                return next
            })

            // 3. Move Energy Interface
            setIronLeavesEXState({
                active: true,
                targetType: 'battle',
                targetIndex: 0
            })
        }
    }

    const handleIronLeavesEXClickPokemon = (type: 'battle' | 'bench', index: number) => {
        if (!ironLeavesEXState || !ironLeavesEXState.active) return

        const stack = type === 'battle' ? battleField : bench[index]
        if (!stack) return

        // If clicking Iron Leaves himself, do nothing
        if (type === 'battle' && ironLeavesEXState.targetType === 'battle') return

        // Try to find one energy in the stack and move it
        let energyIndex = -1
        for (let i = stack.cards.length - 1; i >= 0; i--) {
            if (isEnergy(stack.cards[i])) {
                energyIndex = i
                break
            }
        }

        if (energyIndex === -1) {
            alert("エネルギーが付いていません")
            return
        }

        const energyCard = stack.cards[energyIndex]

        // Remove from source
        if (type === 'battle') {
            setBattleField(prev => {
                if (!prev) return null
                const newCards = prev.cards.filter((_, i) => i !== energyIndex)
                return { ...prev, cards: newCards, energyCount: prev.energyCount - 1 }
            })
        } else {
            setBench(prev => {
                const next = [...prev]
                const bStack = next[index]
                if (bStack) {
                    const newCards = bStack.cards.filter((_, i) => i !== energyIndex)
                    next[index] = { ...bStack, cards: newCards, energyCount: bStack.energyCount - 1 }
                }
                return next
            })
        }

        // Add to Iron Leaves
        setBattleField(prev => {
            if (!prev) return null
            return { ...prev, cards: [...prev.cards, energyCard], energyCount: prev.energyCount + 1 }
        })

        showToast(`${energyCard.name}を付け替えました`)
    }

    // --- Nのポイントアップ Logic ---
    const useNPointUp = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return

        const energyInTrash = trash.filter(isEnergy)
        if (energyInTrash.length === 0) {
            alert("トラッシュに基本エネルギーがありません")
            return
        }

        // 1. Move card to trash
        setHand(prev => prev.filter((_, i) => i !== handIndex))
        setTrash(prev => [...prev, card])

        setNPointUpState({
            step: 'select_energy',
            candidates: [...trash],
            selectedIndex: null
        })
    }

    const handleNPointUpSelectEnergy = (index: number) => {
        const card = trash[index]
        if (!isEnergy(card)) {
            alert("基本エネルギーを選択してください")
            return
        }
        setNPointUpState(prev => prev ? { ...prev, selectedIndex: index } : null)
    }

    const handleNPointUpConfirmEnergy = () => {
        if (!nPointUpState || nPointUpState.selectedIndex === null) return
        setNPointUpState({ ...nPointUpState, step: 'select_target' })
    }

    const handleNPointUpClickPokemon = (type: 'battle' | 'bench', index: number) => {
        if (!nPointUpState || nPointUpState.step !== 'select_target' || nPointUpState.selectedIndex === null) return
        if (type !== 'bench') {
            alert("ベンチのポケモンを選択してください")
            return
        }

        const energyCard = trash[nPointUpState.selectedIndex]
        const targetStack = bench[index]
        if (!targetStack) return

        // 1. Remove from trash
        setTrash(prev => prev.filter((_, i) => i !== nPointUpState.selectedIndex))

        // 2. Attach to bench
        setBench(prev => {
            const next = [...prev]
            const stack = next[index]
            if (stack) {
                next[index] = {
                    ...stack,
                    cards: [...stack.cards, energyCard],
                    energyCount: stack.energyCount + 1
                }
            }
            return next
        })

        showToast(`${energyCard.name}をベンチのポケモンに付けました`)
        setNPointUpState(null)
    }

    // --- シアノ (Cyano) Logic ---
    const useCyano = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return

        setHand(prev => prev.filter((_, i) => i !== handIndex))
        setTrash(prev => [...prev, card])

        setCyanoState({
            step: 'search',
            candidates: [...remaining],
            selectedIndices: []
        })
    }

    const handleCyanoSelect = (index: number) => {
        if (!cyanoState) return
        const card = remaining[index]
        if (!card.name.includes('ex')) {
            alert("「ポケモンex」を選択してください")
            return
        }

        setCyanoState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 3) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleCyanoConfirm = () => {
        if (!cyanoState) return
        const selectedCards = cyanoState.selectedIndices.map(idx => remaining[idx])
        setHand(prev => [...prev, ...selectedCards])

        const newDeck = remaining.filter((_, i) => !cyanoState.selectedIndices.includes(i)).sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setCyanoState(null)
        showToast(`シアノ: ${selectedCards.length}枚を手札に加え、山札をシャッフルしました`)
    }

    // --- オーガポン いどのめんex (Ogerpon Wellspring Mask ex) Logic ---
    const useOgerponWellspring = (source: 'battle' | 'bench', index: number) => {
        if (source !== 'battle') {
            alert("バトル場にいる時のみ使用可能です")
            return
        }

        const stack = battleField
        if (!stack) return

        const cost = stack.cards.some(c => c.name.includes('きらめく結晶')) ? 2 : 3

        if (confirm(`ワザ『げきりゅうポンプ』を使いますか？\n(100ダメージ、のぞむならエネを${cost}個山札に戻してベンチに120ダメージ)`)) {
            showToast("げきりゅうポンプ: バトル場に100ダメージ")

            if (stack.energyCount >= cost) {
                if (confirm(`エネルギーを${cost}個山札に戻して、ベンチに120ダメージ与えますか？`)) {
                    setOgerponWellspringState({
                        active: true,
                        step: 'select_cost',
                        selectedIndices: []
                    })
                }
            } else {
                alert(`エネルギーが${cost}個以上付いていないため、追加効果は使えません`)
            }
        }
    }

    const handleOgerponWellspringSelectCost = (cardIndex: number) => {
        if (!ogerponWellspringState || !battleField) return
        const card = battleField.cards[cardIndex]
        if (!isEnergy(card)) {
            alert("エネルギーカードを選択してください")
            return
        }

        const cost = battleField.cards.some(c => c.name.includes('きらめく結晶')) ? 2 : 3

        setOgerponWellspringState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(cardIndex)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < cost) {
                current.push(cardIndex)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleOgerponWellspringConfirmCost = () => {
        if (!ogerponWellspringState || !battleField) return
        const cost = battleField.cards.some(c => c.name.includes('きらめく結晶')) ? 2 : 3

        if (ogerponWellspringState.selectedIndices.length !== cost) {
            alert(`エネルギーを${cost}個選択してください`)
            return
        }

        const selectedCards = ogerponWellspringState.selectedIndices.map(idx => battleField.cards[idx])

        // 1. Remove from Battle Field
        setBattleField(prev => {
            if (!prev) return null
            const newCards = prev.cards.filter((_, i) => !ogerponWellspringState.selectedIndices.includes(i))
            return { ...prev, cards: newCards, energyCount: prev.energyCount - cost }
        })

        // 2. Return to Deck and Shuffle
        setRemaining(prev => shuffle([...prev, ...selectedCards]))

        showToast(`げきりゅうポンプ: エネ${cost}個を山札に戻し、ベンチに120ダメージ！`)
        setOgerponWellspringState(null)
    }

    // --- むしとりセット (Bug Catching Set) Logic ---
    const useBugCatchingSet = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return

        // 1. Move card to trash
        setHand(prev => prev.filter((_, i) => i !== handIndex))
        setTrash(prev => [...prev, card])

        const top7 = remaining.slice(0, 7)
        setBugCatchingSetState({
            step: 'search',
            candidates: top7,
            selectedIndices: []
        })
    }

    const handleBugCatchingSetSelect = (index: number) => {
        if (!bugCatchingSetState) return
        const card = bugCatchingSetState.candidates[index]
        const isGrassPokemon = isPokemon(card) && card.types?.includes('Grass')
        const isBasicGrassEnergy = isEnergy(card) && card.name.includes('基本草エネルギー')

        if (!isGrassPokemon && !isBasicGrassEnergy) {
            alert("草ポケモンまたは基本草エネルギーを選択してください")
            return
        }

        setBugCatchingSetState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 2) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleBugCatchingSetConfirm = () => {
        if (!bugCatchingSetState) return
        const selectedCards = bugCatchingSetState.selectedIndices.map(idx => bugCatchingSetState.candidates[idx])
        const remainingTop7 = bugCatchingSetState.candidates.filter((_, i) => !bugCatchingSetState.selectedIndices.includes(i))

        // 1. Add to hand
        setHand(prev => [...prev, ...selectedCards])

        // 2. Return rest to deck and shuffle
        setRemaining(prev => shuffle([...prev.slice(7), ...remainingTop7]))

        showToast(`${selectedCards.length}枚を手札に加えました`)
        setBugCatchingSetState(null)
    }

    // --- エネルギーつけかえ (Energy Switch) Logic ---
    const useEnergySwitch = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return

        // 1. Move card to trash
        setHand(prev => prev.filter((_, i) => i !== handIndex))
        setTrash(prev => [...prev, card])

        setEnergySwitchState({
            step: 'select_source_pokemon',
            sourceType: null,
            sourceIndex: null,
            energyIndex: null,
            targetType: null,
            targetIndex: null
        })
    }

    const handleEnergySwitchClickPokemon = (type: 'battle' | 'bench', index: number) => {
        if (!energySwitchState) return

        if (energySwitchState.step === 'select_source_pokemon') {
            const stack = type === 'battle' ? battleField : bench[index]
            if (!stack || stack.energyCount === 0) {
                alert("エネルギーが付いているポケモンを選択してください")
                return
            }
            setEnergySwitchState(prev => prev ? { ...prev, step: 'select_energy', sourceType: type, sourceIndex: index } : null)
        } else if (energySwitchState.step === 'select_target_pokemon') {
            if (type === energySwitchState.sourceType && index === energySwitchState.sourceIndex) {
                alert("別のポケモンを選択してください")
                return
            }
            const targetStack = type === 'battle' ? battleField : bench[index]
            if (!targetStack) return

            // Perform Switch
            const sourceStack = energySwitchState.sourceType === 'battle' ? battleField : bench[energySwitchState.sourceIndex!]
            if (!sourceStack) return

            const energyCard = sourceStack.cards[energySwitchState.energyIndex!]
            const isBasic = !energyCard.subtypes?.includes('Special') // Simplistic check for basic

            // Update source
            const updatedSourceCards = sourceStack.cards.filter((_, i) => i !== energySwitchState.energyIndex)
            const updatedSourceStack = {
                ...sourceStack,
                cards: updatedSourceCards,
                energyCount: sourceStack.energyCount - 1
            }

            // Update target
            const updatedTargetStack = {
                ...targetStack,
                cards: [...targetStack.cards, energyCard],
                energyCount: targetStack.energyCount + 1
            }

            // Apply state
            if (energySwitchState.sourceType === 'battle') {
                setBattleField(updatedSourceStack.cards.length === 0 ? null : updatedSourceStack)
                if (type === 'battle') {
                    // This case should be caught by "Select different pokemon" check, but for safety:
                    setBattleField(updatedTargetStack)
                } else {
                    setBench(prev => {
                        const next = [...prev]
                        next[index] = updatedTargetStack
                        return next
                    })
                }
            } else {
                // Source is Bench
                if (type === 'battle') {
                    setBattleField(updatedTargetStack)
                    setBench(prev => {
                        const next = [...prev]
                        next[energySwitchState.sourceIndex!] = updatedSourceStack.cards.length === 0 ? null : updatedSourceStack
                        return next
                    })
                } else {
                    // Both are Bench
                    setBench(prev => {
                        const next = [...prev]
                        next[energySwitchState.sourceIndex!] = updatedSourceStack.cards.length === 0 ? null : updatedSourceStack
                        next[index] = updatedTargetStack
                        return next
                    })
                }
            }

            showToast("エネルギーをつけ替えました")
            setEnergySwitchState(null)
        }
    }

    const handleEnergySwitchSelectEnergy = (energyIndex: number) => {
        if (!energySwitchState || energySwitchState.step !== 'select_energy') return
        setEnergySwitchState(prev => prev ? { ...prev, step: 'select_target_pokemon', energyIndex } : null)
    }

    // --- エネルギー回収 (Energy Retrieval) Logic ---
    const useEnergyRetrieval = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return

        const basicEnergies = trash.filter(card => isEnergy(card) && !card.subtypes?.includes('Special'))
        if (basicEnergies.length === 0) {
            alert("トラッシュに基本エネルギーがありません")
            return
        }

        // 1. Move card to trash
        setHand(prev => prev.filter((_, i) => i !== handIndex))
        setTrash(prev => [...prev, card])

        setEnergyRetrievalState({
            step: 'select',
            candidates: [...trash],
            selectedIndices: []
        })
    }

    const handleEnergyRetrievalSelect = (index: number) => {
        if (!energyRetrievalState) return
        const card = trash[index]
        if (!isEnergy(card) || card.subtypes?.includes('Special')) {
            alert("基本エネルギーを選択してください")
            return
        }

        setEnergyRetrievalState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 2) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleEnergyRetrievalConfirm = () => {
        if (!energyRetrievalState) return
        const selectedCards = energyRetrievalState.selectedIndices.map(idx => trash[idx])

        // 1. Add to hand
        setHand(prev => [...prev, ...selectedCards])

        // 2. Remove from trash
        setTrash(prev => prev.filter((_, i) => !energyRetrievalState.selectedIndices.includes(i)))

        showToast(`${selectedCards.length}枚を手札に加えました`)
        setEnergyRetrievalState(null)
    }

    const useNoctowl = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return

        // 1. In practice mode, we assume evolution happens via drag-drop or just use the menu
        // If used from menu on Noctowl in hand (to evolve), we move it to trash after search? 
        // Actually, searching is the main part.
        setHand(prev => prev.filter((_, i) => i !== handIndex))
        setTrash(prev => [...prev, card])

        setNoctowlState({
            step: 'search',
            candidates: [...remaining],
            selectedIndices: []
        })
    }

    const handleNoctowlSelect = (index: number) => {
        if (!noctowlState) return
        const card = remaining[index]
        if (!isTrainer(card)) {
            alert("トレーナーズを選択してください")
            return
        }

        setNoctowlState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 2) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleNoctowlConfirm = () => {
        if (!noctowlState) return
        const selectedCards = noctowlState.selectedIndices.map(idx => remaining[idx])

        // 1. Add to hand
        setHand(prev => [...prev, ...selectedCards])

        // 2. Remove from deck and shuffle
        setRemaining(prev => shuffle(prev.filter((_, i) => !noctowlState.selectedIndices.includes(i))))

        showToast(`${selectedCards.length}枚を手札に加えました`)
        setNoctowlState(null)
    }

    // --- メガルカリオex (Mega Lucario ex) Logic ---
    const useMegaLucarioEX = (source: 'battle' | 'bench', index: number) => {
        const stack = source === 'battle' ? battleField : bench[index]
        if (!stack) return

        const fightingEnergies = trash.filter(c => isEnergy(c) && c.name.includes('基本闘エネルギー'))
        if (fightingEnergies.length === 0) {
            alert("トラッシュに基本闘エネルギーがありません")
            return
        }

        setMegaLucarioEXAttackState({
            step: 'select_energy',
            candidates: [...trash],
            selectedIndices: [],
            attachingIndex: 0
        })
    }

    const handleMegaLucarioEXSelectEnergy = (index: number) => {
        if (!megaLucarioEXAttackState) return
        const card = trash[index]
        if (!isEnergy(card) || !card.name.includes('基本闘エネルギー')) {
            alert("基本闘エネルギーを選択してください")
            return
        }

        setMegaLucarioEXAttackState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 3) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleMegaLucarioEXConfirmEnergy = () => {
        if (!megaLucarioEXAttackState || megaLucarioEXAttackState.selectedIndices.length === 0) return
        setMegaLucarioEXAttackState(prev => prev ? { ...prev, step: 'attach_energy', attachingIndex: 0 } : null)
    }

    const handleMegaLucarioEXAttachClick = (type: 'battle' | 'bench', index: number) => {
        if (!megaLucarioEXAttackState || megaLucarioEXAttackState.step !== 'attach_energy') return
        if (type !== 'bench') {
            alert("ベンチのポケモンを選択してください")
            return
        }

        const energyCardIndex = megaLucarioEXAttackState.selectedIndices[megaLucarioEXAttackState.attachingIndex]
        const energyCard = trash[energyCardIndex]
        const targetStack = bench[index]
        if (!targetStack) return

        // Update target
        setBench(prev => {
            const next = [...prev]
            const stack = next[index]
            if (stack) {
                next[index] = {
                    ...stack,
                    cards: [...stack.cards, energyCard],
                    energyCount: stack.energyCount + 1
                }
            }
            return next
        })

        // Remove from trash (Need to be careful with indices if removing multiple)
        // Better to remove at the end or use ID/ref. 
        // For now let's just mark it done in state.

        if (megaLucarioEXAttackState.attachingIndex + 1 < megaLucarioEXAttackState.selectedIndices.length) {
            setMegaLucarioEXAttackState(prev => prev ? { ...prev, attachingIndex: prev.attachingIndex + 1 } : null)
        } else {
            // Finalize: remove all used cards from trash
            setTrash(prev => prev.filter((_, i) => !megaLucarioEXAttackState.selectedIndices.includes(i)))
            showToast("エネルギーをベンチポケモンに付けました")
            setMegaLucarioEXAttackState(null)
        }
    }

    // --- プレシャスキャリー Logic ---
    const usePreciousCarrier = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return
        setHand(prev => prev.filter((_, i) => i !== handIndex))
        setTrash(prev => [...prev, card])
        setPreciousCarrierState({
            step: 'search',
            candidates: [...remaining],
            selectedIndices: []
        })
    }

    const handlePreciousCarrierSelect = (index: number) => {
        if (!preciousCarrierState) return
        const card = remaining[index]
        if (!isPokemon(card) || card.subtypes?.includes('Evolution')) {
            alert("たねポケモンを選択してください")
            return
        }
        setPreciousCarrierState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else {
                // Limit to empty bench slots
                const emptySlots = bench.filter(s => s === null).length
                if (current.length < emptySlots) {
                    current.push(index)
                } else {
                    alert("ベンチがいっぱいです")
                }
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handlePreciousCarrierConfirm = () => {
        if (!preciousCarrierState) return
        const selectedCards = preciousCarrierState.selectedIndices.map(idx => remaining[idx])

        // Add to bench
        setBench(prev => {
            const next = [...prev]
            let sIdx = 0
            for (let i = 0; i < next.length && sIdx < selectedCards.length; i++) {
                if (next[i] === null) {
                    next[i] = createStack(selectedCards[sIdx])
                    sIdx++
                }
            }
            return next
        })

        // Remove from deck and shuffle
        setRemaining(prev => shuffle(prev.filter((_, i) => !preciousCarrierState.selectedIndices.includes(i))))
        showToast(`${selectedCards.length}枚をベンチに出しました`)
        setPreciousCarrierState(null)
    }

    // --- プライムキャッチャー Logic ---
    const usePrimeCatcher = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return
        setHand(prev => prev.filter((_, i) => i !== handIndex))
        setTrash(prev => [...prev, card])
        setPrimeCatcherState({ step: 'select_opponent', opponentIndex: null })
        showToast("あいてのベンチポケモンを選択してください")
    }

    const handlePrimeCatcherOpponentClick = (index: number) => {
        if (!primeCatcherState || primeCatcherState.step !== 'select_opponent') return
        // In practice mode, we just record the choice and move to own switch.
        setPrimeCatcherState(null)
        setSwapMode({ active: true, sourceType: 'battle', sourceIndex: 0 })
        showToast("入れ替える自分のポケモンを選択してください")
    }

    // --- ポケモンいれかえ Logic ---
    const usePokemonSwitch = (handIndex: number) => {
        const card = hand[handIndex]
        if (!card) return
        setHand(prev => prev.filter((_, i) => i !== handIndex))
        setTrash(prev => [...prev, card])
        setSwapMode({ active: true, sourceType: 'battle', sourceIndex: 0 })
        showToast("入れ替える自分のポケモンを選択してください")
    }

    // --- モモワロウex Logic ---
    const usePecharuntChainOfCommand = (pecharuntIndex: number, pecharuntSource: 'battle' | 'bench') => {
        if (pecharuntUsedThisTurn) {
            alert("この番、すでに「しはいのくさり」を使っています")
            return
        }
        setPecharuntState({ step: 'select_target' })
        showToast("入れ替えるベンチの悪ポケモンを選択してください")
    }

    const handlePecharuntSelectTarget = (index: number) => {
        if (!pecharuntState) return
        const targetStack = bench[index]
        if (!targetStack) return

        // Check if it's Darkness type and not Pecharunt ex
        const topCard = getTopCard(targetStack)
        if (!topCard.types?.includes('Darkness')) {
            alert("悪ポケモンを選択してください")
            return
        }
        if (topCard.name.includes('モモワロウex')) {
            alert("モモワロウex以外の悪ポケモンを選択してください")
            return
        }

        // Perform Swap
        const currentBattle = battleField
        setBattleField(targetStack)
        setBench(prev => {
            const next = [...prev]
            next[index] = currentBattle
            return next
        })

        showToast(`${topCard.name}をバトル場に出し、どく状態にしました`)
        setPecharuntUsedThisTurn(true)
        setPecharuntState(null)
    }

    // --- ブースターex Logic ---
    const useFlareonBurningCharge = (source: 'battle' | 'bench', index: number) => {
        setFlareonState({
            step: 'search',
            candidates: [...remaining],
            selectedIndices: [],
            attachingIndex: 0
        })
    }

    const handleFlareonSelectEnergy = (index: number) => {
        if (!flareonState) return
        const card = remaining[index]
        if (!isEnergy(card)) {
            alert("エネルギーを選択してください")
            return
        }
        setFlareonState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 2) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handleFlareonConfirmEnergy = () => {
        if (!flareonState || flareonState.selectedIndices.length === 0) return
        setFlareonState(prev => prev ? { ...prev, step: 'attach' } : null)
        showToast("エネルギーを付けるポケモンを選択してください")
    }

    const handleFlareonAttachClick = (type: 'battle' | 'bench', index: number) => {
        if (!flareonState || flareonState.step !== 'attach') return
        const energyCardIndex = flareonState.selectedIndices[flareonState.attachingIndex]
        const energyCard = remaining[energyCardIndex]

        const applyToStack = (stack: CardStack | null) => {
            if (!stack) return null
            return {
                ...stack,
                cards: [...stack.cards, energyCard],
                energyCount: (stack.energyCount || 0) + 1
            }
        }

        if (type === 'battle') {
            setBattleField(prev => applyToStack(prev))
        } else {
            setBench(prev => {
                const next = [...prev]
                next[index] = applyToStack(next[index])
                return next
            })
        }

        if (flareonState.attachingIndex + 1 < flareonState.selectedIndices.length) {
            setFlareonState(prev => prev ? { ...prev, attachingIndex: prev.attachingIndex + 1 } : null)
        } else {
            // Remove used energies from deck and shuffle
            setRemaining(prev => shuffle(prev.filter((_, i) => !flareonState.selectedIndices.includes(i))))
            showToast("エネルギーを付けました")
            setFlareonState(null)
        }
    }

    const useHadozuki = () => {
        // 1. Apply 130 damage to opponent's active
        // (Automatic damage logic removed as per user request)

        // Manual damage application via existing updateDamage if we had a direct ref,
        // but here we trigger an effect that PracticePage should handle.
        if (onEffectTrigger) {
            (onEffectTrigger as any)('apply_damage', 130)
        }

        // 2. Start Energy Acceleration step
        const energyInTrash = trash.filter(c => c.name === '基本闘エネルギー')
        if (energyInTrash.length > 0) {
            setMegaLucarioEXAttackState({
                step: 'select_energy',
                candidates: energyInTrash,
                selectedIndices: [],
                attachingIndex: 0
            })
        } else {
            showToast('トラッシュに基本闘エネルギーがありません')
        }
        closeMenu()
    }

    const useMegaBrave = () => {
        if (megaBraveUsedLastTurn) {
            alert('前の番にメガブレイブを使っているため、このワザは使えません。')
            return
        }

        if (onEffectTrigger) {
            // onEffectTrigger('apply_damage', 270) // Removed
        }
        setMegaBraveUsedLastTurn(true)
        closeMenu()
    }

    const handleMegaLucarioEnergySelect = (index: number) => {
        if (!megaLucarioEXAttackState) return
        const newSelected = [...megaLucarioEXAttackState.selectedIndices]
        if (newSelected.includes(index)) {
            newSelected.splice(newSelected.indexOf(index), 1)
        } else if (newSelected.length < 3) {
            newSelected.push(index)
        }
        setMegaLucarioEXAttackState({ ...megaLucarioEXAttackState, selectedIndices: newSelected })
    }

    const startMegaLucarioEnergyAttachment = () => {
        if (!megaLucarioEXAttackState || megaLucarioEXAttackState.selectedIndices.length === 0) return
        setMegaLucarioEXAttackState({ ...megaLucarioEXAttackState, step: 'attach_energy', attachingIndex: 0 })
    }

    const applyMegaLucarioEnergy = (type: 'battle' | 'bench', index: number) => {
        if (!megaLucarioEXAttackState || megaLucarioEXAttackState.step !== 'attach_energy') return

        const energyCard = megaLucarioEXAttackState.candidates[megaLucarioEXAttackState.selectedIndices[megaLucarioEXAttackState.attachingIndex]]

        if (type === 'battle' && battleField) {
            setBattleField({
                ...battleField,
                cards: [...battleField.cards, energyCard],
                energyCount: battleField.energyCount + 1
            })
        } else if (type === 'bench') {
            setBench(prev => {
                const next = [...prev]
                const stack = next[index]
                if (stack) {
                    next[index] = {
                        ...stack,
                        cards: [...stack.cards, energyCard],
                        energyCount: stack.energyCount + 1
                    }
                }
                return next
            })
        }

        // Remove from trash
        setTrash(prev => {
            const next = [...prev]
            // Need to find the exact card in the original trash. 
            // This is complex because of duplicates. 
            // For now, let's just filter one instance.
            const idxInTrash = next.findIndex(c => c === energyCard)
            if (idxInTrash !== -1) next.splice(idxInTrash, 1)
            return next
        })

        if (megaLucarioEXAttackState.attachingIndex + 1 < megaLucarioEXAttackState.selectedIndices.length) {
            setMegaLucarioEXAttackState({
                ...megaLucarioEXAttackState,
                attachingIndex: megaLucarioEXAttackState.attachingIndex + 1
            })
        } else {
            setMegaLucarioEXAttackState(null)
            showToast('エネルギーをつけました')
        }
    }


    const resetMegaBrave = () => {
        setMegaBraveUsedLastTurn(false)
        showToast('メガブレイブの使用制限を解除しました')
    }

    // --- マシマシラ Logic ---
    const useMunkidoriAdrenalBrain = (munkidoriIndex: number, munkidoriSource: 'battle' | 'bench') => {
        if (munkidoriUsedThisTurn) {
            alert("この番、すでに「アドレナブレイン」を使っています")
            return
        }
        const munkidoriStack = munkidoriSource === 'battle' ? battleField : bench[munkidoriIndex]
        if (!munkidoriStack || (munkidoriStack.energyCount || 0) === 0) {
            alert("エネルギーが付いていないため使えません")
            return
        }
        setMunkidoriState({ step: 'select_source', sourceType: null, sourceIndex: null, count: 0 })
        showToast("ダメカンを動かす自分のポケモンを選択してください")
    }

    const handleMunkidoriSourceClick = (type: 'battle' | 'bench', index: number) => {
        if (!munkidoriState || munkidoriState.step !== 'select_source') return
        const stack = type === 'battle' ? battleField : bench[index]
        if (!stack || (stack.damage || 0) === 0) {
            alert("ダメカンが乗っているポケモンを選択してください")
            return
        }
        setMunkidoriState({ ...munkidoriState, step: 'select_count', sourceType: type, sourceIndex: index })
    }

    const handleMunkidoriConfirmCount = (count: number) => {
        if (!munkidoriState) return
        setMunkidoriState({ ...munkidoriState, step: 'select_target', count })
        showToast("のせ替える相手のポケモンを選択してください")
    }

    const handleMunkidoriTargetClick = (type: 'battle' | 'bench', index: number) => {
        if (!munkidoriState || munkidoriState.step !== 'select_target') return
        // Update source damage
        const updateDamageVal = (prev: CardStack | null, delta: number) => {
            if (!prev) return null
            return { ...prev, damage: Math.max(0, (prev.damage || 0) + delta) }
        }

        if (munkidoriState.sourceType === 'battle') {
            setBattleField(prev => updateDamageVal(prev, -munkidoriState.count * 10))
        } else {
            setBench(prev => {
                const next = [...prev]
                const bIdx = munkidoriState.sourceIndex!
                next[bIdx] = updateDamageVal(next[bIdx], -munkidoriState.count * 10)
                return next
            })
        }

        showToast(`ダメカンを${munkidoriState.count}個のせ替えました`)
        setMunkidoriUsedThisTurn(true)
        setMunkidoriState(null)
    }

    // --- ルナトーン (Lunatone) Logic ---
    const useLunatone = (source: 'battle' | 'bench', index: number) => {
        if (lunacycleUsedThisTurn) {
            alert("「ルナサイクル」は既にこの番に使われています")
            return
        }

        const fightingEnergyInHand = hand.findIndex(c => isEnergy(c) && c.name.includes('基本闘エネルギー'))
        if (fightingEnergyInHand === -1) {
            alert("手札に基本闘エネルギーがありません")
            return
        }

        // Show a mode or just auto-select first one? 
        // For precision, let's ask to select from hand or show a small modal.
        // For simplicity here, let's just trigger a discard prompt.
        if (confirm("手札の基本闘エネルギーを1枚トラッシュして、山札を3枚引きますか？")) {
            setHand(prev => {
                const next = [...prev]
                const energyIdx = next.findIndex(c => isEnergy(c) && c.name.includes('基本闘エネルギー'))
                if (energyIdx !== -1) {
                    const card = next[energyIdx]
                    setTrash(t => [...t, card])
                    next.splice(energyIdx, 1)

                    // Draw 3
                    const drawn = remaining.slice(0, 3)
                    setRemaining(r => r.slice(3))
                    return [...next, ...drawn]
                }
                return next
            })
            setLunacycleUsedThisTurn(true)
            showToast("ルナサイクルを使用しました")
        }
    }


    // Ultra Ball Logic
    const useUltraBall = (playedIndex: number) => {
        // Must discard 2 cards. Hand must have at least 3 cards (Ultra Ball itself + 2 to discard)
        if (hand.length < 3) {
            alert("手札が足りません（このカード以外に2枚必要です）")
            return
        }

        // Move Ultra Ball to trash first
        const playedCard = hand[playedIndex]
        setTrash(prev => [...prev, playedCard])
        const remainingHand = hand.filter((_, i) => i !== playedIndex)
        setHand(remainingHand)

        setUltraBallState({
            step: 'discard',
            candidates: remainingHand,
            handIndices: []
        })
    }

    const handleUltraBallDiscardSelection = (index: number) => {
        if (!ultraBallState || ultraBallState.step !== 'discard') return

        setUltraBallState(prev => {
            if (!prev) return null
            const current = [...prev.handIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 2) {
                current.push(index)
            }
            return { ...prev, handIndices: current }
        })
    }

    const handleUltraBallConfirmDiscard = () => {
        if (!ultraBallState || ultraBallState.handIndices.length !== 2) return

        const discarded = ultraBallState.handIndices.map(idx => ultraBallState.candidates[idx])
        setTrash(prev => [...prev, ...discarded])

        const finalHand = ultraBallState.candidates.filter((_, i) => !ultraBallState.handIndices.includes(i))
        setHand(finalHand)

        // Move to search step
        setUltraBallState({
            step: 'search',
            candidates: [...remaining],
            handIndices: []
        })
    }

    const handleUltraBallSearchSelect = (deckIndex: number) => {
        if (!ultraBallState || ultraBallState.step !== 'search') return
        const card = remaining[deckIndex]

        if (!isPokemon(card)) {
            alert("ポケモンを選んでください")
            return
        }

        setHand(prev => [...prev, card])
        const newDeck = remaining.filter((_, i) => i !== deckIndex).sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setUltraBallState(null)
        alert(`${card.name}を手札に加え、山札をシャッフルしました`)
    }

    const handleUltraBallCancel = () => {
        if (!ultraBallState) return
        if (ultraBallState.step === 'search') {
            const newDeck = [...remaining].sort(() => Math.random() - 0.5)
            setRemaining(newDeck)
            alert("山札をシャッフルしました")
        }
        setUltraBallState(null)
    }



    // Buddy-Buddy Poffin Logic
    const usePoffin = (playedIndex: number) => {
        // Move Poffin to trash
        const playedCard = hand[playedIndex]
        setTrash(prev => [...prev, playedCard])
        setHand(prev => prev.filter((_, i) => i !== playedIndex))

        setPoffinState({
            step: 'search',
            candidates: [...remaining],
            selectedIndices: []
        })
    }

    const handlePoffinSelect = (index: number) => {
        if (!poffinState) return
        const card = remaining[index]

        if (!isPokemon(card)) {
            alert("ポケモンを選んでください")
            return
        }

        setPoffinState(prev => {
            if (!prev) return null
            const current = [...prev.selectedIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 2) {
                current.push(index)
            }
            return { ...prev, selectedIndices: current }
        })
    }

    const handlePoffinConfirm = () => {
        if (!poffinState) return

        const selectedCards = poffinState.selectedIndices.map(idx => remaining[idx])

        if (selectedCards.length === 0) {
            const newDeck = [...remaining].sort(() => Math.random() - 0.5)
            setRemaining(newDeck)
            setPoffinState(null)
            alert("山札をシャッフルしました")
            return
        }

        // Try to put on bench
        setBench(currentBench => {
            const nextBench = [...currentBench]
            let placedCount = 0

            for (const card of selectedCards) {
                const emptySlotIndex = nextBench.findIndex((slot, i) => i < benchSize && slot === null)
                if (emptySlotIndex !== -1) {
                    nextBench[emptySlotIndex] = createStack(card)
                    placedCount++
                } else {
                    alert("ベンチがいっぱいです。一部のカードを置けませんでした。")
                    break
                }
            }
            return nextBench
        })

        const newDeck = remaining.filter((_, i) => !poffinState.selectedIndices.includes(i)).sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setPoffinState(null)
        alert(`${selectedCards.length}枚をベンチに出し、山札をシャッフルしました`)
    }

    const switchPokemon = (benchIndex: number) => {
        if (!battleField || !bench[benchIndex]) return

        setBattleField(bench[benchIndex])
        setBench(prev => {
            const next = [...prev]
            next[benchIndex] = battleField
            return next
        })
    }

    const useBossOrders = (playedIndex: number) => {
        // Move to trash
        moveToTrash(playedIndex)

        // Notify parent to start selection on opponent board
        if (onEffectTrigger) {
            onEffectTrigger('boss_orders')
        }
        alert("相手のベンチポケモンを選択してください")
    }

    const useTouko = (playedIndex: number) => {
        moveToTrash(playedIndex)
        setToukoState({
            step: 'search',
            candidates: [...remaining],
            selectedPokemonIndex: null,
            selectedEnergyIndex: null
        })
    }

    const handleToukoSelect = (index: number) => {
        if (!toukoState) return
        const card = remaining[index]

        if (isPokemon(card)) {
            setToukoState(prev => prev ? ({ ...prev, selectedPokemonIndex: prev.selectedPokemonIndex === index ? null : index }) : null)
        } else if (isEnergy(card)) {
            setToukoState(prev => prev ? ({ ...prev, selectedEnergyIndex: prev.selectedEnergyIndex === index ? null : index }) : null)
        }
    }

    const handleToukoConfirm = () => {
        if (!toukoState) return
        const selectedIndices = [toukoState.selectedPokemonIndex, toukoState.selectedEnergyIndex].filter(idx => idx !== null) as number[]
        const selectedCards = selectedIndices.map(idx => remaining[idx])

        if (selectedCards.length > 0) {
            setHand(prev => [...prev, ...selectedCards])
        }

        const newDeck = remaining.filter((_, i) => !selectedIndices.includes(i)).sort(() => Math.random() - 0.5)
        setRemaining(newDeck)
        setToukoState(null)
        alert(`${selectedCards.length}枚を手札に加え、山札をシャッフルしました`)
    }

    const useFightGong = (playedIndex: number) => {
        moveToTrash(playedIndex)
        setFightGongState({
            step: 'search',
            candidates: [...remaining],
            selectedIndex: null
        })
    }

    const handleFightGongSelect = (index: number) => {
        if (!fightGongState) return
        const card = remaining[index]
        if (isPokemon(card) || isEnergy(card)) {
            setFightGongState(prev => prev ? ({ ...prev, selectedIndex: prev.selectedIndex === index ? null : index }) : null)
        }
    }

    const handleFightGongConfirm = () => {
        if (!fightGongState) return
        const index = fightGongState.selectedIndex
        let msg = "山札をシャッフルしました"

        if (index !== null) {
            const card = remaining[index]
            setHand(prev => [...prev, card])
            const newDeck = remaining.filter((_, i) => i !== index).sort(() => Math.random() - 0.5)
            setRemaining(newDeck)
            msg = `${card.name}を手札に加え、山札をシャッフルしました`
        } else {
            setRemaining(prev => [...prev].sort(() => Math.random() - 0.5))
        }

        setFightGongState(null)
        alert(msg)
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
    const useJudge = (playedIndex?: number) => {
        let handToReturn = [...hand]
        if (playedIndex !== undefined) {
            const playedCard = handToReturn[playedIndex]
            if (playedCard) {
                setTrash(prev => [...prev, playedCard])
                handToReturn = handToReturn.filter((_, i) => i !== playedIndex)
            }
        }
        const currentRemaining = remaining
        const newDeck = shuffle([...currentRemaining, ...handToReturn])
        const drawn = newDeck.slice(0, 4)

        setHand(drawn)
        setRemaining(newDeck.slice(4))

        // Notify parent to trigger opponent
        if (onEffectTrigger) {
            onEffectTrigger('judge')
        }
        showToast("ジャッジマン: お互いに手札を戻して4枚引きました")
    }

    const isRocketPokemon = (c: Card): boolean => {
        return isPokemon(c) && (
            c.name.includes('ロケット団') ||
            c.name.includes('Rocket') ||
            c.name.includes('R団')
        )
    }

    // Helper to find the active Pokemon card in a stack (ignoring Energy/Tools)
    const getTopPokemon = (stack: CardStack | null): Card | null => {
        if (!stack || stack.cards.length === 0) return null
        // Iterate backwards to find the top-most Pokemon
        for (let i = stack.cards.length - 1; i >= 0; i--) {
            if (isPokemon(stack.cards[i])) {
                return stack.cards[i]
            }
        }
        return null
    }

    const useAthena = (playedIndex?: number) => {
        if (playedIndex !== undefined) {
            moveToTrash(playedIndex)
        }

        // Check condition: All Pokemon on board (Battle + Bench) must be Rocket's
        // We must check if there is at least one rocket pokemon to valid "all are rocket" logically?
        // Usually "If you have any non-Rocket Pokemon, false".

        const battlePokemon = getTopPokemon(battle)

        let allRocket = true
        let hasPokemon = false

        if (battlePokemon) {
            hasPokemon = true
            if (!isRocketPokemon(battlePokemon)) allRocket = false
        }

        bench.forEach(stack => {
            const benchPokemon = getTopPokemon(stack)
            if (benchPokemon) {
                hasPokemon = true
                if (!isRocketPokemon(benchPokemon)) allRocket = false
            }
        })

        // If no pokemon on board (impossible if game is running correctly), assume false or true?
        // Usually requires at least one Rocket Pokemon to trigger "Rocket" effects? 
        // Athena text: "If all of your Pokemon are Rocket's Pokemon..."
        // If empty bench and Active is Rocket -> True.

        if (!hasPokemon) allRocket = false

        const targetCount = allRocket ? 8 : 5
        let currentHandSize = hand.length
        if (playedIndex !== undefined) {
            currentHandSize -= 1
        }
        const drawCount = targetCount - currentHandSize

        if (drawCount > 0) {
            const drew = remaining.slice(0, drawCount)
            const nextRemaining = remaining.slice(drawCount)
            setHand(prev => [...prev, ...drew])
            setRemaining(nextRemaining)
            showToast(`アテナ: ${drawCount}枚引きました (${allRocket ? 'ロケット団ボーナス' : '通常'})`)
        } else {
            showToast("手札が多いため引けませんでした")
        }
    }

    const useApollo = (playedIndex?: number) => {
        // Shuffle hand into deck (excluding played card if from hand)
        let cardsToReturn = [...hand]
        if (playedIndex !== undefined) {
            // If played from hand, it's already "in limbo" or we should exclude it from shuffling back? 
            // Normally "discard the played card" happens at end? 
            // Text: "Each player shuffles their hand into their deck." The played Supporter is not in hand.
            // So we remove it first.
            const playedCard = hand[playedIndex]
            moveToTrash(playedIndex)
            cardsToReturn = hand.filter((_, i) => i !== playedIndex)
        }

        const newDeck = shuffle([...remaining, ...cardsToReturn])

        // Draw 5
        const drew = newDeck.slice(0, 5)
        const nextRemaining = newDeck.slice(5)

        setHand(drew)
        setRemaining(nextRemaining)

        showToast("アポロ: 手札を戻して5枚引きました")

        // Trigger opponent
        onEffectTrigger?.('apollo')
    }

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

    const getCardSpecificActions = (card: Card, index: number, source: string) => {
        const name = card.name
        const actions: { label: string; action: () => void; color: string }[] = []

        if (name === 'リーリエの決心') {
            actions.push({
                label: 'リーリエの決心を使用',
                action: () => {
                    useLillie(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-pink-100 text-pink-700 hover:bg-pink-200'
            })
        }

        if (name === 'アカマツ') {
            actions.push({
                label: 'アカマツを使用',
                action: () => {
                    const energies = remaining.filter(c => isEnergy(c))
                    if (energies.length === 0) {
                        alert("山札にエネルギーがありません")
                        return
                    }
                    if (source === 'hand') moveToTrash(index)
                    // Show full deck but highlight energies
                    setAkamatsuState({
                        step: 'select_two',
                        candidates: [...remaining],
                        selectedIndices: [],
                        forHandIndex: null
                    })
                    closeMenu()
                },
                color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            })
        }


        if (name === 'ロケット団のアテナ') {
            actions.push({
                label: 'アテナを使用',
                action: () => {
                    useAthena(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }

        if (name === 'ロケット団のアポロ') {
            actions.push({
                label: 'アポロを使用',
                action: () => {
                    useApollo(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }


        if (name === 'ジャッジマン') {
            actions.push({
                label: 'ジャッジマンを使用',
                action: () => {
                    useJudge(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            })
        }


        if (name === 'サマヨール' || name === 'ヨノワール') {
            const damage = name === 'ヨノワール' ? 13 : 5
            actions.push({
                label: `カースドボムを使用 (${damage}個)`,
                action: () => {
                    handleCursedBomb(source as 'battle' | 'bench', index, damage)
                    closeMenu()
                },
                color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            })
        }

        if (name === 'フーディン' || name === 'ユンゲラー') {
            const drawCount = name === 'フーディン' ? 3 : 2
            actions.push({
                label: `サイコドロー (${drawCount}枚)`,
                action: () => {
                    handlePsychicDraw(drawCount)
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            })
        }

        if (name === 'ポケパッド') {
            actions.push({
                label: 'ポケパッドを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    setPokePadState([...remaining])
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            })
        }

        if (name === 'ハイパーボール') {
            actions.push({
                label: 'ハイパーボールを使用',
                action: () => {
                    if (source === 'hand') {
                        useUltraBall(index)
                    } else {
                        // If not from hand (e.g. from deck/trash usage), just shuffle? 
                        // But normally these are only played from hand.
                        alert("手札から使用してください")
                    }
                    closeMenu()
                },
                color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            })
        }

        if (name === 'ヒカリ') {
            actions.push({
                label: 'ヒカリを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    setDawnState({
                        step: 'search',
                        candidates: [...remaining],
                        selectedIndices: []
                    })
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            })
        }

        if (name === 'スピンロトム') {
            actions.push({
                label: 'ファンコールを使用',
                action: () => {
                    if (fanCallUsedThisTurn) {
                        alert("この番、すでに別の「ファンコール」を使っています")
                        return
                    }
                    setFanCallState({
                        step: 'search',
                        candidates: [...remaining],
                        selectedIndices: []
                    })
                    setFanCallUsedThisTurn(true)
                    closeMenu()
                },
                color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            })
        }

        if (name === 'タケルライコex') {
            actions.push({
                label: 'はじけるほうこう (ワザ)',
                action: () => {
                    handleBurstingRoar()
                    closeMenu()
                },
                color: 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
            })
            actions.push({
                label: 'きょくらいごう (ワザ)',
                action: () => {
                    setRagingBoltState({
                        step: 'select_energy',
                        selectedEnergies: []
                    })
                    closeMenu()
                },
                color: 'bg-red-50 text-red-800 hover:bg-red-100'
            })
        }

        if (name === 'ガラスのラッパ') {
            actions.push({
                label: 'ガラスのラッパを使用',
                action: () => {
                    const basicEnergies = trash.filter(c => isEnergy(c) && (c.subtypes?.includes('Basic') || !c.subtypes?.includes('Special')))
                    if (basicEnergies.length === 0) {
                        alert("トラッシュに基本エネルギーがありません")
                        return
                    }
                    if (source === 'hand') moveToTrash(index)
                    setGlassTrumpetState({
                        step: 'select_energy',
                        candidates: basicEnergies,
                        selectedEnergyIndices: [],
                        targetBenchIndices: []
                    })
                    closeMenu()
                },
                color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
            })
        }

        if (name === 'テラスタルオーブ') {
            actions.push({
                label: 'テラスタルオーブを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    setTeraOrbState({
                        step: 'search',
                        candidates: [...remaining],
                        selectedIndex: null
                    })
                    closeMenu()
                },
                color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            })
        }

        if (name === 'タケシのスカウト') {
            actions.push({
                label: 'タケシのスカウトを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    setBrocksScoutState({
                        step: 'search',
                        candidates: [...remaining],
                        selectedIndices: []
                    })
                    closeMenu()
                },
                color: 'bg-stone-200 text-stone-800 hover:bg-stone-300'
            })
        }

        if (name.includes('なかよしポフィン')) {
            actions.push({
                label: 'なかよしポフィンを使用',
                action: () => {
                    if (source === 'hand') {
                        usePoffin(index)
                    } else {
                        alert("手札から使用してください")
                    }
                    closeMenu()
                },
                color: 'bg-pink-50 text-pink-600 hover:bg-pink-100'
            })
        }

        if (name === 'ボスの指令') {
            actions.push({
                label: 'ボスの指令を使用',
                action: () => {
                    if (source === 'hand') useBossOrders(index)
                    closeMenu()
                },
                color: 'bg-red-100 text-red-700 hover:bg-red-200'
            })
        }

        if (name === 'トウコ') {
            actions.push({
                label: 'トウコを使用',
                action: () => {
                    if (source === 'hand') useTouko(index)
                    closeMenu()
                },
                color: 'bg-green-100 text-green-700 hover:bg-green-200'
            })
        }

        if (name === 'ファイトゴング') {
            actions.push({
                label: 'ファイトゴングを使用',
                action: () => {
                    if (source === 'hand') useFightGong(index)
                    closeMenu()
                },
                color: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
            })
        }

        if (name === 'アポロ') {
            actions.push({
                label: 'アポロを使用',
                action: () => {
                    useApollo(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            })
        }

        if (name === 'アテナ') {
            actions.push({
                label: 'アテナを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    useAthena()
                    closeMenu()
                },
                color: 'bg-green-100 text-green-700 hover:bg-green-200'
            })
        }

        if (name === 'ロケット団のラムダ') {
            actions.push({
                label: 'ラムダを使用',
                action: () => {
                    useLambda(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }

        if (name === '夜のタンカ') {
            actions.push({
                label: '夜のタンカを使用',
                action: () => {
                    useNightStretcher(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            })
        }

        if (name === 'ドロンチ' && (source === 'bench' || source === 'battle')) {
            actions.push({
                label: '特性: ていさつしれい',
                action: () => {
                    useTeisatsuShirei()
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            })
        }

        if (name.includes('アンフェアスタンプ')) {
            actions.push({
                label: 'アンフェアスタンプを使用',
                action: () => {
                    useUnfairStamp(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-red-100 text-red-700 hover:bg-red-200'
            })
        }

        if (name.includes('ポケギア3.0')) {
            actions.push({
                label: 'ポケギア3.0を使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    usePokegear()
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        // Add more here (e.g., Pokegear logic, etc.)


        if (name === 'シャリタツ' && source === 'battle') {
            actions.push({
                label: '特性: きゃくよせ',
                action: () => {
                    useTatsugiri()
                    closeMenu()
                },
                color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            })
        }

        if (name === 'オーガポン みどりのめんex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: みどりのまい',
                action: () => {
                    useOgerpon(source, index)
                    closeMenu()
                },
                color: 'bg-green-100 text-green-700 hover:bg-green-200'
            })
        }

        if (name === 'Nのゾロアークex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: とりひき',
                action: () => {
                    useZoroark()
                    closeMenu()
                },
                color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            })
        }

        if (name === 'キチキギスex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: さかてにとる',
                action: () => {
                    useFezandipiti()
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }

        if (name === 'ノココッチ' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: にげあしドロー',
                action: () => {
                    useDudunsparce(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            })
        }

        if (name === 'ニャースex' && source === 'hand') {
            actions.push({
                label: 'ベンチに出して特性を使用',
                action: () => {
                    useMeowthEX(index)
                    closeMenu()
                },
                color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            })
        }

        if (name === 'むしとりセット' && source === 'hand') {
            actions.push({
                label: '使用: むしとりセット',
                action: () => {
                    useBugCatchingSet(index)
                    closeMenu()
                },
                color: 'bg-green-50 text-green-700 hover:bg-green-100'
            })
        }

        if (name === 'エネルギーつけかえ' && source === 'hand') {
            actions.push({
                label: '使用: エネルギーつけかえ',
                action: () => {
                    useEnergySwitch(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'エネルギー回収' && source === 'hand') {
            actions.push({
                label: '使用: エネルギー回収',
                action: () => {
                    useEnergyRetrieval(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'ヨルノズク' && (source === 'hand' || source === 'bench')) {
            actions.push({
                label: '特性: ほうせきさがし',
                action: () => {
                    if (source === 'hand') {
                        useNoctowl(index)
                    } else {
                        // If already on bench, just trigger the search part
                        setNoctowlState({
                            step: 'search',
                            candidates: [...remaining],
                            selectedIndices: []
                        })
                    }
                    closeMenu()
                },
                color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            })
        }

        if (name === 'メガルカリオex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: 'ワザ: はどうづき',
                action: () => {
                    useMegaLucarioEX(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            })
        }

        if (name === 'ルナトーン' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: ルナサイクル',
                action: () => {
                    useLunatone(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            })
        }

        if (name === 'Nのポイントアップ' && source === 'hand') {
            actions.push({
                label: 'Nのポイントアップを使用',
                action: () => {
                    useNPointUp(index)
                    closeMenu()
                },
                color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            })
        }

        if (name === 'シアノ' && source === 'hand') {
            actions.push({
                label: 'シアノを使用',
                action: () => {
                    useCyano(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'オーガポン いどのめんex' && source === 'battle') {
            actions.push({
                label: 'ワザ: げきりゅうポンプ',
                action: () => {
                    useOgerponWellspring(source, index)
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-900 border-2 border-blue-300 font-black'
            })
        }

        if (name.includes('プレシャスキャリー') && source === 'hand') {
            actions.push({
                label: 'プレシャスキャリーを使用',
                action: () => {
                    usePreciousCarrier(index)
                    closeMenu()
                },
                color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            })
        }

        if (name.includes('プライムキャッチャー') && source === 'hand') {
            actions.push({
                label: 'プライムキャッチャーを使用',
                action: () => {
                    usePrimeCatcher(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'ポケモンいれかえ' && source === 'hand') {
            actions.push({
                label: 'ポケモンいれかえを使用',
                action: () => {
                    usePokemonSwitch(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'モモワロウex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: しはいのくさり',
                action: () => {
                    usePecharuntChainOfCommand(index, source as 'battle' | 'bench')
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }

        if (name === 'ブースターex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: 'ワザ: バーニングチャージ',
                action: () => {
                    useFlareonBurningCharge(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-red-50 text-red-700 hover:bg-red-100'
            })
        }

        if (name === 'マシマシラ' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: アドレナブレイン',
                action: () => {
                    useMunkidoriAdrenalBrain(index, source as 'battle' | 'bench')
                    closeMenu()
                },
                color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            })
        }

        return actions
    }

    // --- Akamatsu (Crispin) Logic ---
    const handleAkamatsuSelectEnergy = (index: number) => {
        if (!akamatsuState) return
        const { selectedIndices, candidates } = akamatsuState
        const selectedCard = candidates[index]

        if (!isEnergy(selectedCard)) {
            alert("基本エネルギーカードを選択してください")
            return
        }

        if (selectedIndices.includes(index)) {
            setAkamatsuState({ ...akamatsuState, selectedIndices: selectedIndices.filter(i => i !== index) })
            return
        }

        if (selectedIndices.length >= 2) return

        if (selectedIndices.length === 1) {
            if (candidates[selectedIndices[0]].name === candidates[index].name) {
                alert("ちがうタイプの基本エネルギーを選んでください")
                return
            }
        }
        setAkamatsuState({ ...akamatsuState, selectedIndices: [...selectedIndices, index] })
    }

    const handleAkamatsuConfirmTwo = () => {
        if (!akamatsuState || akamatsuState.selectedIndices.length === 0) return
        setAkamatsuState({ ...akamatsuState, step: 'select_for_hand' })
    }

    const handleAkamatsuSelectForHand = (idxInSelected: number) => {
        if (!akamatsuState) return
        const realIdx = akamatsuState.selectedIndices[idxInSelected]
        const cardForHand = akamatsuState.candidates[realIdx]
        const otherIdx = akamatsuState.selectedIndices.find(i => i !== realIdx)
        const cardToAttach = otherIdx !== undefined ? akamatsuState.candidates[otherIdx] : null

        setHand(prev => [...prev, cardForHand])

        if (akamatsuState.selectedIndices.length === 1 || !cardToAttach) {
            const nameMatch = cardForHand.name
            let removed = false
            setRemaining(prev => prev.filter(c => {
                if (!removed && c.name === nameMatch) {
                    removed = true
                    return false
                }
                return true
            }))
            setAkamatsuState(null)
            shuffleDeck()
            return
        }

        setAkamatsuState({ ...akamatsuState, step: 'select_target', forHandIndex: realIdx })

        // Enable board selection for attachment
        setOnBoardSelection({
            type: 'move',
            source: 'deck',
            title: 'エネルギーを付けるポケモンを選択',
            onSelect: (type, targetIndex) => {
                // DON'T use akamatsuState.step here as it will be stale in this closure
                // Instead, rely on the fact that this callback existing means we are in selection mode

                // Clear state immediately to prevent re-triggering via double clicks
                setAkamatsuState(null)
                setOnBoardSelection(null)

                if (type === 'battle' || type === 'bench') {
                    const applyToStack = (stack: CardStack | null) => {
                        if (!stack) return null
                        return {
                            ...stack,
                            cards: [...stack.cards, cardToAttach],
                            energyCount: (stack.energyCount || 0) + 1
                        }
                    }

                    if (type === 'battle') {
                        setBattleField(prev => applyToStack(prev))
                    } else {
                        setBench(prev => {
                            const next = [...prev]
                            next[targetIndex] = applyToStack(next[targetIndex])
                            return next
                        })
                    }

                    // Robust Deck Removal: Only remove if we have the names
                    const namesToRemove = [cardForHand.name, cardToAttach.name]
                    setRemaining(prev => {
                        let next = [...prev]
                        namesToRemove.forEach(n => {
                            const idx = next.findIndex(c => c.name === n)
                            if (idx !== -1) next.splice(idx, 1)
                        })
                        // Shuffle as part of the same state update for consistency
                        return next.sort(() => Math.random() - 0.5)
                    })

                    showToast("アカマツの効果を使用しました")
                }
            }
        })
    }

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
                            {getTopCard(menu.card as CardStack).name === 'メガルカリオex' && (
                                <>
                                    <button onClick={useHadozuki} className="w-full text-left px-4 py-2 hover:bg-orange-50 text-orange-700 text-sm font-bold flex items-center gap-2 border-b border-orange-100">
                                        <span>👊</span> はどうづき (130)
                                    </button>
                                    <button
                                        onClick={useMegaBrave}
                                        disabled={megaBraveUsedLastTurn}
                                        className={`w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 border-b border-orange-100 ${megaBraveUsedLastTurn ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-red-50 text-red-700'}`}
                                    >
                                        <span>🔥</span> メガブレイブ (270)
                                        {megaBraveUsedLastTurn && <span className="text-[10px] font-normal">(使用不可)</span>}
                                    </button>
                                    {megaBraveUsedLastTurn && (
                                        <button onClick={resetMegaBrave} className="w-full text-left px-4 py-1 hover:bg-gray-50 text-gray-500 text-[10px] border-b">
                                            使用制限をリセット
                                        </button>
                                    )}
                                </>
                            )}

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

    const useUnfairStamp = (playedIndex?: number) => {
        let handToReturn = [...hand]
        if (playedIndex !== undefined) {
            const playedCard = handToReturn[playedIndex]
            if (playedCard) {
                setTrash(prev => [...prev, playedCard])
                handToReturn = handToReturn.filter((_, i) => i !== playedIndex)
            }
        }
        const currentRemaining = remaining
        const newDeck = [...currentRemaining, ...handToReturn].sort(() => Math.random() - 0.5)
        setHand(newDeck.slice(0, 5))
        setRemaining(newDeck.slice(5))

        // Notify parent to trigger opponent (opponent draws 2)
        if (onEffectTrigger) {
            onEffectTrigger('unfair_stamp')
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

            {/* Akamatsu (Crispin) Modal */}
            {akamatsuState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${akamatsuState.step === 'select_target' ? 'bg-transparent pointer-events-none' : (peekDeckSearch ? 'bg-black/10 pointer-events-auto' : 'bg-black/60 pointer-events-auto')
                    }`}>
                    <div className={`bg-white rounded-lg shadow-2xl animate-fade-in-up transition-all duration-300 pointer-events-auto ${akamatsuState.step === 'select_target'
                        ? 'fixed bottom-24 p-4 max-w-sm border-2 border-orange-500'
                        : peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto'
                        }`}>
                        <div className="flex justify-between items-start mb-2">
                            <h2 className={`font-bold text-orange-600 ${akamatsuState.step === 'select_target' ? 'text-sm' : 'text-xl flex-1 text-center ml-8'}`}>アカマツ</h2>
                            {akamatsuState.step !== 'select_target' && (
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                    title="盤面を見る"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {akamatsuState.step === 'select_two' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">山札からちがうタイプの基本エネルギーを2枚まで選んでください。<br />(緑色の枠のカードが選択可能です)</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 max-h-[50vh] overflow-y-auto p-4 bg-gray-50 rounded-inner shadow-inner">
                                    {akamatsuState.candidates.map((card, i) => {
                                        const isEnergyCard = isEnergy(card)
                                        const isSelected = akamatsuState.selectedIndices.includes(i)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isEnergyCard
                                                    ? isSelected
                                                        ? 'ring-[6px] ring-orange-500 scale-110 z-10'
                                                        : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isEnergyCard && handleAkamatsuSelectEnergy(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={90} height={126} className="rounded-lg shadow" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute -top-3 -right-3 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20">
                                                        {akamatsuState.selectedIndices.indexOf(i) + 1}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button onClick={handleAkamatsuConfirmTwo} className="bg-orange-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-600 disabled:opacity-50" disabled={akamatsuState.selectedIndices.length === 0}>
                                        決定 ({akamatsuState.selectedIndices.length}枚)
                                    </button>
                                    <button onClick={() => setAkamatsuState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                                </div>
                            </>
                        )}

                        {akamatsuState.step === 'select_for_hand' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">手札に加えるエネルギーを選択してください。<br />(選ばなかった方はポケモンに付けます)</p>
                                <div className="flex justify-center gap-10 mb-8">
                                    {akamatsuState.selectedIndices.map((realIdx, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleAkamatsuSelectForHand(i)}>
                                                <Image src={akamatsuState.candidates[realIdx].imageUrl} alt="energy" width={140} height={196} className="rounded-lg shadow-xl" unoptimized />
                                            </div>
                                            <button onClick={() => handleAkamatsuSelectForHand(i)} className="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full">手札に加える</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {akamatsuState.step === 'select_target' && (
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-800 mb-1">付ける先のポケモンを直接クリックしてください</p>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="relative">
                                        <Image
                                            src={akamatsuState.candidates[akamatsuState.selectedIndices.find(i => i !== akamatsuState.forHandIndex)!].imageUrl}
                                            alt="attaching" width={60} height={84} className="rounded shadow-lg border-2 border-green-500 animate-pulse" unoptimized
                                        />
                                    </div>
                                    <button onClick={() => { setAkamatsuState(null); setOnBoardSelection(null); }} className="bg-gray-200 text-gray-800 font-bold px-4 py-1 text-xs rounded-full">キャンセル</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Tatsugiri (Customer Service) Modal */}
            {tatsugiriState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-orange-500 flex-1 text-center ml-8">シャリタツ: きゃくよせ</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札の上から6枚を見て、サポートを1枚選んでください。<br />(オレンジ色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {tatsugiriState.candidates.map((card, i) => {
                                const isTarget = isSupporter(card)
                                const isSelected = tatsugiriState.selectedIndex === i
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-orange-500 scale-110 z-10'
                                                : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleTatsugiriSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleTatsugiriConfirm}
                                className="bg-orange-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-600"
                            >
                                {tatsugiriState.selectedIndex !== null ? '決定' : '対象なし・終了'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ogerpon Teal Mask ex (Teal Dance) Modal */}
            {ogerponState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-green-600 flex-1 text-center ml-8">オーガポン: みどりのまい</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">手札からこのポケモンにつける基本エネルギーを選んでください。</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {ogerponState.candidates.map((card, i) => {
                                const isTarget = isEnergy(card) // Simplification, strictly Basic Energy but relying on user or `isEnergy` + confirm check
                                const isSelected = ogerponState.selectedIndex === i
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-green-600 scale-110 z-10'
                                                : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleOgerponSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleOgerponConfirm}
                                disabled={ogerponState.selectedIndex === null}
                                className="bg-green-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                決定
                            </button>
                            <button onClick={() => setOgerponState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Zoroark ex (Trade) Modal */}
            {zoroarkState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-700 flex-1 text-center ml-8">ゾロアーク: とりひき</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">手札からトラッシュするカードを1枚選んでください。</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {zoroarkState.candidates.map((card, i) => {
                                const isSelected = zoroarkState.selectedIndex === i
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSelected
                                            ? 'ring-[6px] ring-gray-600 scale-110 z-10'
                                            : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                            }`}
                                        onClick={() => handleZoroarkSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-gray-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleZoroarkConfirm}
                                disabled={zoroarkState.selectedIndex === null}
                                className="bg-gray-700 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                決定
                            </button>
                            <button onClick={() => setZoroarkState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Meowth ex (Trump Card Catch) Modal */}
            {meowthEXState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-orange-600 flex-1 text-center ml-8">ニャースex: おくのてキャッチ</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からサポートカードを1枚選んでください。<br />(オレンジ色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {meowthEXState.candidates.map((card, i) => {
                                const isTarget = isSupporter(card)
                                const isSelected = meowthEXState.selectedIndex === i
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-orange-600 scale-110 z-10'
                                                : 'ring-2 ring-orange-200 hover:ring-4 hover:ring-orange-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleMeowthEXSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleMeowthEXConfirm}
                                className="bg-orange-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-700"
                            >
                                {meowthEXState.selectedIndex !== null ? '決定' : '対象なし・戻す'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Nのポイントアップ Modal */}
            {nPointUpState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${nPointUpState.step === 'select_target' ? 'bg-transparent pointer-events-none' : (peekDeckSearch ? 'bg-black/10' : 'bg-black/60')}`}>
                    <div className={`bg-white rounded-lg shadow-2xl animate-fade-in-up transition-all duration-300 pointer-events-auto ${nPointUpState.step === 'select_target'
                        ? 'fixed bottom-24 p-4 max-w-sm border-2 border-orange-500'
                        : peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto'
                        }`}>
                        <div className="flex justify-between items-start mb-2">
                            <h2 className={`font-bold text-orange-600 ${nPointUpState.step === 'select_target' ? 'text-sm' : 'text-xl flex-1 text-center ml-8'}`}>Nのポイントアップ</h2>
                            {nPointUpState.step !== 'select_target' && (
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {nPointUpState.step === 'select_energy' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">トラッシュから基本エネルギーを1枚選んでください。<br />(オレンジ色の枠のカードが選択可能です)</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                    {nPointUpState.candidates.map((card, i) => {
                                        const isTarget = isEnergy(card)
                                        const isSelected = nPointUpState.selectedIndex === i
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                                    ? isSelected
                                                        ? 'ring-[6px] ring-orange-500 scale-110 z-10'
                                                        : 'ring-2 ring-orange-200 hover:ring-4 hover:ring-orange-400 hover:scale-105'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isTarget && handleNPointUpSelectEnergy(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute -top-3 -right-3 bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                        ✓
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={handleNPointUpConfirmEnergy}
                                        disabled={nPointUpState.selectedIndex === null}
                                        className="bg-orange-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        決定
                                    </button>
                                    <button onClick={() => setNPointUpState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                                </div>
                            </>
                        )}

                        {nPointUpState.step === 'select_target' && (
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-800 mb-1">付ける先のベンチポケモンを直接クリックしてください</p>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="relative">
                                        <Image
                                            src={nPointUpState.candidates[nPointUpState.selectedIndex!].imageUrl}
                                            alt="attaching" width={60} height={84} className="rounded shadow-lg border-2 border-green-500 animate-pulse" unoptimized
                                        />
                                    </div>
                                    <button onClick={() => setNPointUpState(null)} className="bg-gray-200 text-gray-800 font-bold px-4 py-1 text-xs rounded-full">キャンセル</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* シアノ Modal */}
            {cyanoState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-blue-600 flex-1 text-center ml-8">シアノ</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札から「ポケモンex」を3枚まで選んでください。<br />(青色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {cyanoState.candidates.map((card, i) => {
                                const isTarget = card.name.includes('ex')
                                const isSelected = cyanoState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-blue-600 scale-110 z-10'
                                                : 'ring-2 ring-blue-200 hover:ring-4 hover:ring-blue-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleCyanoSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                {cyanoState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleCyanoConfirm}
                                className="bg-blue-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-blue-700"
                            >
                                {cyanoState.selectedIndices.length > 0 ? `決定 (${cyanoState.selectedIndices.length}枚)` : '対象なし・戻す'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* オーガポン いどのめんex (Energy Cost Selection) Modal */}
            {ogerponWellspringState && ogerponWellspringState.step === 'select_cost' && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-2 text-center text-blue-600">げきりゅうポンプ: コスト選択</h2>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札に戻すエネルギーを{battleField?.cards.some(c => c.name.includes('きらめく結晶')) ? 2 : 3}枚選んでください。</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-4 mb-8 p-4 bg-gray-50 rounded-inner">
                            {battleField?.cards.map((card, i) => {
                                const isTarget = isEnergy(card)
                                const isSelected = ogerponWellspringState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-blue-600 scale-110 z-10'
                                                : 'ring-2 ring-blue-200 hover:ring-4 hover:ring-blue-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleOgerponWellspringSelectCost(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={100} height={140} className="rounded shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white">
                                                {ogerponWellspringState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleOgerponWellspringConfirmCost}
                                disabled={ogerponWellspringState.selectedIndices.length !== (battleField?.cards.some(c => c.name.includes('きらめく結晶')) ? 2 : 3)}
                                className="bg-blue-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                山札に戻して攻撃！
                            </button>
                            <button onClick={() => setOgerponWellspringState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                        </div>
                    </div>
                </div>
            )}

            {/* むしとりセット Modal */}
            {bugCatchingSetState && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-2 text-center text-green-600">むしとりセット</h2>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札の上から7枚です。ポケモンまたは基本草エネルギーを2枚まで選んでください。<br />(緑色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-2 mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {bugCatchingSetState.candidates.map((card, i) => {
                                const isGrassPokemon = isPokemon(card)
                                const isBasicGrassEnergy = isEnergy(card) && card.name.includes('基本草エネルギー')
                                const isTarget = isGrassPokemon || isBasicGrassEnergy
                                const isSelected = bugCatchingSetState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-green-600 scale-110 z-10'
                                                : 'ring-2 ring-green-200 hover:ring-4 hover:ring-green-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleBugCatchingSetSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                {bugCatchingSetState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleBugCatchingSetConfirm}
                                className="bg-green-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-green-700"
                            >
                                {bugCatchingSetState.selectedIndices.length > 0 ? `決定 (${bugCatchingSetState.selectedIndices.length}枚)` : '対象なし・戻す'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* エネルギーつけかえ Overlay / Modal */}
            {energySwitchState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-colors duration-300 ${energySwitchState.step === 'select_energy' ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl animate-fade-in-up overflow-y-auto pointer-events-auto ${energySwitchState.step === 'select_energy'
                        ? 'p-6 max-w-xl w-full'
                        : 'fixed bottom-24 p-4 max-w-sm border-2 border-blue-500'
                        }`}>
                        <h2 className={`font-bold text-center text-blue-600 ${energySwitchState.step === 'select_energy' ? 'text-xl mb-4' : 'text-sm mb-1'}`}>エネルギーつけかえ</h2>

                        {energySwitchState.step === 'select_source_pokemon' && (
                            <p className="text-center text-gray-800 font-bold">エネルギーが付いている自分のポケモンを選択してください</p>
                        )}

                        {energySwitchState.step === 'select_energy' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">移動させるエネルギーを1つ選んでください。</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-4 mb-8">
                                    {(energySwitchState.sourceType === 'battle' ? battleField : bench[energySwitchState.sourceIndex!])?.cards.map((card, i) => {
                                        const isTarget = isEnergy(card)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                                    ? 'ring-2 ring-blue-200 hover:ring-4 hover:ring-blue-400 hover:scale-105'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isTarget && handleEnergySwitchSelectEnergy(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={100} height={140} className="rounded shadow" unoptimized />
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={() => setEnergySwitchState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                                </div>
                            </>
                        )}

                        {energySwitchState.step === 'select_target_pokemon' && (
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-800 mb-1">つけ替え先の別のポケモンを選択してください</p>
                                <button onClick={() => setEnergySwitchState(null)} className="bg-gray-200 text-gray-800 font-bold px-4 py-1 text-xs rounded-full">キャンセル</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* エネルギー回収 Modal */}
            {energyRetrievalState && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-2 text-center text-blue-600">エネルギー回収</h2>
                        <p className="text-gray-600 text-center mb-6 text-sm">トラッシュから基本エネルギーを2枚まで選んでください。<br />(青色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-2 mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {energyRetrievalState.candidates.map((card, i) => {
                                const isTarget = isEnergy(card) && !card.subtypes?.includes('Special')
                                const isSelected = energyRetrievalState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-blue-600 scale-110 z-10'
                                                : 'ring-2 ring-blue-200 hover:ring-4 hover:ring-blue-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleEnergyRetrievalSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                {energyRetrievalState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleEnergyRetrievalConfirm}
                                className="bg-blue-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-blue-700"
                            >
                                {energyRetrievalState.selectedIndices.length > 0 ? `決定 (${energyRetrievalState.selectedIndices.length}枚)` : '対象なし・中止'}
                            </button>
                            <button onClick={() => setEnergyRetrievalState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">戻る</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ヨルノズク Modal */}
            {noctowlState && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-2 text-center text-yellow-600">ヨルノズク: ほうせきさがし</h2>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からトレーナーズを2枚まで選んでください。<br />(黄色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-2 mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {noctowlState.candidates.map((card, i) => {
                                const isTarget = isTrainer(card)
                                const isSelected = noctowlState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-yellow-600 scale-110 z-10'
                                                : 'ring-2 ring-yellow-200 hover:ring-4 hover:ring-yellow-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleNoctowlSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-yellow-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                {noctowlState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleNoctowlConfirm}
                                className="bg-yellow-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-yellow-700"
                            >
                                {noctowlState.selectedIndices.length > 0 ? `決定 (${noctowlState.selectedIndices.length}枚)` : '対象なし・戻す'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* メガルカリオex Modal & Overlay */}
            {megaLucarioEXAttackState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-colors duration-300 ${megaLucarioEXAttackState.step === 'select_energy' ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl animate-fade-in-up overflow-y-auto pointer-events-auto ${megaLucarioEXAttackState.step === 'select_energy'
                        ? 'p-6 max-w-4xl w-full max-h-[90vh]'
                        : 'fixed bottom-24 p-4 max-w-sm border-2 border-orange-500'
                        }`}>
                        <h2 className={`font-bold text-center text-orange-600 ${megaLucarioEXAttackState.step === 'select_energy' ? 'text-xl mb-2' : 'text-sm mb-1'}`}>メガルカリオex: はどうづき</h2>

                        {megaLucarioEXAttackState.step === 'select_energy' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">トラッシュから基本闘エネルギーを3枚まで選んでください。<br />(オレンジ色の枠のカードが選択可能です)</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-2 mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                    {megaLucarioEXAttackState.candidates.map((card, i) => {
                                        const isTarget = isEnergy(card) && card.name.includes('基本闘エネルギー')
                                        const isSelected = megaLucarioEXAttackState.selectedIndices.includes(i)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                                    ? isSelected
                                                        ? 'ring-[6px] ring-orange-600 scale-110 z-10'
                                                        : 'ring-2 ring-orange-200 hover:ring-4 hover:ring-orange-400 hover:scale-105'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isTarget && handleMegaLucarioEXSelectEnergy(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded shadow" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute -top-3 -right-3 bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                        {megaLucarioEXAttackState.selectedIndices.indexOf(i) + 1}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={handleMegaLucarioEXConfirmEnergy}
                                        className="bg-orange-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-700 disabled:opacity-50"
                                        disabled={megaLucarioEXAttackState.selectedIndices.length === 0}
                                    >
                                        付ける先を選ぶ ({megaLucarioEXAttackState.selectedIndices.length}枚)
                                    </button>
                                    <button onClick={() => setMegaLucarioEXAttackState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">戻る</button>
                                </div>
                            </>
                        )}

                        {megaLucarioEXAttackState.step === 'attach_energy' && (
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-800 mb-1">
                                    {megaLucarioEXAttackState.attachingIndex + 1}枚目: 付けるベンチポケモンを直接クリックしてください
                                </p>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="relative">
                                        <Image
                                            src={megaLucarioEXAttackState.candidates[megaLucarioEXAttackState.selectedIndices[megaLucarioEXAttackState.attachingIndex]].imageUrl}
                                            alt="attaching" width={60} height={84} className="rounded shadow-lg border-2 border-orange-500 animate-pulse" unoptimized
                                        />
                                    </div>
                                    <button onClick={() => setMegaLucarioEXAttackState(null)} className="bg-gray-200 text-gray-800 font-bold px-4 py-1 text-xs rounded-full">キャンセル</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Iron Leaves ex (Rapid Vernier) Overlay */}
            {ironLeavesEXState && ironLeavesEXState.active && (
                <div className="fixed inset-0 z-[1000] pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce pointer-events-auto border-2 border-white">
                        <h3 className="font-bold text-center">テツノイサハex: ラピッドバーニア</h3>
                        <p className="text-xs text-green-50 text-center mt-1">
                            エネルギーが付いている自分のポケモンをクリックして、<br />
                            テツノイサハexへエネルギーを移動させてください。
                        </p>
                        <button
                            onClick={() => setIronLeavesEXState(null)}
                            className="mt-3 w-full bg-white text-green-600 font-bold py-1 rounded-lg text-sm hover:bg-green-50"
                        >
                            移動を終了する
                        </button>
                    </div>
                </div>
            )}

            {/* Ultra Ball Modal */}
            {ultraBallState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-yellow-600 flex-1 text-center ml-8">ハイパーボール</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        {ultraBallState.step === 'discard' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">トラッシュする手札を2枚選んでください。</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8">
                                    {ultraBallState.candidates.map((card, i) => {
                                        const isSelected = ultraBallState.handIndices.includes(i)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSelected ? 'ring-4 ring-yellow-500 scale-105 z-10' : 'hover:scale-105'
                                                    }`}
                                                onClick={() => handleUltraBallDiscardSelection(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={100} height={140} className="rounded-lg shadow" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                                        <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white">
                                                            ✓
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={handleUltraBallConfirmDiscard}
                                        className="bg-yellow-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-yellow-600 disabled:opacity-50"
                                        disabled={ultraBallState.handIndices.length !== 2}
                                    >
                                        2枚トラッシュして山札を見る
                                    </button>
                                    <button onClick={() => setUltraBallState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                                </div>
                            </>
                        )}

                        {ultraBallState.step === 'search' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">山札からポケモンを1枚選んでください。<br />(緑色の枠のカードが選択可能です)</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                    {remaining.map((card, i) => {
                                        const isTarget = isPokemon(card)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                                    ? 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-110 z-10'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isTarget && handleUltraBallSearchSelect(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={80} height={112} className="rounded-lg shadow" unoptimized />
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={handleUltraBallCancel} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">対象なし・中止</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Dawn (ヒカリ) Modal */}
            {dawnState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-blue-600 flex-1 text-center ml-8">ヒカリ</h2>
                            <button onClick={() => setPeekDeckSearch(true)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からたね、1進化、2進化をそれぞれ1枚ずつ選んでください。<br />(緑色の枠のカードが選択可能です)</p>
                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {remaining.map((card, i) => {
                                const isTarget = isPokemon(card)
                                const isSelected = dawnState.selectedIndices.includes(i)
                                return (
                                    <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget ? (isSelected ? 'ring-[6px] ring-blue-500 scale-110 z-10' : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105') : 'opacity-40 grayscale pointer-events-none'}`} onClick={() => isTarget && handleDawnSelect(i)}>
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center">{dawnState.selectedIndices.indexOf(i) + 1}</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleDawnConfirm} className="bg-blue-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-blue-700">
                                {dawnState.selectedIndices.length > 0 ? `${dawnState.selectedIndices.length}枚を手札に加える` : '対象なし・決定'}
                            </button>
                            <button onClick={handleDawnCancel} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fan Call (ファンコール) Modal */}
            {fanCallState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-700 flex-1 text-center ml-8">ファンコール</h2>
                            <button onClick={() => setPeekDeckSearch(true)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からHP100以下の無色ポケモンを3枚まで選んでください。<br />(緑色の枠のポケモンが選択可能です)</p>
                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {remaining.map((card, i) => {
                                const isTarget = isPokemon(card)
                                const isSelected = fanCallState.selectedIndices.includes(i)
                                return (
                                    <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget ? (isSelected ? 'ring-[6px] ring-gray-500 scale-110 z-10' : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105') : 'opacity-40 grayscale pointer-events-none'}`} onClick={() => isTarget && handleFanCallSelect(i)}>
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-gray-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center">{fanCallState.selectedIndices.indexOf(i) + 1}</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleFanCallConfirm} className="bg-gray-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-gray-700">
                                {fanCallState.selectedIndices.length > 0 ? `${fanCallState.selectedIndices.length}枚を手札に加える` : '対象なし・決定'}
                            </button>
                            <button onClick={handleFanCallCancel} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Glass Trumpet (ガラスのラッパ) UI */}
            {glassTrumpetState && (
                glassTrumpetState.step === 'select_energy' ? (
                    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up overflow-y-auto">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-cyan-600">ガラスのラッパ</h2>
                                <p className="text-gray-600 text-sm mt-2">
                                    トラッシュから基本エネルギーを2枚選んでください。
                                </p>
                            </div>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8">
                                {glassTrumpetState.candidates.map((card, i) => {
                                    const isSelected = glassTrumpetState.selectedEnergyIndices.includes(i)
                                    return (
                                        <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSelected ? 'ring-4 ring-cyan-500 scale-105 z-10' : 'hover:scale-105'}`} onClick={() => handleGlassTrumpetEnergySelect(i)}>
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                                    <div className="bg-cyan-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white">{glassTrumpetState.selectedEnergyIndices.indexOf(i) + 1}</div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={handleGlassTrumpetConfirmEnergy} className="bg-cyan-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-cyan-700 disabled:opacity-50" disabled={glassTrumpetState.selectedEnergyIndices.length === 0}>
                                    付けるポケモンを選ぶ ({glassTrumpetState.selectedEnergyIndices.length}枚)
                                </button>
                                <button onClick={() => setGlassTrumpetState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[2000] animate-bounce-in w-full max-w-lg px-4">
                        <div className="bg-cyan-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border-2 border-cyan-400 backdrop-blur-md bg-opacity-90">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="flex -space-x-4 flex-shrink-0">
                                    {glassTrumpetState.selectedEnergyIndices.map((idx, i) => (
                                        <div key={i} className="relative">
                                            <div className="w-10 h-14 rounded overflow-hidden border-2 border-white shadow-lg">
                                                <Image src={trash[idx].imageUrl} alt="energy" width={40} height={56} className="object-cover" unoptimized />
                                            </div>
                                            {i === 0 && <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">次</div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-black text-sm sm:text-base tracking-wider truncate">対象のポケモンを選択してください</span>
                                    <span className="text-cyan-100 text-[10px] sm:text-xs font-bold">ベンチのポケモンをクリックしてエネルギーを付けます</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setGlassTrumpetState(null)}
                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors flex-shrink-0"
                                title="キャンセル"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )
            )}

            {/* Raging Bolt ex (タケルライコex) UI */}
            {ragingBoltState && (
                <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up overflow-y-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-red-600">きょくらいごう (タケルライコex)</h2>
                            <p className="text-gray-600 text-sm mt-2">
                                自分の場のポケモンについている基本エネルギーを好きなだけ選び、トラッシュしてください。
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Battle Field */}
                            {battleField && battleField.cards.some((c, i) => i > 0 && isEnergy(c) && (c.subtypes?.includes('Basic') || !c.subtypes?.includes('Special'))) && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                    <h3 className="text-red-700 font-bold mb-3 text-center">バトル場</h3>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {battleField.cards.map((card, i) => {
                                            if (i === 0) return null // Skip the Pokemon card itself
                                            if (!(isEnergy(card) && (card.subtypes?.includes('Basic') || !card.subtypes?.includes('Special')))) return null
                                            const isSelected = ragingBoltState.selectedEnergies.some(e => e.source === 'battle' && e.cardIndex === i)
                                            return (
                                                <div key={i} className={`relative cursor-pointer transition-all ${isSelected ? 'ring-4 ring-red-500 scale-105' : 'hover:scale-105 opacity-60'}`} onClick={() => handleExtremeAscentToggleEnergy('battle', 0, i, card)}>
                                                    <Image src={card.imageUrl} alt={card.name} width={60} height={84} className="rounded shadow" unoptimized />
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                                            <div className="bg-red-500 text-white p-1 rounded-full">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Bench */}
                            {bench.map((stack, benchIdx) => {
                                if (!stack || !stack.cards.some((c, i) => i > 0 && isEnergy(c) && (c.subtypes?.includes('Basic') || !c.subtypes?.includes('Special')))) return null
                                return (
                                    <div key={benchIdx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="text-gray-700 font-bold mb-3 text-center">ベンチ {benchIdx + 1}</h3>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {stack.cards.map((card, i) => {
                                                if (i === 0) return null
                                                if (!(isEnergy(card) && (card.subtypes?.includes('Basic') || !card.subtypes?.includes('Special')))) return null
                                                const isSelected = ragingBoltState.selectedEnergies.some(e => e.source === 'bench' && e.targetIndex === benchIdx && e.cardIndex === i)
                                                return (
                                                    <div key={i} className={`relative cursor-pointer transition-all ${isSelected ? 'ring-4 ring-red-500 scale-105' : 'hover:scale-105 opacity-60'}`} onClick={() => handleExtremeAscentToggleEnergy('bench', benchIdx, i, card)}>
                                                        <Image src={card.imageUrl} alt={card.name} width={60} height={84} className="rounded shadow" unoptimized />
                                                        {isSelected && (
                                                            <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                                                <div className="bg-red-500 text-white p-1 rounded-full">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={handleExtremeAscentConfirm} className="bg-red-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-red-700">
                                {ragingBoltState.selectedEnergies.length > 0 ? `${ragingBoltState.selectedEnergies.length}枚をトラッシュする` : 'トラッシュせずに終了'}
                            </button>
                            <button onClick={() => setRagingBoltState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tera Orb (テラスタルオーブ) Modal */}
            {teraOrbState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-indigo-700 flex-1 text-center ml-8">テラスタルオーブ</h2>
                            <button onClick={() => setPeekDeckSearch(true)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からポケモンを1枚選んでください。<br />(緑色の枠のカードが選択可能です)</p>
                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {remaining.map((card, i) => {
                                const isTarget = isPokemon(card)
                                return (
                                    <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget ? 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-110 z-10' : 'opacity-40 grayscale pointer-events-none'}`} onClick={() => isTarget && handleTeraOrbSelect(i)}>
                                        <Image src={card.imageUrl} alt={card.name} width={80} height={112} className="rounded-lg shadow" unoptimized />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-center">
                            <button onClick={() => { setRemaining(prev => [...prev].sort(() => Math.random() - 0.5)); setTeraOrbState(null); alert("山札をシャッフルしました"); }} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">対象なし・中止</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Brock's Scout (タケシのスカウト) Modal */}
            {brocksScoutState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-stone-800 flex-1 text-center ml-8">タケシのスカウト</h2>
                            <button onClick={() => setPeekDeckSearch(true)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からたねポケモンを2枚まで、または進化ポケモンを1枚選んでください。<br />(緑色の枠のポケモンが選択可能です)</p>
                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {remaining.map((card, i) => {
                                const isTarget = isPokemon(card)
                                const isSelected = brocksScoutState.selectedIndices.includes(i)
                                return (
                                    <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget ? (isSelected ? 'ring-[6px] ring-stone-600 scale-110 z-10' : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105 shadow-[0_0_15px_rgba(74,222,128,0.5)]') : 'opacity-40 grayscale pointer-events-none'}`} onClick={() => isTarget && handleBrocksScoutSelect(i)}>
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-stone-800 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center">{brocksScoutState.selectedIndices.indexOf(i) + 1}</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleBrocksScoutConfirm} className="bg-stone-800 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-stone-900">
                                {brocksScoutState.selectedIndices.length > 0 ? `${brocksScoutState.selectedIndices.length}枚を手札に加える` : '対象なし・決定'}
                            </button>
                            <button onClick={() => { setRemaining(prev => [...prev].sort(() => Math.random() - 0.5)); setBrocksScoutState(null); alert("山札をシャッフルしました"); }} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Buddy-Buddy Poffin Modal */}
            {
                poffinState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-pink-600 flex-1 text-center ml-8">なかよしポフィン</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">山札からHP70以下のたねポケモンを2枚まで選んでください。<br />(緑色の枠のポケモンが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {remaining.map((card, i) => {
                                    const isTarget = isPokemon(card) // HP check not possible with current data
                                    const isSelected = poffinState.selectedIndices.includes(i)
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                                ? isSelected
                                                    ? 'ring-[6px] ring-pink-500 scale-110 z-10'
                                                    : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isTarget && handlePoffinSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-pink-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center">
                                                    {poffinState.selectedIndices.indexOf(i) + 1}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handlePoffinConfirm}
                                    className="bg-pink-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-pink-600"
                                >
                                    {poffinState.selectedIndices.length > 0 ? `${poffinState.selectedIndices.length}枚をベンチに出す` : '対象なし・決定'}
                                </button>
                                <button onClick={() => setPoffinState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Touko Modal */}
            {
                toukoState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-green-600 flex-1 text-center ml-8">トウコ</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">山札から進化ポケモンとエネルギーを1枚ずつ選んでください。<br />(青い枠のカードが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {remaining.map((card, i) => {
                                    const canSelectPokemon = isPokemon(card)
                                    const canSelectEnergy = isEnergy(card)
                                    const isSelected = toukoState.selectedPokemonIndex === i || toukoState.selectedEnergyIndex === i
                                    const isSelectable = canSelectPokemon || canSelectEnergy

                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSelectable
                                                ? isSelected
                                                    ? 'ring-[6px] ring-green-600 scale-110 z-10'
                                                    : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isSelectable && handleToukoSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleToukoConfirm}
                                    className="bg-green-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-green-700"
                                >
                                    決定
                                </button>
                                <button onClick={() => setToukoState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Fight Gong Modal */}
            {
                fightGongState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-orange-600 flex-1 text-center ml-8">ファイトゴング</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">山札から闘タイプのたねポケモンまたは基本エネルギーを1枚選んでください。<br />(青い枠のカードが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {remaining.map((card, i) => {
                                    const isTarget = isPokemon(card) || isEnergy(card)
                                    const isSelected = fightGongState.selectedIndex === i
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                                ? isSelected
                                                    ? 'ring-[6px] ring-orange-500 scale-110 z-10'
                                                    : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isTarget && handleFightGongSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleFightGongConfirm}
                                    className="bg-orange-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-600"
                                >
                                    決定
                                </button>
                                <button onClick={() => setFightGongState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Rocket's Lambda Modal */}
            {
                lambdaState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-purple-600 flex-1 text-center ml-8">ロケット団のラムダ</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">山札からトレーナーズを2枚まで選んでください。<br />(青い枠のカードが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {lambdaState.candidates.map((card, i) => {
                                    const isSearchTarget = isTrainer(card)
                                    const isSelected = lambdaState.selectedIndex === i
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSearchTarget
                                                ? isSelected
                                                    ? 'ring-[6px] ring-purple-600 scale-110 z-10'
                                                    : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isSearchTarget && handleLambdaSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleLambdaConfirm}
                                    className="bg-purple-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-purple-700"
                                >
                                    決定
                                </button>
                                <button onClick={() => setLambdaState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Night Stretcher Modal */}
            {
                nightStretcherState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-indigo-900 flex-1 text-center ml-8">夜のタンカ</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">トラッシュからポケモンまたは基本エネルギーを1枚選んでください。<br />(青い枠のカードが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {nightStretcherState.candidates.map((card, i) => {
                                    const isRecoverTarget = isPokemon(card) || isEnergy(card)
                                    const isSelected = nightStretcherState.selectedIndex === i
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isRecoverTarget
                                                ? isSelected
                                                    ? 'ring-[6px] ring-indigo-900 scale-110 z-10'
                                                    : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isRecoverTarget && handleNightStretcherSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-indigo-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleNightStretcherConfirm}
                                    className="bg-indigo-900 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-indigo-800"
                                >
                                    決定
                                </button>
                                <button onClick={() => setNightStretcherState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Poke Pad Modal */}
            {
                pokePadState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-blue-600 flex-1 text-center ml-8">ポケパッド</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">
                                山札からポケモン（「ルールを持つポケモン」をのぞく）を1枚選んでください。<br />
                                (青色の枠のカードが選択可能です)
                            </p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {pokePadState.map((card, i) => {
                                    const isSearchTarget = isPokemon(card) && !isRuleBox(card)
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSearchTarget
                                                ? 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isSearchTarget && handlePokePadSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={90} height={126} className="rounded-lg shadow" unoptimized />
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center">
                                <button onClick={() => setPokePadState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">閉じる</button>
                            </div>
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
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-blue-600 flex-1 text-center ml-8">ポケギア3.0</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">手札に加えるカードを1枚選んでください。<br />（選ばなかったカードは山札に戻してシャッフルされます）</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {pokegearCards.map((card, i) => (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer hover:scale-105 transition-transform w-fit mx-auto"
                                        onClick={() => handlePokegearSelect(i)}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            手札に加える
                                        </div>
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={100}
                                            height={140}
                                            className="rounded-lg shadow-lg border-2 border-transparent hover:border-blue-500"
                                            unoptimized
                                        />
                                        <div className="mt-1 text-center text-[10px] font-bold text-gray-700 truncate w-[100px]">{card.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={handlePokegearCancel}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-6 py-2 rounded-full shadow-sm"
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

            {/* Peek Restoration Layer */}
            {peekDeckSearch && (
                <div
                    className="fixed inset-0 z-[2000] cursor-pointer group"
                    onClick={() => setPeekDeckSearch(false)}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white px-8 py-4 rounded-full font-bold shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        タップして戻る
                    </div>
                </div>
            )}



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

