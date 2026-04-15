import { Dispatch, SetStateAction } from 'react'
import { type Card, shuffle } from '@/lib/deckParser'
import { CardStack, createStack, getTopCard, isEnergy, isTool, isPokemon, isTrainer, isSupporter } from '@/lib/cardStack'
import {
    type RagingBoltState,
    type DawnState,
    type FanCallState,
    type GlassTrumpetState,
    type TeraOrbState,
    type BrocksScoutState,
    type LambdaState,
    type NightStretcherState,
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
    type GenesectState,
    type ArchaludonState,
    type NoctowlState,
    type MegaLucarioEXAttackState,
    type PreciousCarrierState,
    type PrimeCatcherState,
    type PecharuntState,
    type FlareonState,
    type MunkidoriState,
    type UltraBallState,
    type PoffinState,
    type ToukoState,
    type FightGongState,
    type AkamatsuState,
} from '@/components/practice/types'

export interface CardEffectHandlerParams {
    // Core game state
    hand: Card[]
    setHand: Dispatch<SetStateAction<Card[]>>
    remaining: Card[]
    setRemaining: Dispatch<SetStateAction<Card[]>>
    trash: Card[]
    setTrash: Dispatch<SetStateAction<Card[]>>
    battle: CardStack | null
    setBattle: Dispatch<SetStateAction<CardStack | null>>
    battleField: CardStack | null
    setBattleField: Dispatch<SetStateAction<CardStack | null>>
    bench: (CardStack | null)[]
    setBench: Dispatch<SetStateAction<(CardStack | null)[]>>
    benchSize: number
    prizeCards: Card[]

    // Card effect states
    ragingBoltState: RagingBoltState | null
    setRagingBoltState: Dispatch<SetStateAction<RagingBoltState | null>>
    dawnState: DawnState | null
    setDawnState: Dispatch<SetStateAction<DawnState | null>>
    fanCallState: FanCallState | null
    setFanCallState: Dispatch<SetStateAction<FanCallState | null>>
    glassTrumpetState: GlassTrumpetState | null
    setGlassTrumpetState: Dispatch<SetStateAction<GlassTrumpetState | null>>
    teraOrbState: TeraOrbState | null
    setTeraOrbState: Dispatch<SetStateAction<TeraOrbState | null>>
    brocksScoutState: BrocksScoutState | null
    setBrocksScoutState: Dispatch<SetStateAction<BrocksScoutState | null>>
    lambdaState: LambdaState | null
    setLambdaState: Dispatch<SetStateAction<LambdaState | null>>
    nightStretcherState: NightStretcherState | null
    setNightStretcherState: Dispatch<SetStateAction<NightStretcherState | null>>
    tatsugiriState: TatsugiriState | null
    setTatsugiriState: Dispatch<SetStateAction<TatsugiriState | null>>
    ogerponState: OgerponState | null
    setOgerponState: Dispatch<SetStateAction<OgerponState | null>>
    zoroarkState: ZoroarkState | null
    setZoroarkState: Dispatch<SetStateAction<ZoroarkState | null>>
    meowthEXState: MeowthEXState | null
    setMeowthEXState: Dispatch<SetStateAction<MeowthEXState | null>>
    ironLeavesEXState: IronLeavesEXState | null
    setIronLeavesEXState: Dispatch<SetStateAction<IronLeavesEXState | null>>
    nPointUpState: NPointUpState | null
    setNPointUpState: Dispatch<SetStateAction<NPointUpState | null>>
    cyanoState: CyanoState | null
    setCyanoState: Dispatch<SetStateAction<CyanoState | null>>
    ogerponWellspringState: OgerponWellspringState | null
    setOgerponWellspringState: Dispatch<SetStateAction<OgerponWellspringState | null>>
    bugCatchingSetState: BugCatchingSetState | null
    setBugCatchingSetState: Dispatch<SetStateAction<BugCatchingSetState | null>>
    energySwitchState: EnergySwitchState | null
    setEnergySwitchState: Dispatch<SetStateAction<EnergySwitchState | null>>
    energyRetrievalState: EnergyRetrievalState | null
    setEnergyRetrievalState: Dispatch<SetStateAction<EnergyRetrievalState | null>>
    genesectState: GenesectState | null
    setGenesectState: Dispatch<SetStateAction<GenesectState | null>>
    archaludonState: ArchaludonState | null
    setArchaludonState: Dispatch<SetStateAction<ArchaludonState | null>>
    noctowlState: NoctowlState | null
    setNoctowlState: Dispatch<SetStateAction<NoctowlState | null>>
    megaLucarioEXAttackState: MegaLucarioEXAttackState | null
    setMegaLucarioEXAttackState: Dispatch<SetStateAction<MegaLucarioEXAttackState | null>>
    preciousCarrierState: PreciousCarrierState | null
    setPreciousCarrierState: Dispatch<SetStateAction<PreciousCarrierState | null>>
    primeCatcherState: PrimeCatcherState | null
    setPrimeCatcherState: Dispatch<SetStateAction<PrimeCatcherState | null>>
    pecharuntState: PecharuntState | null
    setPecharuntState: Dispatch<SetStateAction<PecharuntState | null>>
    flareonState: FlareonState | null
    setFlareonState: Dispatch<SetStateAction<FlareonState | null>>
    munkidoriState: MunkidoriState | null
    setMunkidoriState: Dispatch<SetStateAction<MunkidoriState | null>>
    ultraBallState: UltraBallState | null
    setUltraBallState: Dispatch<SetStateAction<UltraBallState | null>>
    poffinState: PoffinState | null
    setPoffinState: Dispatch<SetStateAction<PoffinState | null>>
    toukoState: ToukoState | null
    setToukoState: Dispatch<SetStateAction<ToukoState | null>>
    fightGongState: FightGongState | null
    setFightGongState: Dispatch<SetStateAction<FightGongState | null>>
    akamatsuState: {
        step: 'select_two' | 'select_for_hand' | 'select_target'
        candidates: Card[]
        selectedIndices: number[]
        forHandIndex: number | null
    } | null
    setAkamatsuState: Dispatch<SetStateAction<AkamatsuState | null>>
    teisatsuCards: Card[] | null
    setTeisatsuCards: Dispatch<SetStateAction<Card[] | null>>
    pokegearCards: Card[] | null
    setPokegearCards: Dispatch<SetStateAction<Card[] | null>>
    pokePadState: Card[] | null
    setPokePadState: Dispatch<SetStateAction<Card[] | null>>

    // Turn tracking
    okunoteUsedThisTurn: boolean
    setOkunoteUsedThisTurn: Dispatch<SetStateAction<boolean>>
    munkidoriUsedThisTurn: boolean
    setMunkidoriUsedThisTurn: Dispatch<SetStateAction<boolean>>
    lunacycleUsedThisTurn: boolean
    setLunacycleUsedThisTurn: Dispatch<SetStateAction<boolean>>
    pecharuntUsedThisTurn: boolean
    setPecharuntUsedThisTurn: Dispatch<SetStateAction<boolean>>
    fanCallUsedThisTurn: boolean
    setFanCallUsedThisTurn: Dispatch<SetStateAction<boolean>>
    megaBraveUsedLastTurn: boolean
    setMegaBraveUsedLastTurn: Dispatch<SetStateAction<boolean>>

    // Utilities
    showToast: (msg: string) => void
    moveToTrash: (index: number) => void
    shuffleDeck: () => void
    setSwapMode: Dispatch<SetStateAction<any>>
    setDamageSelector: Dispatch<SetStateAction<any>>
    setOnBoardSelection: Dispatch<SetStateAction<any>>

    // External callbacks
    onEffectTrigger?: (effect: 'judge' | 'apollo' | 'unfair_stamp' | 'boss_orders' | 'special_red_card' | 'xerosic', amount?: number) => void
    onAttackTrigger?: (damage: number, targetType: 'battle' | 'bench', targetIndex: number) => void
}

export function useCardEffectHandlers(params: CardEffectHandlerParams) {
    const {
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
    } = params

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
                // playToBattleField(selectedIndex) // Wait, `playToBattleField` expects index in HAND.
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
            onAttackTrigger?.(100, 'battle', 0)

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

        // Finalize
        setRemaining(prev => shuffle([...prev, ...selectedCards]))
        setBattleField(prev => {
            if (!prev) return null
            const newCards = prev.cards.filter((_, i) => !ogerponWellspringState.selectedIndices.includes(i))
            return { ...prev, cards: newCards, energyCount: prev.energyCount - cost }
        })

        showToast("エネルギーを山札に戻しました。ベンチへのダメージを選択してください。")
        setOgerponWellspringState(null)

        // Open damage selector specifically for 120 damage to bench
        setDamageSelector({
            isOpen: true,
            source: 'bench',
            index: 0, // Will be handled by the UI or just use generic apply
            damage: 120
        })
        // Note: For sniper attacks like this, ideally we'd have a specific target selection.
        // For now, opening the generic selector is okay, or we can just send it if simple.
        // User said "bench" can select, so generic selector is good.
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
        const isAnyPokemon = isPokemon(card)
        const isBasicGrassEnergy = isEnergy(card) && card.name.includes('基本草エネルギー')

        if (!isAnyPokemon && !isBasicGrassEnergy) {
            alert("ポケモンまたは基本草エネルギーを選択してください")
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

    // --- Mega Kangaskhan ex (Otsukai Dash) Logic ---
    const useKangaskhanEX = (source: 'battle' | 'bench', index: number) => {
        if (source !== 'battle') {
            alert("この特性はバトル場にいるときしか使えません")
            return
        }
        if (remaining.length === 0) {
            alert("山札がありません")
            return
        }

        const drawCount = Math.min(2, remaining.length)
        const drew = remaining.slice(0, drawCount)
        setRemaining(prev => prev.slice(drawCount))
        setHand(prev => [...prev, ...drew])
        showToast(`おつかいダッシュ: ${drawCount}枚引きました`)
    }

    // --- Genesect ex (Metal Signal) Logic ---
    const useGenesectEX = () => {
        setGenesectState({
            step: 'search',
            candidates: [...remaining],
            selectedIndices: []
        })
    }

    const handleGenesectSelect = (index: number) => {
        if (!genesectState) return
        const card = remaining[index]
        // Note: Currently we don't have strict type data in Card object,
        // but user can filter or we just let them pick any Pokemon as per Metal Signal.
        if (!isPokemon(card)) {
            alert("ポケモンを選択してください")
            return
        }

        setGenesectState(prev => {
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

    const handleGenesectConfirm = () => {
        if (!genesectState) return
        const selectedCards = genesectState.selectedIndices.map(idx => remaining[idx])
        setHand(prev => [...prev, ...selectedCards])
        setRemaining(prev => shuffle(prev.filter((_, i) => !genesectState.selectedIndices.includes(i))))
        showToast(`メタルシグナル: ${selectedCards.length}枚を手札に加えました`)
        setGenesectState(null)
    }

    // --- Archaludon ex (Alloy Build) Logic ---
    const useArchaludonEX = (handIndex?: number) => {
        // Find Steel Energies in trash
        const steelEnergies = trash.filter(c => c.supertype === 'Energy' && c.name.includes('基本鋼'))
        if (steelEnergies.length === 0) {
            alert("トラッシュに基本鋼エネルギーがありません")
            return
        }

        if (handIndex !== undefined) {
            // If used from hand (to evolve), move it to trash first?
            // Usually evolution happens by drag-drop.
            // If manually triggered, we assume it's already on board or being played.
        }

        setArchaludonState({
            step: 'select_energy',
            candidates: [...trash],
            selectedEnergyIndices: [],
            target: null
        })
    }

    const handleArchaludonEnergySelect = (index: number) => {
        if (!archaludonState) return
        const card = trash[index]
        if (!(card.supertype === 'Energy' && card.name.includes('基本鋼'))) {
            alert("基本鋼エネルギーを選択してください")
            return
        }
        setArchaludonState(prev => {
            if (!prev) return null
            const current = [...prev.selectedEnergyIndices]
            const foundIdx = current.indexOf(index)
            if (foundIdx !== -1) {
                current.splice(foundIdx, 1)
            } else if (current.length < 2) {
                current.push(index)
            }
            return { ...prev, selectedEnergyIndices: current }
        })
    }

    const handleArchaludonTargetSelect = (type: 'battle' | 'bench', index: number) => {
        if (!archaludonState) return
        const selectedEnergies = archaludonState.selectedEnergyIndices.map(idx => trash[idx])

        // Attach energy to target
        if (type === 'battle') {
            setBattle(prev => {
                if (!prev) return prev
                return {
                    ...prev,
                    cards: [...prev.cards, ...selectedEnergies],
                    energyCount: prev.energyCount + selectedEnergies.length
                }
            })
        } else {
            setBench(prev => {
                const newBench = [...prev]
                const stack = newBench[index]
                if (stack) {
                    newBench[index] = {
                        ...stack,
                        cards: [...stack.cards, ...selectedEnergies],
                        energyCount: stack.energyCount + selectedEnergies.length
                    }
                }
                return newBench
            })
        }

        // Remove from trash
        setTrash(prev => prev.filter((_, i) => !archaludonState.selectedEnergyIndices.includes(i)))
        showToast(`ごうきんビルド: エネ加速しました`)
        setArchaludonState(null)
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

        // 1. Send 130 damage to opponent's battle field
        showToast("波動突き: 相手のバトル場に130ダメージ")
        onAttackTrigger?.(130, 'battle', 0)

        // 2. Start Energy Acceleration step
        const fightingEnergies = trash.filter(c => isEnergy(c) && c.name.includes('基本闘エネルギー'))
        if (fightingEnergies.length === 0) {
            showToast("トラッシュに基本闘エネルギーがないため、追加効果はスキップします")
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
        // 1. Send 130 damage to opponent's battle field
        showToast("バーニングチャージ: 相手のバトル場に130ダメージ")
        onAttackTrigger?.(130, 'battle', 0)

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

    // --- ルナサイクル (Luna Cycle) Logic ---
    const useLunaCycle = (source: 'battle' | 'bench', index?: number) => {
        if (lunacycleUsedThisTurn) {
            alert("「ルナサイクル」は既にこの番に使われています")
            return
        }

        const energyInHand = hand.findIndex(c => isEnergy(c) && c.name.includes('基本闘エネルギー'))
        if (energyInHand === -1) {
            alert("手札に「基本闘エネルギー」がありません")
            return
        }

        if (confirm("手札の「基本闘エネルギー」を1枚トラッシュして、山札を3枚引きますか？")) {
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

    // Rocket Gang Actions
    const useCarmine = (playedIndex?: number) => {
        let cardsToTrash = [...hand];
        if (playedIndex !== undefined) {
            cardsToTrash.splice(playedIndex, 1);
            setTrash(prev => [...prev, hand[playedIndex], ...cardsToTrash]);
        } else {
            setTrash(prev => [...prev, ...cardsToTrash]);
        }

        setHand([]);

        const drawCount = Math.min(5, remaining.length);
        const drew = remaining.slice(0, drawCount);
        setRemaining(prev => prev.slice(drawCount));
        setHand(drew);

        showToast("ゼイユ: 手札をすべてトラッシュし、5枚引きました");
    }

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
            onSelect: (type: 'battle' | 'bench', targetIndex: number) => {
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

    // Rocket Gang helpers
    const isRocketPokemon = (c: Card): boolean => {
        return isPokemon(c) && (
            c.name.includes('ロケット団') ||
            c.name.includes('Rocket') ||
            c.name.includes('R団')
        )
    }

    const getTopPokemon = (stack: CardStack | null): Card | null => {
        if (!stack || stack.cards.length === 0) return null
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

    return {
        handleCursedBomb,
        handlePsychicDraw,
        handleBurstingRoar,
        handleExtremeAscentToggleEnergy,
        handleExtremeAscentConfirm,
        handleDawnSelect,
        handleDawnConfirm,
        handleDawnCancel,
        handleFanCallSelect,
        handleFanCallConfirm,
        handleFanCallCancel,
        handleGlassTrumpetEnergySelect,
        handleGlassTrumpetConfirmEnergy,
        handleGlassTrumpetTargetSelect,
        handleTeraOrbSelect,
        handleBrocksScoutSelect,
        handleBrocksScoutConfirm,
        useLillie,
        useTeisatsuShirei,
        handleTeisatsuSelect,
        usePokegear,
        handlePokegearSelect,
        handlePokegearCancel,
        useLambda,
        handleLambdaSelect,
        handleLambdaConfirm,
        useNightStretcher,
        handleNightStretcherSelect,
        handleNightStretcherConfirm,
        useTatsugiri,
        handleTatsugiriSelect,
        handleTatsugiriConfirm,
        useOgerpon,
        handleOgerponSelect,
        handleOgerponConfirm,
        useZoroark,
        handleZoroarkSelect,
        handleZoroarkConfirm,
        useFezandipiti,
        useDudunsparce,
        useMeowthEX,
        handleMeowthEXSelect,
        handleMeowthEXConfirm,
        useIronLeavesEX,
        handleIronLeavesEXClickPokemon,
        useNPointUp,
        handleNPointUpSelectEnergy,
        handleNPointUpConfirmEnergy,
        handleNPointUpClickPokemon,
        useCyano,
        handleCyanoSelect,
        handleCyanoConfirm,
        useOgerponWellspring,
        handleOgerponWellspringSelectCost,
        handleOgerponWellspringConfirmCost,
        useBugCatchingSet,
        handleBugCatchingSetSelect,
        handleBugCatchingSetConfirm,
        useEnergySwitch,
        handleEnergySwitchClickPokemon,
        handleEnergySwitchSelectEnergy,
        useEnergyRetrieval,
        handleEnergyRetrievalSelect,
        handleEnergyRetrievalConfirm,
        useKangaskhanEX,
        useGenesectEX,
        handleGenesectSelect,
        handleGenesectConfirm,
        useArchaludonEX,
        handleArchaludonEnergySelect,
        handleArchaludonTargetSelect,
        useNoctowl,
        handleNoctowlSelect,
        handleNoctowlConfirm,
        useMegaLucarioEX,
        handleMegaLucarioEXSelectEnergy,
        handleMegaLucarioEXConfirmEnergy,
        handleMegaLucarioEXAttachClick,
        handleMegaLucarioEnergySelect,
        startMegaLucarioEnergyAttachment,
        applyMegaLucarioEnergy,
        resetMegaBrave,
        usePreciousCarrier,
        handlePreciousCarrierSelect,
        handlePreciousCarrierConfirm,
        usePrimeCatcher,
        handlePrimeCatcherOpponentClick,
        usePokemonSwitch,
        usePecharuntChainOfCommand,
        handlePecharuntSelectTarget,
        useFlareonBurningCharge,
        handleFlareonSelectEnergy,
        handleFlareonConfirmEnergy,
        handleFlareonAttachClick,
        useMunkidoriAdrenalBrain,
        handleMunkidoriSourceClick,
        handleMunkidoriConfirmCount,
        handleMunkidoriTargetClick,
        useLunaCycle,
        useUltraBall,
        handleUltraBallDiscardSelection,
        handleUltraBallConfirmDiscard,
        handleUltraBallSearchSelect,
        handleUltraBallCancel,
        usePoffin,
        handlePoffinSelect,
        handlePoffinConfirm,
        useBossOrders,
        useTouko,
        handleToukoSelect,
        handleToukoConfirm,
        useFightGong,
        handleFightGongSelect,
        handleFightGongConfirm,
        useCarmine,
        useJudge,
        useApollo,
        useAthena,
        useUnfairStamp,
        handleAkamatsuSelectEnergy,
        handleAkamatsuConfirmTwo,
        handleAkamatsuSelectForHand,
    }
}
