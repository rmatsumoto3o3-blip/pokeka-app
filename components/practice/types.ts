import { type Card } from '@/lib/deckParser'
import { type CardStack } from '@/lib/cardStack'

// ============================================================
// Props & Ref
// ============================================================

export interface DeckPracticeProps {
    deck: Card[]
    onReset: () => void
    playerName?: string
    compact?: boolean
    stadium?: Card | null
    onStadiumChange?: (stadium: Card | null) => void
    onEffectTrigger?: (effect: 'judge' | 'apollo' | 'unfair_stamp' | 'boss_orders' | 'special_red_card' | 'xerosic', amount?: number) => void
    onAttackTrigger?: (damage: number, targetType: 'battle' | 'bench', targetIndex: number) => void
    idPrefix?: string
    mobile?: boolean
    isOpponent?: boolean
    isActive?: boolean
}

export interface DeckPracticeRef {
    handleExternalDragEnd: (event: any) => void
    playStadium: (index: number) => void
    switchPokemon: (benchIndex: number) => void
    receiveEffect: (effect: 'judge' | 'apollo' | 'unfair_stamp' | 'boss_orders' | 'apply_damage' | 'special_red_card' | 'xerosic', amount?: number, targetType?: 'battle' | 'bench', targetIndex?: number) => void
    startSelection: (config: { title: string; onSelect: (type: 'battle' | 'bench', index: number) => void }) => void
    getPrizeCount: () => number
}

// ============================================================
// UI State Types
// ============================================================

export interface MenuState {
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

export interface SwapState {
    active: boolean
    sourceIndex: number
    sourceType: 'battle' | 'bench'
}

export interface DeckMenuState {
    index: number
    x: number
    y: number
    align?: 'up' | 'down'
}

export interface AttachMode {
    active: boolean
    card: Card
    sourceIndex: number
}

export interface AttachmentTarget {
    type: 'battle' | 'bench'
    index: number
}

export interface DetailModalState {
    stack: CardStack
    type: 'battle' | 'bench'
    index: number
}

// ============================================================
// Card Effect State Types
// ============================================================

export interface UltraBallState {
    step: 'discard' | 'search'
    candidates: Card[]
    handIndices: number[]
}

export interface PoffinState {
    step: 'search'
    candidates: Card[]
    selectedIndices: number[]
}

export interface ToukoState {
    step: 'search'
    candidates: Card[]
    selectedPokemonIndex: number | null
    selectedEnergyIndex: number | null
}

export interface FightGongState {
    step: 'search'
    candidates: Card[]
    selectedIndex: number | null
}

export interface LambdaState {
    step: 'search'
    candidates: Card[]
    selectedIndex: number | null
}

export interface NightStretcherState {
    step: 'select'
    candidates: Card[]
    selectedIndex: number | null
}

export interface GenesectState {
    step: 'search'
    candidates: Card[]
    selectedIndices: number[]
}

export interface ArchaludonState {
    step: 'select_energy' | 'select_target'
    candidates: Card[]
    selectedEnergyIndices: number[]
    target: { type: 'battle' | 'bench'; index: number } | null
}

export interface TatsugiriState {
    step: 'search'
    candidates: Card[]
    selectedIndex: number | null
}

export interface OgerponState {
    step: 'select_energy'
    candidates: Card[]
    selectedIndex: number | null
    targetSource: string
    targetIndex: number
}

export interface ZoroarkState {
    step: 'discard'
    candidates: Card[]
    selectedIndex: number | null
}

export interface MeowthEXState {
    step: 'search'
    candidates: Card[]
    selectedIndex: number | null
}

export interface IronLeavesEXState {
    active: boolean
    targetType: 'battle' | 'bench'
    targetIndex: number
}

export interface NPointUpState {
    step: 'select_energy' | 'select_target'
    candidates: Card[]
    selectedIndex: number | null
}

export interface CyanoState {
    step: 'search'
    candidates: Card[]
    selectedIndices: number[]
}

export interface OgerponWellspringState {
    active: boolean
    step: 'select_cost'
    selectedIndices: number[]
}

export interface BugCatchingSetState {
    step: 'search'
    candidates: Card[]
    selectedIndices: number[]
}

export interface EnergySwitchState {
    step: 'select_source_pokemon' | 'select_energy' | 'select_target_pokemon'
    sourceType: 'battle' | 'bench' | null
    sourceIndex: number | null
    energyIndex: number | null
    targetType: 'battle' | 'bench' | null
    targetIndex: number | null
}

export interface EnergyRetrievalState {
    step: 'select'
    candidates: Card[]
    selectedIndices: number[]
}

export interface NoctowlState {
    step: 'search'
    candidates: Card[]
    selectedIndices: number[]
}

export interface MegaLucarioEXAttackState {
    step: 'select_energy' | 'attach_energy'
    candidates: Card[]
    selectedIndices: number[]
    attachingIndex: number
}

export interface PreciousCarrierState {
    step: 'search'
    candidates: Card[]
    selectedIndices: number[]
}

export interface PrimeCatcherState {
    step: 'select_opponent' | 'select_own'
    opponentIndex: number | null
}

export interface PecharuntState {
    step: 'select_target'
}

export interface FlareonState {
    step: 'search' | 'attach'
    candidates: Card[]
    selectedIndices: number[]
    attachingIndex: number
}

export interface MunkidoriState {
    step: 'select_source' | 'select_count' | 'select_target'
    sourceType: 'battle' | 'bench' | null
    sourceIndex: number | null
    count: number
}

export interface DawnState {
    step: 'search'
    candidates: Card[]
    selectedIndices: number[]
}

export interface FanCallState {
    step: 'search'
    candidates: Card[]
    selectedIndices: number[]
}

export interface GlassTrumpetState {
    step: 'select_energy' | 'select_target'
    candidates: Card[]
    selectedEnergyIndices: number[]
    targetBenchIndices: number[]
}

export interface TeraOrbState {
    step: 'search'
    candidates: Card[]
    selectedIndex: number | null
}

export interface BrocksScoutState {
    step: 'search'
    candidates: Card[]
    selectedIndices: number[]
}

export interface RagingBoltState {
    step: 'select_energy'
    selectedEnergies: {
        source: 'battle' | 'bench'
        targetIndex: number
        cardIndex: number
        card: Card
    }[]
}

export interface AkamatsuState {
    step: 'select_two' | 'select_for_hand' | 'select_target'
    candidates: Card[]
    selectedIndices: number[]
    forHandIndex: number | null
}
