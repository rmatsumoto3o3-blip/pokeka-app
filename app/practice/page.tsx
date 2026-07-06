'use client'

import { useState, useEffect, Suspense, useRef, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { fetchDeckData, buildDeck, shuffle, type Card } from '@/lib/deckParser'
import { createStack, type CardStack } from '@/lib/cardStack'
import DeckPractice, { type DeckPracticeRef, CascadingStack } from '../../components/DeckPractice'
import CoinTossOverlay from '../../components/CoinTossOverlay'
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragStartEvent,
    DragEndEvent,
    useDraggable,
    useDroppable,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { VIRTUAL_PRACTICE_DECKS, type VirtualPracticeDeckCard } from '@/lib/practiceVirtualDecks'
import { CABT_CARD_CATALOG, type CabtCardCatalogEntry } from '@/lib/cabtCardCatalog'

type CabtCard = {
    cardId?: number
    serial?: number
    hp?: number
    maxHp?: number
    damageCounter?: number
    energyCount?: number
    toolCount?: number
    energy?: (CabtCard | null)[]
    tools?: (CabtCard | null)[]
}

type CabtPlayer = {
    deckCount?: number
    handCount?: number
    prizeCount?: number
    discardCount?: number
    hand?: (CabtCard | null)[]
    discard?: (CabtCard | null)[]
    active?: (CabtCard | null)[]
    bench?: (CabtCard | null)[]
}

type CabtOption = {
    typeName?: string
    areaName?: string
    inPlayAreaName?: string
    card?: CabtCard | null
    inPlayCard?: CabtCard | null
    number?: number
    index?: number
    inPlayIndex?: number
    playerIndex?: number
}

type CabtLog = {
    typeName?: string
    playerIndex?: number
    cardId?: number
    cardIdTarget?: number
    cardIdActive?: number
    cardIdBench?: number
    cardIdBefore?: number
    cardIdAfter?: number
    attackId?: number
    value?: number
    result?: number
    reason?: number
    head?: boolean
    fromAreaName?: string
    toAreaName?: string
}

type CabtPayload = {
    ok?: boolean
    error?: string
    hint?: string
    sessionId?: string | null
    logPath?: string | null
    state?: {
        turn?: number
        turnActionCount?: number
        yourIndex?: number
        result?: number
        players?: CabtPlayer[]
    } | null
    select?: {
        typeName?: string
        contextName?: string
        minCount?: number
        maxCount?: number
        remainDamageCounter?: number
        remainEnergyCost?: number
        deck?: (CabtCard | null)[]
        looking?: (CabtCard | null)[]
        options?: CabtOption[]
    } | null
    logs?: CabtLog[]
}

type ActiveDragData =
    | { type: 'counter'; amount: number; card?: never }
    | { type?: string; amount?: never; card?: Card | CardStack }

type SavedPracticeDeckLine = {
    cardId: number
    quantity: number
}

type SavedPracticeDeck = {
    id: string
    name: string
    cards: SavedPracticeDeckLine[]
    createdAt: string
    updatedAt: string
}

const SAVED_PRACTICE_DECKS_KEY = 'pokelix_practice_saved_decks'
const CPU_BATTLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CPU_BATTLE === '1'

const VIRTUAL_CARD_META_BY_ID = new Map<number, VirtualPracticeDeckCard>(
    VIRTUAL_PRACTICE_DECKS.flatMap(deck => deck.cards.map(card => [card.id, card] as const))
)

const cabtMetaById = (cardId: number): CabtCardCatalogEntry | VirtualPracticeDeckCard | undefined => {
    return CABT_CARD_CATALOG[cardId] ?? VIRTUAL_CARD_META_BY_ID.get(cardId)
}

const cabtCardNameById = (cardId: number): string | undefined => {
    return cabtMetaById(cardId)?.name
}

const savedDeckToCards = (deck: SavedPracticeDeck): Card[] => {
    return deck.cards.flatMap(line => {
        const meta = cabtMetaById(line.cardId)
        const name = meta?.name ?? `カード #${line.cardId}`
        return Array.from({ length: line.quantity }, () => ({
            name,
            imageUrl: meta?.imageUrl ?? cabtPlaceholderImage(name, line.cardId),
            supertype: meta?.supertype ?? 'Pokémon',
            subtypes: meta?.subtypes ? [...meta.subtypes] : undefined,
            hp: typeof meta?.hp === 'number' ? meta.hp : undefined,
            cardId: line.cardId,
        }))
    })
}

const savedDeckToCardIds = (deck: SavedPracticeDeck): number[] => {
    return deck.cards.flatMap(line => Array.from({ length: line.quantity }, () => line.cardId))
}

const isBasicEnergyEntry = (entry?: CabtCardCatalogEntry | VirtualPracticeDeckCard) => {
    return entry?.supertype === 'Energy' && Boolean(entry.subtypes?.some(subtype => subtype === 'Basic Energy'))
}

const isAceSpecEntry = (entry?: CabtCardCatalogEntry | VirtualPracticeDeckCard) => {
    return Boolean(entry?.name.includes('ACE SPEC') || entry?.subtypes?.some(subtype => subtype.includes('ACE SPEC')))
}

const sanitizeSavedPracticeDecks = (value: unknown): SavedPracticeDeck[] => {
    if (!Array.isArray(value)) return []

    return value.flatMap(item => {
        if (!item || typeof item !== 'object') return []
        const record = item as Record<string, unknown>
        const cards = Array.isArray(record.cards)
            ? record.cards.flatMap(line => {
                if (!line || typeof line !== 'object') return []
                const cardLine = line as Record<string, unknown>
                const cardId = Number(cardLine.cardId)
                const quantity = Number(cardLine.quantity)
                if (!Number.isInteger(cardId) || !Number.isInteger(quantity)) return []
                if (cardId <= 0 || quantity <= 0 || quantity > 60) return []
                return [{ cardId, quantity }]
            })
            : []
        const total = cards.reduce((sum, line) => sum + line.quantity, 0)

        if (typeof record.id !== 'string' || typeof record.name !== 'string') return []
        if (cards.length === 0 || total !== 60) return []

        return [{
            id: record.id.slice(0, 120),
            name: record.name.slice(0, 120),
            cards,
            createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
            updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toISOString(),
        }]
    })
}

const isCabtEnergyCard = (card?: CabtCard | null) => {
    if (typeof card?.cardId !== 'number') return false
    return cabtMetaById(card.cardId)?.supertype === 'Energy'
}

const isCabtToolCard = (card?: CabtCard | null) => {
    if (typeof card?.cardId !== 'number') return false
    const meta = cabtMetaById(card.cardId)
    return Boolean(meta?.subtypes?.some(subtype => subtype === 'Pokémon Tool' || subtype.includes('どうぐ')))
}

const CABT_CONTEXT_JA: Record<string, string> = {
    IS_FIRST: '先攻・後攻を選ぶ',
    SETUP_ACTIVE_POKEMON: '最初のバトルポケモンを選ぶ',
    SETUP_BENCH_POKEMON: '最初のベンチポケモンを選ぶ',
    MAIN: '自分の番の行動を選ぶ',
    ATTACK: 'ワザを選ぶ',
    RETREAT: 'にげる対象を選ぶ',
    POKEMON_CHECKUP: 'ポケモンチェック',
    EVOLVES_TO: '進化させるポケモンを選ぶ',
    SEARCH_CARD: 'カードを選ぶ',
    SELECT_CARD: 'カードを選ぶ',
    DISCARD: 'トラッシュするカードを選ぶ',
    DRAW_COUNT: '引く枚数を選ぶ',
    DAMAGE_COUNTER_COUNT: 'のせるダメカンの数を選ぶ',
    REMOVE_DAMAGE_COUNTER_COUNT: '取りのぞくダメカンの数を選ぶ',
}

const CABT_CONTEXT_HELP: Record<string, string> = {
    IS_FIRST: '先攻か後攻を選んでください。',
    SETUP_ACTIVE_POKEMON: '手札の画像から、最初にバトル場へ出すたねポケモンを選んでください。',
    SETUP_BENCH_POKEMON: '最初にベンチへ置くポケモンを選んでください。置かない場合は「選ばない」を押します。',
    MAIN: '光っているカードを押すと、そのカードでできる操作が出ます。',
    ATTACK: '使うワザを選んでください。攻撃後の処理は公式エンジン側で進みます。',
    RETREAT: 'にげる対象や支払うエネルギーを画像で選んでください。',
    POKEMON_CHECKUP: 'ポケモンチェックの処理を進めます。',
    EVOLVES_TO: '進化させる盤面のポケモンを直接選んでください。',
    SEARCH_CARD: '山札や見ているカードから、手札に加えるカードを画像で選んでください。',
    SELECT_CARD: '効果で選ぶカードを画像で選んでください。',
    DISCARD: 'トラッシュするカードを画像で選んでください。',
    DRAW_COUNT: '引く枚数を選んでください。',
    DAMAGE_COUNTER_COUNT: 'のせるダメカンの数を選んでください。',
    REMOVE_DAMAGE_COUNTER_COUNT: '取りのぞくダメカンの数を選んでください。',
}

const CABT_AREA_JA: Record<string, string> = {
    HAND: '手札',
    ACTIVE: 'バトル場',
    BENCH: 'ベンチ',
    DISCARD: 'トラッシュ',
    DECK: '山札',
    LOOKING: '見ているカード',
    PRIZE: 'サイド',
}

const CABT_CPU_AGENT_BY_DECK: Record<string, string> = {
    alakazam_deck: 'agent/alakazam_main.py',
    alakazam_kadoraba_night_mine_deck: 'agent/alakazam_kadoraba_main.py',
    alakazam_night_mine_deck: 'agent/alakazam_main.py',
    alakazam_third_ptcg_deck: 'agent/alakazam_third_ptcg_main.py',
    alakazam_tubotu_deck: 'agent/alakazam_tubotu_main.py',
    bomb_lopunny_deck: 'agent/mega_lopunny_main.py',
    chandelure_control_deck: 'agent/chandelure_control_main.py',
    crustle_deck: 'agent/crustle_main.py',
    deck: 'agent/main.py',
    festival_deck: 'agent/festival_main.py',
    froslass_starmie_deck: 'agent/froslass_starmie_main.py',
    hibiki_crustle_deck: 'agent/hibiki_crustle_main.py',
    hibiki_typhlosion_deck: 'agent/hibiki_typhlosion_main.py',
    hop_trevenant_deck: 'agent/hop_trevenant_main.py',
    iono_lightning_deck: 'agent/iono_lightning_main.py',
    mega_abomasnow_deck: 'agent/mega_abomasnow_main.py',
    mega_lopunny_deck: 'agent/mega_lopunny_main.py',
    mega_lucario_deck: 'agent/mega_lucario_main.py',
    mega_starmie_deck: 'agent/mega_starmie_main.py',
    rocket_honchkrow_deck: 'agent/rocket_honchkrow_main.py',
    rocket_spidops_deck: 'agent/rocket_spidops_main.py',
    solrock_lunatone_deck: 'agent/solrock_lunatone_main.py',
    walrein_control_deck: 'agent/walrein_control_main.py',
}

const cabtCardLabel = (card?: CabtCard | null) => {
    if (!card) return '-'
    const name = typeof card.cardId === 'number' ? cabtCardNameById(card.cardId) : undefined
    const hp = typeof card.hp === 'number' ? ` HP${card.hp}` : ''
    const dmg = typeof card.damageCounter === 'number' && card.damageCounter > 0 ? ` dmg${card.damageCounter}` : ''
    const energy = typeof card.energyCount === 'number' && card.energyCount > 0 ? ` E${card.energyCount}` : ''
    return `${name ?? `#${card.cardId ?? '?'}`}${hp}${dmg}${energy}`
}

const cabtCardName = (card?: CabtCard | null) => {
    if (!card) return '空き'
    return typeof card.cardId === 'number' ? cabtCardNameById(card.cardId) ?? `カード #${card.cardId}` : 'カード'
}

const cabtHpSummary = (card?: CabtCard | null) => {
    if (!card) return null
    const meta = typeof card.cardId === 'number' ? cabtMetaById(card.cardId) : undefined
    const maxHp = typeof card.maxHp === 'number'
        ? card.maxHp
        : typeof meta?.hp === 'number'
            ? meta.hp
            : typeof card.hp === 'number'
                ? card.hp
                : undefined
    if (typeof maxHp !== 'number') return null
    const damage = typeof card.damageCounter === 'number' ? card.damageCounter * 10 : 0
    const remaining = typeof card.hp === 'number' ? card.hp : Math.max(0, maxHp - damage)
    return {
        remaining: Math.max(0, remaining),
        max: maxHp,
        damaged: damage > 0 || remaining < maxHp,
    }
}

function cabtPlaceholderImage(name: string, id: number): string {
    const safeName = name
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="504" viewBox="0 0 360 504">
        <rect width="360" height="504" rx="24" fill="#f8fafc"/>
        <rect x="18" y="18" width="324" height="468" rx="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
        <text x="180" y="210" text-anchor="middle" font-size="27" font-weight="700" fill="#0f172a" font-family="sans-serif">${safeName}</text>
        <text x="180" y="258" text-anchor="middle" font-size="20" fill="#64748b" font-family="sans-serif">#${id}</text>
    </svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function cabtCardToUiCard(card?: CabtCard | null): Card {
    const cardId = card?.cardId ?? 0
    const meta = cabtMetaById(cardId)
    const name = meta?.name ?? `カード #${cardId || '?'}`
    return {
        name,
        imageUrl: meta?.imageUrl || cabtPlaceholderImage(name, cardId),
        supertype: meta?.supertype ?? 'Pokémon',
        subtypes: meta?.subtypes ? [...meta.subtypes] : undefined,
        hp: typeof card?.maxHp === 'number' ? card.maxHp : meta?.hp,
        cardId,
    }
}

function cabtCardToStack(card?: CabtCard | null): CardStack | null {
    if (!card) return null
    const damage = typeof card.damageCounter === 'number' ? card.damageCounter * 10 : 0
    return {
        cards: [cabtCardToUiCard(card)],
        energyCount: card.energyCount ?? 0,
        toolCount: card.toolCount ?? 0,
        damage,
        status: 'none',
    }
}

const cabtAreaLabel = (areaName?: string) => {
    return areaName ? CABT_AREA_JA[areaName] ?? areaName : ''
}

const cabtIsNumberSelect = (select?: CabtPayload['select'] | null) => {
    return select?.typeName === 'COUNT' || (select?.options ?? []).some(option => option.typeName === 'NUMBER')
}

const cabtNeedsSelectionBuffer = (select?: CabtPayload['select'] | null) => {
    if (!select || cabtIsNumberSelect(select)) return false
    if (select.contextName === 'SETUP_ACTIVE_POKEMON') return false
    return (select.maxCount ?? 1) > 1 || (select.minCount ?? 1) !== 1
}

const isCpuDeckCode = (value?: string) => value?.trim().toLowerCase() === 'cpu'

const cabtNumberOptionLabel = (option: CabtOption, contextName?: string, fallbackIndex = 0) => {
    const number = typeof option.number === 'number' ? option.number : fallbackIndex
    if (contextName === 'DRAW_COUNT') return number === 0 ? '引かない' : `${number}枚引く`
    if (contextName === 'DAMAGE_COUNTER_COUNT') return number === 0 ? 'のせない' : `${number}個のせる`
    if (contextName === 'REMOVE_DAMAGE_COUNTER_COUNT') return number === 0 ? '取りのぞかない' : `${number}個取りのぞく`
    return `${number}を選ぶ`
}

const cabtAttachActionLabel = (option: CabtOption, sourceCard?: CabtCard | null) => {
    const card = sourceCard ?? option.card
    if (isCabtEnergyCard(card)) return 'エネルギーをつける'
    if (isCabtToolCard(card)) return '道具をつける'
    return 'つける'
}

const cabtOptionActionLabel = (option: CabtOption, contextName?: string) => {
    if (contextName === 'IS_FIRST') {
        if (option.typeName === 'YES') return '先攻'
        if (option.typeName === 'NO') return '後攻'
    }
    if (option.typeName === 'YES') return 'はい'
    if (option.typeName === 'NO') return 'いいえ'
    if (option.typeName === 'END') return '番を終わる'
    if (option.typeName === 'NUMBER') return cabtNumberOptionLabel(option, contextName)
    if (option.typeName === 'ATTACH') return cabtAttachActionLabel(option)
    if (option.typeName === 'ATTACK') return 'ワザを使う'
    if (option.typeName === 'PLAY') return '使う / 出す'
    if (option.typeName === 'RETREAT') return 'にげる'
    if (contextName === 'EVOLVES_TO') return '進化する'
    if (contextName === 'TO_HAND' || contextName === 'SEARCH_CARD') return '手札に加える'
    if (contextName === 'DISCARD') return 'トラッシュ'
    return '選ぶ'
}

const cabtLogCardName = (cardId?: number) => {
    if (typeof cardId !== 'number') return 'カード'
    return cabtCardNameById(cardId) ?? `カード #${cardId}`
}

const cabtPlayerLabel = (playerIndex?: number) => {
    if (playerIndex === 0) return '自分'
    if (playerIndex === 1) return 'CPU'
    return '不明'
}

const cabtLogText = (log: CabtLog) => {
    const player = cabtPlayerLabel(log.playerIndex)
    const card = cabtLogCardName(log.cardId)
    switch (log.typeName) {
        case 'SHUFFLE':
            return `${player}が山札を切りました`
        case 'TURN_START':
            return `${player}の番が始まりました`
        case 'TURN_END':
            return `${player}が番を終わりました`
        case 'DRAW':
            return `${player}が${card}を引きました`
        case 'DRAW_REVERSE':
            return `${player}がカードを引きました`
        case 'MOVE_CARD':
            return `${player}: ${card}が${cabtAreaLabel(log.fromAreaName)}から${cabtAreaLabel(log.toAreaName)}へ移動`
        case 'MOVE_CARD_REVERSE':
            return `${player}: カードが${cabtAreaLabel(log.fromAreaName)}から${cabtAreaLabel(log.toAreaName)}へ移動`
        case 'SWITCH':
            return `${player}が${cabtLogCardName(log.cardIdActive)}と${cabtLogCardName(log.cardIdBench)}を入れ替えました`
        case 'CHANGE':
            return `${player}: ${cabtLogCardName(log.cardIdBefore)}が${cabtLogCardName(log.cardIdAfter)}になりました`
        case 'PLAY':
            return `${player}が${card}を使いました`
        case 'ATTACH':
            return `${player}が${card}を${cabtLogCardName(log.cardIdTarget)}につけました`
        case 'EVOLVE':
            return `${player}が${cabtLogCardName(log.cardIdTarget)}を${card}に進化させました`
        case 'ATTACK':
            return `${player}の${card}がワザを使いました`
        case 'HP_CHANGE':
            return `${player}の${card}のHPが${log.value ?? 0}変化しました`
        case 'COIN':
            return `コイン: ${log.head ? 'オモテ' : 'ウラ'}`
        case 'RESULT':
            return `対戦終了: P${log.result}勝利`
        default:
            return `${player}: ${log.typeName ?? '処理'}`
    }
}

const isCardStackValue = (value: Card | CardStack): value is CardStack => {
    return 'cards' in value
}

function PracticeContent() {
    const searchParams = useSearchParams()
    const [deckCode1, setDeckCode1] = useState(searchParams.get('code1') || '')
    const [deckCode2, setDeckCode2] = useState(searchParams.get('code2') || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deck1, setDeck1] = useState<Card[]>([])
    const [deck2, setDeck2] = useState<Card[]>([])
    const [stadium1, setStadium1] = useState<Card | null>(null)
    const [stadium2, setStadium2] = useState<Card | null>(null)
    const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null)
    const [isFlipping, setIsFlipping] = useState(false)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(null)
    const [loadCounter, setLoadCounter] = useState(0)
    const [cpuUnlocked, setCpuUnlocked] = useState(false)
    const [activePlayer, setActivePlayer] = useState<'player1' | 'player2'>('player1')
    const [gameResult, setGameResult] = useState<string | null>(null)
    const [cabtHumanDeckId, setCabtHumanDeckId] = useState<string>(VIRTUAL_PRACTICE_DECKS[0]?.id ?? 'deck')
    const [cabtCpuDeckId, setCabtCpuDeckId] = useState<string>(VIRTUAL_PRACTICE_DECKS[1]?.id ?? VIRTUAL_PRACTICE_DECKS[0]?.id ?? 'alakazam_deck')
    const [cabtActionText, setCabtActionText] = useState('')
    const [cabtPayload, setCabtPayload] = useState<CabtPayload | null>(null)
    const [cabtLoading, setCabtLoading] = useState(false)
    const [cabtError, setCabtError] = useState<string | null>(null)
    const [deckBuilderOpen, setDeckBuilderOpen] = useState(false)
    const [deckBuilderName, setDeckBuilderName] = useState('新しいデッキ')
    const [deckBuilderSearch, setDeckBuilderSearch] = useState('')
    const [deckBuilderCards, setDeckBuilderCards] = useState<Record<number, number>>({})
    const [savedPracticeDecks, setSavedPracticeDecks] = useState<SavedPracticeDeck[]>([])
    const [selectedSavedDeckId, setSelectedSavedDeckId] = useState('')
    const [firebaseDeckStatus, setFirebaseDeckStatus] = useState<'idle' | 'syncing' | 'saved' | 'local-only' | 'error'>('idle')
    const isCpuModeRequested = CPU_BATTLE_ENABLED && isCpuDeckCode(deckCode2)
    const canShowCpuUnlock = !deckCode1.trim() && isCpuModeRequested
    const canLoadDeckCodes = isCpuModeRequested ? Boolean(deckCode1.trim()) : Boolean(deckCode1.trim() || deckCode2.trim())

    const player1Ref = useRef<DeckPracticeRef>(null)
    const player2Ref = useRef<DeckPracticeRef>(null)

    useEffect(() => {
        try {
            const raw = localStorage.getItem(SAVED_PRACTICE_DECKS_KEY)
            if (!raw) return
            const parsed = sanitizeSavedPracticeDecks(JSON.parse(raw))
            if (parsed.length > 0) {
                setSavedPracticeDecks(parsed)
                setSelectedSavedDeckId(parsed[0]?.id ?? '')
            }
        } catch (err) {
            console.error('Failed to load saved practice decks', err)
            localStorage.removeItem(SAVED_PRACTICE_DECKS_KEY)
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const loadFirebaseDecks = async () => {
            setFirebaseDeckStatus('syncing')
            try {
                const response = await fetch('/api/practice-decks', { cache: 'no-store' })
                const data = await response.json().catch(() => ({})) as { ok?: boolean; decks?: SavedPracticeDeck[] }
                if (cancelled) return
                if (!response.ok || data.ok === false) {
                    setFirebaseDeckStatus('local-only')
                    return
                }
                const decks = sanitizeSavedPracticeDecks(data.decks)
                if (decks.length > 0) {
                    setSavedPracticeDecks(decks)
                    setSelectedSavedDeckId(current => current || decks[0]?.id || '')
                    try {
                        localStorage.setItem(SAVED_PRACTICE_DECKS_KEY, JSON.stringify(decks))
                    } catch (err) {
                        console.error('Failed to cache Firebase practice decks locally', err)
                    }
                }
                setFirebaseDeckStatus('saved')
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load Firebase practice decks', err)
                    setFirebaseDeckStatus('local-only')
                }
            }
        }

        void loadFirebaseDecks()

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        if (savedPracticeDecks.length === 0) return
        setCabtHumanDeckId(current => {
            if (current.startsWith('local:')) return current
            return `local:${savedPracticeDecks[0].id}`
        })
    }, [savedPracticeDecks])

    const syncPracticeDecksToFirebase = async (nextDecks: SavedPracticeDeck[]) => {
        setFirebaseDeckStatus('syncing')
        try {
            const response = await fetch('/api/practice-decks', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ decks: nextDecks }),
            })
            const data = await response.json().catch(() => ({})) as { ok?: boolean }
            if (!response.ok || data.ok === false) {
                setFirebaseDeckStatus('local-only')
                return
            }
            setFirebaseDeckStatus('saved')
        } catch (err) {
            console.error('Failed to sync Firebase practice decks', err)
            setFirebaseDeckStatus('error')
        }
    }

    const persistSavedPracticeDecks = (nextDecks: SavedPracticeDeck[]) => {
        setSavedPracticeDecks(nextDecks)
        try {
            localStorage.setItem(SAVED_PRACTICE_DECKS_KEY, JSON.stringify(nextDecks))
        } catch (err) {
            console.error('Failed to save practice decks locally', err)
            setFirebaseDeckStatus('error')
        }
        if (!selectedSavedDeckId && nextDecks[0]) setSelectedSavedDeckId(nextDecks[0].id)
        void syncPracticeDecksToFirebase(nextDecks)
    }

    const builderEntries = useMemo(() => {
        return Object.entries(deckBuilderCards)
            .map(([cardId, quantity]) => ({
                cardId: Number(cardId),
                quantity,
                entry: cabtMetaById(Number(cardId)),
            }))
            .filter(item => item.quantity > 0 && item.entry)
            .sort((a, b) => {
                const typeOrder = (entry?: CabtCardCatalogEntry | VirtualPracticeDeckCard) => {
                    if (entry?.supertype === 'Pokémon') return 0
                    if (entry?.supertype === 'Trainer') return 1
                    if (entry?.supertype === 'Energy') return 2
                    return 3
                }
                return typeOrder(a.entry) - typeOrder(b.entry) || (a.entry?.name ?? '').localeCompare(b.entry?.name ?? '', 'ja')
            })
    }, [deckBuilderCards])

    const builderTotal = builderEntries.reduce((sum, item) => sum + item.quantity, 0)
    const builderAceSpecCount = builderEntries.reduce((sum, item) => sum + (isAceSpecEntry(item.entry) ? item.quantity : 0), 0)
    const builderOverLimitEntries = builderEntries.filter(item => !isBasicEnergyEntry(item.entry) && item.quantity > 4)
    const builderIsValid = builderTotal === 60 && builderAceSpecCount <= 1 && builderOverLimitEntries.length === 0

    const searchableCabtCards = useMemo(() => {
        return Object.values(CABT_CARD_CATALOG)
            .filter(card => typeof card.cardId === 'number')
            .sort((a, b) => (a.cardId ?? 0) - (b.cardId ?? 0))
    }, [])

    const deckBuilderResults = useMemo(() => {
        const query = deckBuilderSearch.trim().toLowerCase()
        const pool = searchableCabtCards
        const filtered = query
            ? pool.filter(card => {
                const idText = String(card.cardId ?? '')
                return card.name.toLowerCase().includes(query) || idText === query || idText.includes(query)
            })
            : pool.slice(0, 36)
        return filtered.slice(0, 48)
    }, [deckBuilderSearch, searchableCabtCards])

    const setBuilderCardQuantity = (cardId: number, quantity: number) => {
        setDeckBuilderCards(current => {
            const next = { ...current }
            const clamped = Math.max(0, Math.min(60, quantity))
            if (clamped === 0) delete next[cardId]
            else next[cardId] = clamped
            return next
        })
    }

    const selectedSavedDeck = savedPracticeDecks.find(deck => deck.id === selectedSavedDeckId)

    const saveBuilderDeck = () => {
        const name = deckBuilderName.trim() || '無題デッキ'
        const now = new Date().toISOString()
        const cards = builderEntries.map(item => ({ cardId: item.cardId, quantity: item.quantity }))
        const existing = selectedSavedDeck
        const deck: SavedPracticeDeck = {
            id: existing?.id ?? `local-${Date.now()}`,
            name,
            cards,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        }
        const nextDecks = existing
            ? savedPracticeDecks.map(item => item.id === existing.id ? deck : item)
            : [deck, ...savedPracticeDecks]
        persistSavedPracticeDecks(nextDecks)
        setSelectedSavedDeckId(deck.id)
    }

    const loadSavedDeckIntoBuilder = (deck: SavedPracticeDeck) => {
        setDeckBuilderName(deck.name)
        setDeckBuilderCards(Object.fromEntries(deck.cards.map(line => [line.cardId, line.quantity])))
        setSelectedSavedDeckId(deck.id)
        setDeckBuilderOpen(true)
    }

    const loadSavedDeckToPlayer = (deck: SavedPracticeDeck, player: 'player1' | 'player2') => {
        const cards = shuffle(savedDeckToCards(deck))
        if (player === 'player1') {
            setDeck1(cards)
            setDeckCode1(deck.name)
        } else {
            setDeck2(cards)
            setDeckCode2(deck.name)
        }
        setError(null)
    }

    const unlockCpu = () => {
        setError(null)
        setCpuUnlocked(true)
    }


    const handleKnockOut = (defender: 'player1' | 'player2', prizeCount: number, fieldEmpty: boolean) => {
        const attacker = defender === 'player1' ? 'player2' : 'player1'
        const attackerRef = attacker === 'player1' ? player1Ref : player2Ref
        const beforePrizes = attackerRef.current?.getPrizeCount() ?? 0
        attackerRef.current?.takePrizes(prizeCount)

        if (fieldEmpty) {
            const winnerName = attacker === 'player1' ? 'あなた' : 'CPU'
            setGameResult(`${winnerName}の勝ち（相手の場にポケモンがいません）`)
            return
        }

        if (beforePrizes > 0 && beforePrizes - prizeCount <= 0) {
            const winnerName = attacker === 'player1' ? 'あなた' : 'CPU'
            setGameResult(`${winnerName}の勝ち（サイド取り切り）`)
        }
    }

    const postCabt = async (body: Record<string, unknown>) => {
        setCabtLoading(true)
        setCabtError(null)
        try {
            const response = await fetch('/api/local-cabt', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await response.json() as CabtPayload
            setCabtPayload(data)
            if (!response.ok || data.ok === false) {
                setCabtError(data.error || data.hint || 'cabtローカルエンジンへの接続に失敗しました')
            }
            return data
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            setCabtError(message)
            setCabtPayload({ ok: false, error: message })
            return null
        } finally {
            setCabtLoading(false)
        }
    }

    const startCabtBattle = () => {
        const customHumanDeck = cabtHumanDeckId.startsWith('local:')
            ? savedPracticeDecks.find(deck => `local:${deck.id}` === cabtHumanDeckId)
            : undefined
        void postCabt({
            command: 'start',
            humanDeckId: customHumanDeck ? customHumanDeck.id : cabtHumanDeckId,
            customHumanDeck: customHumanDeck ? savedDeckToCardIds(customHumanDeck) : undefined,
            cpuDeckId: cabtCpuDeckId,
            humanIndex: 0,
            cpuAgentPath: CABT_CPU_AGENT_BY_DECK[cabtCpuDeckId] ?? 'agent/alakazam_kadoraba_main.py',
        })
    }

    const sendCabtAction = (overrideAction?: number[]) => {
        if (cabtLoading || cabtPayload?.state?.result !== -1) return
        const action = overrideAction ?? cabtActionText
            .split(',')
            .map(value => Number(value.trim()))
            .filter(Number.isInteger)
        void postCabt({ command: 'select', action })
        setCabtActionText('')
    }

    const cabtSelect = cabtPayload?.select
    const cabtNeedsMultiSelect = cabtNeedsSelectionBuffer(cabtSelect)

    useEffect(() => {
        setCabtActionText('')
    }, [cabtPayload?.select?.contextName, cabtPayload?.select?.typeName])

    const handleCabtOptionClick = (index: number) => {
        if (cabtLoading || cabtPayload?.state?.result !== -1) return
        if (!cabtNeedsMultiSelect) {
            void postCabt({ command: 'select', action: [index] })
            setCabtActionText('')
            return
        }
        const current = cabtActionText
            .split(',')
            .map(value => value.trim())
            .filter(Boolean)
        const textIndex = String(index)
        const next = current.includes(textIndex)
            ? current.filter(value => value !== textIndex)
            : [...current, textIndex]
        setCabtActionText(next.join(','))
    }

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

    // Auto-load if deck codes are in URL
    useEffect(() => {
        const mode = searchParams.get('mode')
        const code1 = searchParams.get('code1')
        const code2 = searchParams.get('code2')

        const loadCustomDeck = () => {
            try {
                const customDeckJson = localStorage.getItem('pokeka_practice_custom_deck')
                if (customDeckJson) {
                    const cards = JSON.parse(customDeckJson)
                    // Validate card structure partially if needed, or rely on trust for local dev
                    // Build deck (expand quantities)
                    const fullDeck = buildDeck(cards)
                    if (fullDeck.length !== 60) {
                        setError(`カスタムデッキは60枚である必要があります（現在: ${fullDeck.length}枚）`)
                        return
                    }
                    setDeck1(shuffle(fullDeck))
                } else {
                    setError('カスタムデッキデータが見つかりませんでした')
                }
            } catch (e) {
                console.error('Failed to load custom deck', e)
                setError('カスタムデッキの読み込みに失敗しました')
            }
        }

        if (mode === 'custom') {
            loadCustomDeck()
            if (code2) {
                loadDecks(undefined, code2)
            }
        } else if (code1) {
            // Reload if code changed or deck is empty
            if (code1 !== deckCode1 || !deck1.length) {
                setDeckCode1(code1)
                setDeck1([]) // Clear current deck to avoid mixing or stale state visual
                loadDecks(code1, code2 || '')
            }
        }
    }, [searchParams])

    const loadDecks = async (code1?: string, code2?: string) => {
        setLoadCounter(prev => prev + 1)
        const targetCode1 = code1 || deckCode1
        const targetCode2 = code2 || deckCode2
        const targetCode2IsCpu = isCpuDeckCode(targetCode2)

        // If in custom mode, we might not have code1, so only skip if NEITHER exists and NOT custom mode
        // But simplified: just load what is requested.

        if (!targetCode1 && (!targetCode2 || targetCode2IsCpu)) return

        setLoading(true)
        setError(null)

        try {
            if (targetCode1) {
                const cards1 = await fetchDeckData(targetCode1)
                const fullDeck1 = buildDeck(cards1)
                if (fullDeck1.length !== 60) {
                    throw new Error(`デッキ1は60枚である必要があります（現在: ${fullDeck1.length}枚）`)
                }
                setDeck1(shuffle(fullDeck1))
            }

            if (targetCode2 && !targetCode2IsCpu) {
                const cards2 = await fetchDeckData(targetCode2)
                const fullDeck2 = buildDeck(cards2)
                if (fullDeck2.length !== 60) {
                    throw new Error(`デッキ2は60枚である必要があります（現在: ${fullDeck2.length}枚）`)
                }
                setDeck2(shuffle(fullDeck2))
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'デッキの読み込みに失敗しました')
            console.error('Failed to load deck:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveDragId(active.id as string)
        setActiveDragData(active.data.current as ActiveDragData | null)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveDragId(null)
        setActiveDragData(null)

        if (!over) return

        const targetId = over.id as string
        if (targetId === 'stadium-zone') {
            const source = active.data.current as { playerPrefix?: 'player1' | 'player2' } | undefined
            if (source?.playerPrefix === 'player1') {
                player1Ref.current?.handleExternalDragEnd(event)
            } else if (source?.playerPrefix === 'player2') {
                player2Ref.current?.handleExternalDragEnd(event)
            }
        } else if (targetId.startsWith('player1-')) {
            player1Ref.current?.handleExternalDragEnd(event)
        } else if (targetId.startsWith('player2-')) {
            player2Ref.current?.handleExternalDragEnd(event)
        }
    }

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false)

    // Stadium Menu
    const [showStadiumMenu, setShowStadiumMenu] = useState(false)

    const handleStadiumClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setShowStadiumMenu(!showStadiumMenu)
    }

    const trashStadium = () => {
        if (stadium1) setStadium1(null)
        if (stadium2) setStadium2(null)
        setShowStadiumMenu(false)
    }

    const handleReset = () => {
        setDeck1([])
        setDeck2([])
        setStadium1(null)
        setStadium2(null)
    }

    useEffect(() => {
        const handleClickOutside = () => setShowStadiumMenu(false)
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleEffectTrigger = (source: 'player1' | 'player2', effect: 'judge' | 'apollo' | 'unfair_stamp' | 'boss_orders' | 'special_red_card' | 'xerosic') => {
        const targetRef = source === 'player1' ? player2Ref : player1Ref

        if (effect === 'special_red_card') {
            const opponentPrizes = targetRef.current?.getPrizeCount() ?? 6
            if (opponentPrizes > 3) {
                alert(`スペシャルレッドカードを使用できません。（相手の残りサイドが ${opponentPrizes} 枚です。3枚以下の時にのみ使用可能です）`)
                return
            }
        }

        if (effect === 'boss_orders') {
            targetRef.current?.startSelection({
                title: 'ボスの指令: 入れ替えるベンチポケモンを選択してください',
                onSelect: (type, index) => {
                    if (type === 'bench') {
                        targetRef.current?.switchPokemon(index)
                    } else {
                        alert("ベンチポケモンを選択してください")
                    }
                }
            })
            return
        }

        targetRef.current?.receiveEffect(effect)
    }

    const handleCoinFlip = () => {
        if (isFlipping) return
        setCoinResult(null) // Reset before new flip
        setTimeout(() => {
            setCoinResult(Math.random() < 0.5 ? 'heads' : 'tails')
            setIsFlipping(true)
        }, 10)
    }

    return (
        <div 
          className="h-[100dvh] md:h-auto md:min-h-screen p-1 sm:p-4 pb-[env(safe-area-inset-bottom)] overflow-y-auto md:overflow-auto flex flex-col transition-colors duration-700"
          style={{
            backgroundColor: '#0a0a0c',
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(30, 30, 50, 0.4) 0%, rgba(10, 10, 12, 1) 100%),
              linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px'
          }}
        >
            <div className="max-w-[1800px] mx-auto w-full relative z-10">
                {/* Header - Hidden on mobile for space */}
                <div className="mb-2 md:mb-4 flex justify-between items-center hidden md:flex">
                    <div>
                        <h1 className="text-lg md:text-3xl font-bold text-white flex items-center gap-2">
                            <Image
                                src="/Lucario.png"
                                alt="Practice"
                                width={36}
                                height={36}
                                className="w-6 h-6 md:w-8 md:h-8"
                            />
                            1人回し練習
                        </h1>
                        <p className="text-xs md:text-sm text-gray-400 hidden md:block">
                            デッキコードを入力して、対戦練習を始めましょう
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleReset}
                            className="p-2 bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all"
                            title="全てをリセット"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Deck Code Input */}
                {(!deck1.length || !deck2.length) && (
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Deck 1 Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    デッキ1（自分）
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={deckCode1}
                                        onChange={(e) => setDeckCode1(e.target.value)}
                                        placeholder="デッキコードを入力"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Deck 2 Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    デッキ2（相手）
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={deckCode2}
                                        onChange={(e) => setDeckCode2(e.target.value)}
                                        placeholder="デッキコードを入力"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                                {canShowCpuUnlock && (
                                    <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700">
                                        CPU対戦モードを開きます。通常のデッキ2読み込みは行いません。
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => loadDecks()}
                            disabled={loading || !canLoadDeckCodes}
                            className="mt-4 w-full px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? '読み込み中...' : isCpuModeRequested ? 'デッキ1を読み込む' : 'デッキを読み込む'}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="text-sm font-black text-gray-900">デッキ作成</div>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                                        <span>カードを検索して60枚デッキを保存できます。</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                            firebaseDeckStatus === 'saved'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : firebaseDeckStatus === 'syncing'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : firebaseDeckStatus === 'error'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {firebaseDeckStatus === 'saved'
                                                ? 'Firebase同期済み'
                                                : firebaseDeckStatus === 'syncing'
                                                    ? 'Firebase同期中'
                                                    : firebaseDeckStatus === 'error'
                                                        ? 'Firebase同期失敗'
                                                        : 'ローカル保存'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDeckBuilderOpen(value => !value)}
                                    className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-black text-white transition hover:bg-gray-700"
                                >
                                    {deckBuilderOpen ? '閉じる' : 'デッキを組む'}
                                </button>
                            </div>

                            {savedPracticeDecks.length > 0 && (
                                <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
                                    <select
                                        value={selectedSavedDeckId}
                                        onChange={(event) => setSelectedSavedDeckId(event.target.value)}
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-purple-400"
                                    >
                                        {savedPracticeDecks.map(deck => (
                                            <option key={deck.id} value={deck.id}>
                                                {deck.name} / {deck.cards.reduce((sum, line) => sum + line.quantity, 0)}枚
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        disabled={!selectedSavedDeck}
                                        onClick={() => selectedSavedDeck && loadSavedDeckIntoBuilder(selectedSavedDeck)}
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-black text-gray-700 transition hover:border-purple-300 hover:text-purple-700 disabled:opacity-40"
                                    >
                                        編集
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!selectedSavedDeck}
                                        onClick={() => selectedSavedDeck && loadSavedDeckToPlayer(selectedSavedDeck, 'player1')}
                                        className="rounded-lg bg-purple-500 px-3 py-2 text-xs font-black text-white transition hover:bg-purple-600 disabled:opacity-40"
                                    >
                                        自分で使う
                                    </button>
                                    {!isCpuModeRequested && (
                                        <button
                                            type="button"
                                            disabled={!selectedSavedDeck}
                                            onClick={() => selectedSavedDeck && loadSavedDeckToPlayer(selectedSavedDeck, 'player2')}
                                            className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-600 disabled:opacity-40"
                                        >
                                            相手に使う
                                        </button>
                                    )}
                                </div>
                            )}

                            {deckBuilderOpen && (
                                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
                                    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3">
                                        <div className="grid gap-2 md:grid-cols-[1fr_220px]">
                                            <input
                                                type="search"
                                                value={deckBuilderSearch}
                                                onChange={(event) => setDeckBuilderSearch(event.target.value)}
                                                placeholder="カード名またはIDで検索"
                                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-purple-400"
                                            />
                                            <input
                                                type="text"
                                                value={deckBuilderName}
                                                onChange={(event) => setDeckBuilderName(event.target.value)}
                                                placeholder="デッキ名"
                                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-purple-400"
                                            />
                                        </div>

                                        <div className="mt-3 grid max-h-[520px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                                            {deckBuilderResults.map(card => {
                                                const quantity = deckBuilderCards[card.cardId ?? 0] ?? 0
                                                return (
                                                    <div key={`builder-card-${card.cardId}`} className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                                                        <Image
                                                            src={card.imageUrl}
                                                            alt={card.name}
                                                            width={120}
                                                            height={168}
                                                            className="mx-auto aspect-[5/7] w-full max-w-[96px] rounded bg-white object-contain shadow"
                                                            unoptimized
                                                        />
                                                        <div className="mt-1 line-clamp-2 min-h-[28px] text-center text-[11px] font-black leading-tight text-gray-900">
                                                            {card.name}
                                                        </div>
                                                        <div className="mt-1 text-center text-[10px] font-bold text-gray-500">
                                                            #{card.cardId} / {card.supertype}
                                                        </div>
                                                        <div className="mt-2 flex items-center justify-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => setBuilderCardQuantity(card.cardId ?? 0, quantity - 1)}
                                                                className="flex h-7 w-7 items-center justify-center rounded bg-gray-200 text-sm font-black text-gray-800 transition hover:bg-gray-300"
                                                            >
                                                                -
                                                            </button>
                                                            <div className="w-8 text-center text-sm font-black text-gray-900">{quantity}</div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setBuilderCardQuantity(card.cardId ?? 0, quantity + 1)}
                                                                className="flex h-7 w-7 items-center justify-center rounded bg-purple-500 text-sm font-black text-white transition hover:bg-purple-600"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-sm font-black text-gray-900">作成中デッキ</div>
                                            <div className={`rounded-full px-3 py-1 text-xs font-black ${builderTotal === 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {builderTotal}/60
                                            </div>
                                        </div>
                                        <div className="mt-2 grid gap-1 text-[11px] font-bold">
                                            {builderAceSpecCount > 1 && (
                                                <div className="rounded bg-red-50 px-2 py-1 text-red-700">ACE SPECが{builderAceSpecCount}枚あります。</div>
                                            )}
                                            {builderOverLimitEntries.map(item => (
                                                <div key={`limit-${item.cardId}`} className="rounded bg-red-50 px-2 py-1 text-red-700">
                                                    {item.entry?.name} が{item.quantity}枚あります。
                                                </div>
                                            ))}
                                            {builderTotal !== 60 && (
                                                <div className="rounded bg-amber-50 px-2 py-1 text-amber-700">60枚にすると保存・CPU対戦に使いやすくなります。</div>
                                            )}
                                        </div>

                                        <div className="mt-3 max-h-[390px] overflow-y-auto pr-1">
                                            {builderEntries.length === 0 ? (
                                                <div className="rounded-lg border border-dashed border-gray-300 px-3 py-8 text-center text-xs font-bold text-gray-400">
                                                    左の検索からカードを追加
                                                </div>
                                            ) : (
                                                <div className="grid gap-1">
                                                    {builderEntries.map(item => (
                                                        <div key={`builder-line-${item.cardId}`} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5">
                                                            <div className="min-w-0">
                                                                <div className="truncate text-xs font-black text-gray-900">{item.entry?.name}</div>
                                                                <div className="text-[10px] font-bold text-gray-500">#{item.cardId} / {item.entry?.supertype}</div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setBuilderCardQuantity(item.cardId, item.quantity - 1)}
                                                                    className="h-7 w-7 rounded bg-gray-200 text-xs font-black text-gray-800"
                                                                >
                                                                    -
                                                                </button>
                                                                <div className="w-7 text-center text-xs font-black text-gray-900">{item.quantity}</div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setBuilderCardQuantity(item.cardId, item.quantity + 1)}
                                                                    className="h-7 w-7 rounded bg-purple-500 text-xs font-black text-white"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 grid gap-2">
                                            <button
                                                type="button"
                                                onClick={saveBuilderDeck}
                                                disabled={!builderIsValid}
                                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-black text-white transition hover:bg-gray-700 disabled:opacity-40"
                                            >
                                                このデッキを保存
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeckBuilderCards({})}
                                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-50"
                                            >
                                                作成中を空にする
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {canShowCpuUnlock && (
                <div className="mb-3 rounded-xl border border-white/10 bg-black/45 p-3 text-white shadow-lg">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="text-sm font-black tracking-wide">CPU対戦モード</div>
                            <div className="mt-1 text-xs text-gray-300">1人回しの盤面で、ローカル公式エンジン相手に対戦します。</div>
                        </div>
                        {!cpuUnlocked ? (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <button
                                    type="button"
                                    onClick={unlockCpu}
                                    className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-400"
                                >
                                    CPUを解放
                                </button>
                            </div>
                        ) : (
                            <div className="flex w-full flex-col gap-3">
                                <div className="rounded-lg border border-cyan-300/20 bg-cyan-950/30 p-3">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="text-xs font-black text-cyan-100">ローカル公式エンジン</div>
                                            <div className="mt-1 text-[11px] text-cyan-100/70">
                                                ptcgabc側で <span className="font-mono">scripts/run_cabt_bridge.sh</span> を起動してから使います。
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={startCabtBattle}
                                            disabled={cabtLoading}
                                            className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-black text-gray-950 transition hover:bg-cyan-300 disabled:opacity-50"
                                        >
                                            {cabtLoading ? '接続中...' : '対戦開始'}
                                        </button>
                                    </div>

                                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                                        <label className="text-[11px] font-bold text-cyan-100">
                                            人間側デッキ
                                            <select
                                                value={cabtHumanDeckId}
                                                onChange={(event) => setCabtHumanDeckId(event.target.value)}
                                                className="mt-1 w-full rounded-lg border border-white/20 bg-gray-950 px-2 py-2 text-xs text-white outline-none focus:border-cyan-300"
                                            >
                                                {savedPracticeDecks.length > 0 && (
                                                    <optgroup label="保存デッキ">
                                                        {savedPracticeDecks.map(deck => (
                                                            <option key={`local-human-${deck.id}`} value={`local:${deck.id}`}>
                                                                {deck.name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                <optgroup label="仮想デッキ">
                                                    {VIRTUAL_PRACTICE_DECKS.map(deck => (
                                                        <option key={deck.id} value={deck.id}>
                                                            {deck.label}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </label>
                                        <label className="text-[11px] font-bold text-cyan-100">
                                            CPU側デッキ
                                            <select
                                                value={cabtCpuDeckId}
                                                onChange={(event) => setCabtCpuDeckId(event.target.value)}
                                                className="mt-1 w-full rounded-lg border border-white/20 bg-gray-950 px-2 py-2 text-xs text-white outline-none focus:border-cyan-300"
                                            >
                                                {VIRTUAL_PRACTICE_DECKS.map(deck => (
                                                    <option key={deck.id} value={deck.id}>
                                                        {deck.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    {cabtError && (
                                        <div className="mt-2 rounded-lg border border-red-300/40 bg-red-500/15 px-2 py-2 text-xs text-red-100">
                                            {cabtError}
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}
                    </div>
                    {gameResult && (
                        <div className="mt-3 rounded-lg border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm font-black text-emerald-100">
                            {gameResult}
                        </div>
                    )}
                </div>
                )}

                {/* Practice Area - cabt official board or classic solo board */}
                {cabtPayload?.state ? (
                    <CabtBattleSurface
                        payload={cabtPayload}
                        selectedActionText={cabtActionText}
                        loading={cabtLoading}
                        onOptionClick={handleCabtOptionClick}
                        onSendSelection={sendCabtAction}
                    />
                ) : (deck1.length > 0 || deck2.length > 0) && (
                    <DndContext
                        sensors={sensors}
                        modifiers={[snapCenterToCursor]}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="w-full overflow-x-auto pb-4 overflow-visible">
                            <div className={`flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-1 sm:gap-4 w-full h-full max-w-[1400px] transition-all duration-700 ease-in-out
                                ${isMobile && activePlayer === 'player2' ? 'flex-col-reverse' : ''}
                            `}
                            style={{
                                transformStyle: 'flat'
                            }}>
                                {/* Player 1 - Mobile Order 3 (Bottom) */}
                                {deck1.length > 0 && (
                                    <div key="p1-fixed-container" className={`order-3 md:order-none w-full transition-all duration-700 
                                        ${isMobile && activePlayer === 'player2' ? 'opacity-60 scale-95 rotate-180' : 'opacity-100 scale-100 rotate-0'}
                                    `}>
                                        <DeckPractice
                                            key={`p1-${loadCounter}`}
                                            ref={player1Ref}
                                            idPrefix="player1"
                                            deck={deck1}
                                            onReset={() => setDeck1([])}
                                            playerName="自分"
                                            compact={true}
                                            mobile={isMobile}
                                            isActive={activePlayer === 'player1'}
                                            stadium={stadium1}
                                            onStadiumChange={(card: Card | null) => {
                                                setStadium1(card)
                                                setStadium2(null)
                                            }}
                                            onTurnEnd={() => setActivePlayer('player2')}
                                            onEffectTrigger={(effect) => handleEffectTrigger('player1', effect)}
                                            onAttackTrigger={(dmg, type, idx) => player2Ref.current?.receiveEffect('apply_damage', dmg, type, idx)}
                                            onKnockOut={handleKnockOut}
                                        />
                                    </div>
                                )}

                                {/* Center Column - Stadium & Tools */}
                                <div key="center-fixed-container" className={`order-2 md:order-none w-full md:w-40 flex-shrink-0 flex flex-col items-center z-10 transition-all duration-700`}>
                                    {/* Mobile: P2 - Stadium - Tools - P1 in a Row. */}
                                    <div className="p-1 sm:p-2 sticky top-4 md:top-24 w-full flex flex-col items-center justify-center gap-1 md:gap-0">

                                        {/* Main Battle Row: Opponent - Stadium - Coin/Dmg - Self */}
                                        <div className="flex flex-row items-center justify-center gap-1 md:gap-0 w-full md:flex-col">
                                            {/* Mobile Portal Slot: Opponent Battle (P2) */}
                                            <div id="mobile-battle-p2" className="md:hidden w-[70px] h-[98px] flex-shrink-0 flex items-center justify-center"></div>

                                            {/* Stadium Zone */}
                                            <DroppableZone id="stadium-zone" className="w-[60px] sm:w-[120px] aspect-[5/7] rounded border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-[10px] text-center p-0.5 sm:p-2 overflow-visible relative group bg-gray-200/90 flex-shrink-0 shadow-lg">
                                                {(stadium1 || stadium2) ? (
                                                    <div
                                                        onClick={(e) => {
                                                            handleStadiumClick(e)
                                                        }}
                                                        className="relative w-full h-full"
                                                    >
                                                        {(() => {
                                                            const activeStadium = stadium1 || stadium2;
                                                            return activeStadium ? (
                                                                <>
                                                                    <Image
                                                                        src={activeStadium.imageUrl}
                                                                        alt={activeStadium.name}
                                                                        fill
                                                                        className="rounded shadow-lg object-contain"
                                                                        unoptimized
                                                                    />
                                                                    {/* Keep X button as quick shortcut */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setStadium1(null)
                                                                            setStadium2(null)
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600 z-10"
                                                                    >
                                                                        ×
                                                                    </button>

                                                                    {/* Stadium Action Menu - Absolute Positioned */}
                                                                    {showStadiumMenu && (
                                                                        <div
                                                                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[9999] bg-white rounded shadow-xl border overflow-hidden min-w-[120px]"
                                                                            onClick={e => e.stopPropagation()}
                                                                        >
                                                                            <button
                                                                                onClick={trashStadium}
                                                                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-bold transition-colors whitespace-nowrap"
                                                                            >
                                                                                トラッシュする
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-500">スタジアム</span>
                                                )}
                                            </DroppableZone>

                                            {/* Coin & Damage - Inserted Narrowly Between Stadium and P1 */}
                                            <div className="flex flex-row md:flex-col gap-1 items-center justify-center flex-shrink-0 w-auto h-full sm:w-full md:mt-4 mx-0.5">
                                                {/* Player Toggle - Mobile Only */}
                                                <div className="md:hidden flex flex-col gap-1 mb-1">
                                                    <button 
                                                        onClick={() => setActivePlayer('player1')}
                                                        className={`px-3 py-1 text-[10px] font-black rounded-full shadow-sm transition ${activePlayer === 'player1' ? 'bg-blue-600 text-white ring-2 ring-white scale-110' : 'bg-white text-blue-600 opacity-60'}`}
                                                    >
                                                        P1
                                                    </button>
                                                    <button 
                                                        onClick={() => setActivePlayer('player2')}
                                                        className={`px-3 py-1 text-[10px] font-black rounded-full shadow-sm transition ${activePlayer === 'player2' ? 'bg-red-600 text-white ring-2 ring-white scale-110' : 'bg-white text-red-600 opacity-60'}`}
                                                    >
                                                        P2
                                                    </button>
                                                </div>

                                                {/* Coin */}
                                                <div className="bg-gray-50 rounded p-0.5 text-center w-[40px] md:w-full">
                                                    <h3 className="text-[6px] sm:text-[8px] font-bold text-gray-500 mb-0.5 uppercase tracking-tight md:block hidden">Coin</h3>
                                                    <div className="flex justify-center mb-0.5">
                                                        <div
                                                            onClick={handleCoinFlip}
                                                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 cursor-pointer transition-all duration-500 flex items-center justify-center text-[10px] font-bold ${coinResult === 'heads' ? 'bg-orange-400 border-orange-600 text-white' : coinResult === 'tails' ? 'bg-white border-gray-400 text-black' : 'bg-gray-200 border-gray-300'}`}
                                                        >
                                                            {/* Tiny indicator */}
                                                            {coinResult === 'heads' ? '表' : coinResult === 'tails' ? '裏' : ''}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Damage */}
                                                <div className="bg-gray-50 rounded p-0.5 text-center w-auto md:w-full grid grid-cols-2 place-items-center md:flex md:flex-col md:flex-wrap justify-center gap-0.5">
                                                    <DraggableDamageCounter amount={100} />
                                                    <DraggableDamageCounter amount={50} />
                                                    <DraggableDamageCounter amount={10} />
                                                    <DraggableDamageCounter amount={-999} />
                                                </div>
                                            </div>

                                            {/* Mobile Portal Slot: Self Battle (P1) */}
                                            <div id="mobile-battle-p1" className="md:hidden w-[70px] h-[98px] flex-shrink-0 flex items-center justify-center"></div>
                                        </div>

                                        {/* PC Only Tools Area (Hidden on Mobile) */}
                                        <div className="hidden md:flex flex-col gap-1 items-center justify-center w-full md:mt-4">
                                            {/* Standard PC Coin & Damage logic */}
                                        </div>
                                    </div>
                                </div>

                                {/* Player 2 - Mobile Order 1 (Top) */}
                                {deck2.length > 0 && (
                                    <div key="p2-fixed-container" className={`order-1 md:order-none w-full transition-all duration-700 
                                        ${isMobile && activePlayer === 'player1' ? 'opacity-60 scale-95 rotate-180' : 'opacity-100 scale-100 rotate-0'}
                                    `}>
                                        <DeckPractice
                                            key={`p2-${loadCounter}`}
                                            ref={player2Ref}
                                            idPrefix="player2"
                                            deck={deck2}
                                            onReset={() => setDeck2([])}
                                            playerName="相手"
                                            compact={true}
                                            mobile={isMobile}
                                            isActive={activePlayer === 'player2'}
                                            isOpponent={true}
                                            stadium={stadium2}
                                            onStadiumChange={(card: Card | null) => {
                                                setStadium2(card)
                                                setStadium1(null)
                                            }}
                                            onTurnEnd={() => setActivePlayer('player1')}
                                            onEffectTrigger={(effect) => handleEffectTrigger('player2', effect)}
                                            onAttackTrigger={(dmg, type, idx) => player1Ref.current?.receiveEffect('apply_damage', dmg, type, idx)}
                                            onKnockOut={handleKnockOut}
                                        />
                                    </div>
                                )}
                            </div>
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
                                    {activeDragData && (
                                        <div className="pointer-events-none">
                                            {activeDragData.type === 'counter' ? (
                                                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xs sm:text-sm font-black shadow-2xl border-2 scale-125 ${activeDragData.amount === 10 ? 'bg-orange-500 border-orange-700 text-white' :
                                                    activeDragData.amount === 50 ? 'bg-red-500 border-red-700 text-white' :
                                                        activeDragData.amount === -999 ? 'bg-white border-gray-400 text-black' :
                                                            'bg-red-700 border-red-900 text-white'
                                                    }`}>
                                                    {activeDragData.amount === -999 ? 'CLR' : activeDragData.amount}
                                                </div>
                                            ) : activeDragData.card ? (
                                                <CascadingStack
                                                    stack={isCardStackValue(activeDragData.card) ? activeDragData.card : createStack(activeDragData.card)}
                                                    width={120}
                                                    height={168}
                                                />
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )
                }

                {/* Content description for SEO/AdSense (Value) */}
                <div className="mt-16 mb-8 max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-xl p-6 md:p-10 shadow-sm border border-gray-100">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
                            📖 1人回しツールの価値と活用法
                        </h2>
                        <div className="space-y-6 text-gray-600 leading-relaxed">
                            <section>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">⚡️ なぜ「1人回し」が必要なのか？</h3>
                                <p className="mb-4">
                                    ポケモンカードにおいて、理想の展開を安定して行える力（練度）は最強の武器です。
                                    1人回しは、対戦相手がいない時間でも**「この手札なら次どのカードを持ってくるべきか」「限られたリソースで最大打点を出すルートは何か」**を深く考察できる貴重な時間となります。
                                </p>
                                <p>
                                    本ツールでは、物理的なカードを広げるスペースや準備の時間を必要としません。
                                    公式デッキコードを読み込むだけで、PCやスマートフォンから即座に対戦シミュレーションを開始できます。
                                </p>
                            </section>

                            <section className="bg-pink-50 p-5 rounded-xl border border-pink-100">
                                <h3 className="font-bold text-pink-900 mb-2">💡 練習の質を上げるテクニック</h3>
                                <ul className="list-disc list-inside space-y-2 ml-2 text-sm text-pink-950">
                                    <li><strong>先攻・後攻の両方を試す:</strong> 自分のデッキがどちらを取った時に事故りやすいか、解消法は何かを模索しましょう。</li>
                                    <li><strong>「もしも」を想定する:</strong> 「次の番にナンジャモを使われたら？」「ボスの指令でエースを呼ばれたら？」と仮定して、リカバリーの練習を行います。</li>
                                    <li><strong>サイド落ちの把握:</strong> 山札を確認した際、どの重要パーツがサイドに落ちているかを瞬時に把握し、それに基づいたゲームプランを組む練習になります。</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-bold text-gray-900 mb-2">👆 主な操作ガイド</h3>
                                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                                    <li><strong>基本操作:</strong> ドラッグ＆ドロップでカードをシームレスに移動可能（ベンチ、バトル場、トラッシュ、ロスト）。</li>
                                    <li><strong>カード詳細メニュー:</strong> タップで進化、状態異常、ダメカン操作、山札の上下移動などの詳細なアクションが可能です。</li>
                                    <li><strong>山札管理:</strong> 山札をクリックして中身を確認したり、ランダムにシャッフルしたり、特定のカードをサーチできます。</li>
                                </ul>
                            </section>

                            <section className="bg-blue-50 p-4 rounded-lg mt-4">
                                <h3 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                                    <span>📱</span> スマホ・タブレットでの練習に最適
                                </h3>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    電車での移動時間や休憩時間など、ちょっとした隙間時間で新デッキの「回し心地」を確認できるよう調整されています。
                                    タッチ操作で直感的にカードを動かし、コンボの実現性を体で覚えましょう。
                                </p>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Coin Toss 3D Animation Overlay */}
                {isFlipping && (
                    <CoinTossOverlay 
                        result={coinResult} 
                        onComplete={() => setIsFlipping(false)} 
                    />
                )}

            </div>
        </div>
    )
}

function CabtBattleSurface({
    payload,
    selectedActionText,
    loading,
    onOptionClick,
    onSendSelection,
}: {
    payload: CabtPayload
    selectedActionText: string
    loading: boolean
    onOptionClick: (index: number) => void
    onSendSelection: (overrideAction?: number[]) => void
}) {
    const state = payload.state
    const select = payload.select
    const players = state?.players ?? []
    const self = players[0]
    const opponent = players[1]
    const recentLogs = (payload.logs ?? []).slice(-12)
    const selected = selectedActionText.split(',').map(value => value.trim()).filter(Boolean)
    const [focusedOptionIndexes, setFocusedOptionIndexes] = useState<number[]>([])
    const needsMultiSelect = cabtNeedsSelectionBuffer(select)
    const visibleChoiceCards = select?.looking?.length ? select.looking : select?.deck ?? []
    const visibleChoiceArea: 'LOOKING' | 'DECK' = select?.looking?.length ? 'LOOKING' : 'DECK'
    const hasVisibleChoicePanel = visibleChoiceCards.length > 0
    const effectiveAreaName = (option: CabtOption) => {
        if (option.areaName) return option.areaName
        if ((option.typeName === 'PLAY' || option.typeName === 'ATTACH') && typeof option.index === 'number') return 'HAND'
        return undefined
    }

    const optionCard = (option: CabtOption) => {
        if (option.card) return option.card
        const optionPlayer = option.playerIndex ?? state?.yourIndex ?? 0
        const player = players[optionPlayer]
        const areaName = effectiveAreaName(option)
        if (!player || typeof option.index !== 'number') return null
        if (areaName === 'HAND') return player.hand?.[option.index] ?? null
        if (areaName === 'DECK') return select?.deck?.[option.index] ?? null
        if (areaName === 'LOOKING') return select?.looking?.[option.index] ?? null
        if (areaName === 'ACTIVE') return player.active?.[option.index] ?? null
        if (areaName === 'BENCH') return player.bench?.[option.index] ?? null
        if (areaName === 'DISCARD') return player.discard?.[option.index] ?? null
        return null
    }

    const optionTargetCard = (option: CabtOption) => {
        if (option.inPlayCard) return option.inPlayCard
        const optionPlayer = option.playerIndex ?? state?.yourIndex ?? 0
        const player = players[optionPlayer]
        if (!player || typeof option.inPlayIndex !== 'number') return null
        if (option.inPlayAreaName === 'ACTIVE') return player.active?.[option.inPlayIndex] ?? null
        if (option.inPlayAreaName === 'BENCH') return player.bench?.[option.inPlayIndex] ?? null
        return null
    }

    const sameCabtCard = (a?: CabtCard | null, b?: CabtCard | null) => {
        if (!a || !b) return false
        if (typeof a.serial === 'number' && typeof b.serial === 'number') return a.serial === b.serial
        return typeof a.cardId === 'number' && typeof b.cardId === 'number' && a.cardId === b.cardId
    }

    const isBoardTargetOption = (option: CabtOption) => {
        return Boolean(option.inPlayCard || (option.inPlayAreaName && typeof option.inPlayIndex === 'number'))
    }

    const optionLabel = (option: CabtOption, index: number) => {
        if (select?.contextName === 'IS_FIRST') {
            if (option.typeName === 'YES') return '先攻'
            if (option.typeName === 'NO') return '後攻'
        }
        if (option.typeName === 'YES') return 'はい'
        if (option.typeName === 'NO') return 'いいえ'
        if (option.typeName === 'END') return '番を終わる'
        if (option.typeName === 'NUMBER') return cabtNumberOptionLabel(option, select?.contextName, index)
        const source = optionCard(option)
        const sourceText = source ? cabtCardLabel(source) : cabtOptionFallbackLabel(option, index, option.index)
        const target = optionTargetCard(option)
        const targetArea = cabtAreaLabel(option.inPlayAreaName)
        if (option.typeName === 'ATTACH') {
            return `${cabtAttachActionLabel(option, source)}: ${sourceText} → ${targetArea}${target ? ` ${cabtCardLabel(target)}` : ''}`
        }
        if (option.typeName === 'PLAY') return `使う/出す: ${sourceText}`
        return `${sourceText}${targetArea ? ` → ${targetArea}` : ''}${target ? ` ${cabtCardLabel(target)}` : ''}`
    }

    const optionIndexesFor = (playerIndex: number, areaName: string, cardIndex: number, card?: CabtCard | null) => {
        return (select?.options ?? [])
            .map((option, index) => ({ option, index }))
            .filter(({ option }) => {
                const optionPlayer = option.playerIndex ?? state?.yourIndex ?? 0
                if (optionPlayer !== playerIndex) return false
                if (option.inPlayAreaName === areaName && option.inPlayIndex === cardIndex) return true
                if (card && option.inPlayAreaName === areaName && sameCabtCard(option.inPlayCard, card)) return true
                if (card && select?.contextName === 'EVOLVES_TO' && sameCabtCard(option.inPlayCard ?? optionTargetCard(option), card)) return true
                if (effectiveAreaName(option) !== areaName) return false
                if (option.index === cardIndex) return true
                if ((areaName === 'DECK' || areaName === 'LOOKING') && card) {
                    return sameCabtCard(option.card ?? optionCard(option), card)
                }
                return false
            })
            .map(({ index }) => index)
    }

    const actionOptions = (select?.options ?? []).map((option, index) => ({ option, index }))
    const endOption = actionOptions.find(({ option }) => option.typeName === 'END')
    const isMainContext = select?.contextName === 'MAIN'
    const standaloneOptions = actionOptions.filter(({ option }) => {
        if (option.typeName === 'YES' || option.typeName === 'NO' || option.typeName === 'END') return true
        if (isBoardTargetOption(option)) return false
        return !optionCard(option)
    })
    const focusedOptions = focusedOptionIndexes
        .map(index => ({ option: select?.options?.[index], index }))
        .filter((item): item is { option: CabtOption, index: number } => Boolean(item.option))

    const focusedAttachIndexes = focusedOptionIndexes.filter(index => select?.options?.[index]?.typeName === 'ATTACH')
    const isAttachFocusActive = focusedAttachIndexes.length > 0
    const shouldShowActionPanel = !isMainContext || hasVisibleChoicePanel || needsMultiSelect

    const runOrFocusOptions = (optionIndexes: number[]) => {
        if (optionIndexes.length === 0) return
        const attachIntersection = focusedAttachIndexes.length > 0
            ? optionIndexes.filter(index => focusedAttachIndexes.includes(index))
            : []
        if (attachIntersection.length === 1 && typeof attachIntersection[0] === 'number') {
            onOptionClick(attachIntersection[0])
            setFocusedOptionIndexes([])
            return
        }
        if (attachIntersection.length > 1) {
            setFocusedOptionIndexes(attachIntersection)
            return
        }
        if (select?.contextName === 'EVOLVES_TO' && typeof optionIndexes[0] === 'number') {
            onOptionClick(optionIndexes[0])
            setFocusedOptionIndexes([])
            return
        }
        if (optionIndexes.length === 1 && optionIndexes[0] !== undefined) {
            onOptionClick(optionIndexes[0])
            if (!needsMultiSelect) setFocusedOptionIndexes([])
            return
        }
        setFocusedOptionIndexes(optionIndexes)
    }

    const selectedOptionLabels = selected
        .map(value => Number(value))
        .filter(Number.isInteger)
        .map(index => {
            const option = select?.options?.[index]
            if (!option) return `${index + 1}`
            const card = optionCard(option)
            if (card) return cabtCardName(card)
            return optionLabel(option, index)
        })

    const renderZoneCard = (
        card: CabtCard | null | undefined,
        playerIndex: number,
        areaName: 'ACTIVE' | 'BENCH' | 'HAND' | 'DECK' | 'LOOKING',
        cardIndex: number,
        size: 'small' | 'large',
    ) => {
        if (!card) {
            return (
                <div className="flex aspect-[5/7] w-full min-w-[64px] items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/20 text-[10px] text-white/30">
                    空き
                </div>
            )
        }

        const meta = typeof card.cardId === 'number' ? cabtMetaById(card.cardId) : undefined
        const isPokemonCard = meta?.supertype === 'Pokémon' || typeof card.hp === 'number' || typeof card.maxHp === 'number'
        const stack = isPokemonCard ? cabtCardToStack(card) : null
        const optionIndexes = optionIndexesFor(playerIndex, areaName, cardIndex, card)
        const activeOptionIndexes = focusedAttachIndexes.length > 0
            ? optionIndexes.filter(index => focusedAttachIndexes.includes(index))
            : optionIndexes
        const clickable = activeOptionIndexes.length > 0
        const isSelected = activeOptionIndexes.some(index => selected.includes(String(index)))
        const width = size === 'large' ? 136 : 112
        const height = Math.round(width * 1.4)
        const uiCard = cabtCardToUiCard(card)
        const energyCards = (card.energy ?? []).filter((attached): attached is CabtCard => Boolean(attached))
        const toolCards = (card.tools ?? []).filter((attached): attached is CabtCard => Boolean(attached))
        const energyCount = Math.max(card.energyCount ?? 0, energyCards.length)
        const toolCount = Math.max(card.toolCount ?? 0, toolCards.length)
        const energyNames = energyCards.map(attached => cabtCardName(attached))
        const toolNames = toolCards.map(attached => cabtCardName(attached))
        const hpSummary = isPokemonCard ? cabtHpSummary(card) : null
        const attachmentSummary = [
            energyCount > 0 ? `エネ${energyCount}${energyNames.length ? ` ${energyNames.join('、')}` : ''}` : '',
            toolCount > 0 ? `道具${toolCount}${toolNames.length ? ` ${toolNames.join('、')}` : ''}` : '',
        ].filter(Boolean)
        const firstOption = typeof activeOptionIndexes[0] === 'number' ? select?.options?.[activeOptionIndexes[0]] : undefined
        const optionTypes = activeOptionIndexes.map(index => select?.options?.[index]?.typeName).filter(Boolean)
        const attachOption = activeOptionIndexes
            .map(index => select?.options?.[index])
            .find(option => option?.typeName === 'ATTACH')
        const targetActionText = attachOption
            ? cabtAttachActionLabel(attachOption, optionCard(attachOption))
            : select?.contextName === 'EVOLVES_TO' || optionTypes.includes('EVOLVE')
                ? '進化する'
                : optionTypes.includes('RETREAT')
                    ? 'にげる'
                    : ''
        const actionText = clickable
            ? targetActionText
                ? targetActionText
                : optionIndexes.length > 1
                    ? '操作を選ぶ'
                : firstOption ? cabtOptionActionLabel(firstOption, select?.contextName) : '選ぶ'
            : ''

        return (
            <button
                type="button"
                disabled={!clickable || loading}
                onClick={() => {
                    runOrFocusOptions(activeOptionIndexes)
                }}
                className={`relative rounded-xl p-1 text-left transition ${size === 'large' ? 'w-[148px]' : 'w-[124px]'} ${isSelected ? 'cursor-pointer bg-emerald-400/25 ring-4 ring-emerald-300' : clickable ? 'cursor-pointer bg-cyan-400/20 ring-2 ring-cyan-300 hover:bg-cyan-300/30' : 'cursor-default bg-white/5 ring-1 ring-white/10 opacity-75'}`}
            >
                {stack ? (
                    <CascadingStack stack={stack} width={width} height={height} />
                ) : (
                    <Image
                        src={uiCard.imageUrl}
                        alt={uiCard.name}
                        width={width}
                        height={height}
                        className="rounded-lg bg-white object-contain shadow-2xl ring-1 ring-white/10"
                        unoptimized
                    />
                )}
                {energyCount > 0 && (
                    <div className="absolute left-1 top-1 rounded-full bg-yellow-300 px-1.5 py-0.5 text-[10px] font-black text-gray-950 shadow">
                        エネ{energyCount}
                    </div>
                )}
                {toolCount > 0 && (
                    <div className="absolute right-1 top-1 rounded-full bg-violet-300 px-1.5 py-0.5 text-[10px] font-black text-gray-950 shadow">
                        道具{toolCount}
                    </div>
                )}
                {hpSummary && (
                    <div className={`absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-black shadow ${hpSummary.damaged ? 'bg-rose-500 text-white' : 'bg-emerald-300 text-gray-950'}`}>
                        HP {hpSummary.remaining}/{hpSummary.max}
                    </div>
                )}
                {(clickable || isSelected) && (
                    <div className={`absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-black text-gray-950 ${isSelected ? 'bg-emerald-300' : 'bg-cyan-300'}`}>
                        {isSelected ? '選択中' : actionText}
                    </div>
                )}
                <div className="mt-1 line-clamp-2 min-h-[30px] text-center text-[11px] font-bold leading-tight text-white">
                    {cabtCardName(card)}
                </div>
                {hpSummary && (
                    <div className={`mt-1 rounded px-1.5 py-0.5 text-center text-[10px] font-black leading-tight ${hpSummary.damaged ? 'bg-rose-500/95 text-white' : 'bg-emerald-300/95 text-gray-950'}`}>
                        HP {hpSummary.remaining}/{hpSummary.max}
                    </div>
                )}
                {attachmentSummary.length > 0 && (
                    <div className="mt-1 grid gap-1">
                        {energyCount > 0 && (
                            <div className="line-clamp-2 rounded bg-yellow-300/95 px-1.5 py-0.5 text-[10px] font-bold leading-tight text-gray-950">
                                {`エネ ${energyCount}${energyNames.length ? `: ${energyNames.join('、')}` : ''}`}
                            </div>
                        )}
                        {toolCount > 0 && (
                            <div className="line-clamp-2 rounded bg-violet-300/95 px-1.5 py-0.5 text-[10px] font-bold leading-tight text-gray-950">
                                {`道具 ${toolCount}${toolNames.length ? `: ${toolNames.join('、')}` : ''}`}
                            </div>
                        )}
                    </div>
                )}
            </button>
        )
    }

    const renderPlayerBoard = (player: CabtPlayer | undefined, playerIndex: number, title: string, tone: 'blue' | 'red') => {
        const color = tone === 'blue' ? 'border-blue-300/30 bg-blue-950/30' : 'border-red-300/30 bg-red-950/30'
        const activeTone = tone === 'blue' ? 'border-blue-200/60 bg-blue-500/10' : 'border-red-200/60 bg-red-500/10'
        return (
            <section className={`min-w-0 overflow-hidden rounded-2xl border ${color} p-3 text-white shadow-xl`}>
                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <div className="font-black">{title}</div>
                    <div className="text-white/70">山{player?.deckCount ?? '-'} / 手{player?.handCount ?? '-'} / サイド{player?.prizeCount ?? '-'}</div>
                </div>
                <div className="grid gap-3 lg:grid-cols-[170px_1fr]">
                    <div className={`rounded-2xl border ${activeTone} p-2`}>
                        <div className="mb-1 text-center text-xs font-black text-white">バトル場</div>
                        <div className="flex justify-center">
                            {renderZoneCard(player?.active?.[0], playerIndex, 'ACTIVE', 0, 'large')}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="mb-1 text-[11px] font-bold text-white/60">ベンチ</div>
                        <div className="grid grid-cols-5 gap-1">
                            {Array.from({ length: 5 }, (_, index) => renderZoneCard(player?.bench?.[index], playerIndex, 'BENCH', index, 'small'))}
                        </div>
                    </div>
                </div>
                {playerIndex === 0 && (
                    <div className="mt-3">
                        <div className="mb-1 text-[11px] font-bold text-white/60">手札</div>
                        <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
                            {(player?.hand ?? []).map((card, index) => (
                                <div key={`cabt-hand-card-${index}`} className="shrink-0">
                                    {renderZoneCard(card, playerIndex, 'HAND', index, 'small')}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        )
    }

    return (
        <div className="mx-auto grid w-full max-w-[1400px] min-w-0 gap-3 overflow-hidden">
            {renderPlayerBoard(opponent, 1, 'CPU', 'red')}

            {!shouldShowActionPanel && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white/75">
                    <div>
                        Turn {state?.turn ?? '-'} / {state?.result === -1 ? '対戦中' : `結果 ${state?.result ?? '-'}`}
                    </div>
                    {isAttachFocusActive && (
                        <div className="rounded-lg border border-yellow-300/30 bg-yellow-300/15 px-2 py-1 text-yellow-50">
                            光っているカードを押してつける
                        </div>
                    )}
                    {endOption && (
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => onOptionClick(endOption.index)}
                            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-black text-white transition hover:bg-white/20"
                        >
                            番を終わる
                        </button>
                    )}
                </div>
            )}

            {shouldShowActionPanel && (
            <section className="min-w-0 overflow-hidden rounded-2xl border border-cyan-300/30 bg-black/60 p-3 text-white shadow-xl">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="text-sm font-black text-cyan-100">
                            {CABT_CONTEXT_JA[select?.contextName ?? ''] ?? select?.contextName ?? '行動を選ぶ'}
                        </div>
                        <div className="mt-1 text-xs font-bold text-cyan-50/85">
                            {CABT_CONTEXT_HELP[select?.contextName ?? ''] ?? '盤面の光っているカード、または下のボタンから操作してください。'}
                        </div>
                        <div className="mt-1 text-[11px] text-cyan-100/50">
                            Turn {state?.turn ?? '-'} / {state?.result === -1 ? '対戦中' : `結果 ${state?.result ?? '-'}`}
                        </div>
                        {payload.logPath && (
                            <div className="mt-1 max-w-full truncate font-mono text-[11px] text-emerald-200/80">
                                ログ保存中: {payload.logPath}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(select?.minCount ?? 1) === 0 && (
                            <button
                                type="button"
                                onClick={() => onSendSelection([])}
                                disabled={loading}
                                className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:border-cyan-300 hover:bg-cyan-500/20"
                            >
                                選ばない
                            </button>
                        )}
                    {needsMultiSelect && (
                        <button
                            type="button"
                            onClick={() => onSendSelection()}
                            disabled={loading || selected.length < (select?.minCount ?? 0)}
                            className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-gray-950 transition hover:bg-cyan-300 disabled:opacity-40"
                        >
                            選んだカードで実行
                        </button>
                    )}
                    </div>
                </div>
                {standaloneOptions.length > 0 && !hasVisibleChoicePanel && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {standaloneOptions.map(({ option, index }) => (
                            <button
                                key={`cabt-standalone-${index}`}
                                type="button"
                                disabled={loading}
                                onClick={() => onOptionClick(index)}
                                className={`rounded-lg border px-4 py-2 text-left text-sm font-bold transition ${selected.includes(String(index)) ? 'border-cyan-300 bg-cyan-300/30' : 'border-white/15 bg-white/10 hover:border-cyan-300 hover:bg-cyan-500/20'}`}
                            >
                                {optionLabel(option, index)}
                            </button>
                        ))}
                    </div>
                )}
                {isAttachFocusActive && (
                    <div className="mt-3 rounded-xl border border-yellow-300/30 bg-yellow-300/15 px-3 py-2 text-xs font-bold text-yellow-50">
                        エネルギー/道具をつける対象を盤面から直接選んでください。光っているカードを押すと実行します。
                    </div>
                )}
                {focusedOptions.length > 0 && select?.contextName !== 'EVOLVES_TO' && !focusedOptions.every(({ option }) => option.typeName === 'ATTACH') && (
                    <div className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-500/10 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="text-xs font-black text-cyan-100">このカードでできる操作</div>
                            <button
                                type="button"
                                onClick={() => setFocusedOptionIndexes([])}
                                className="rounded bg-white/10 px-2 py-1 text-[11px] font-bold text-white/70 hover:bg-white/20"
                            >
                                閉じる
                            </button>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                            {focusedOptions.map(({ option, index }) => (
                                <button
                                    key={`cabt-focused-${index}`}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => {
                                        onOptionClick(index)
                                        if (!needsMultiSelect) setFocusedOptionIndexes([])
                                    }}
                                    className={`rounded-lg border px-4 py-2 text-left text-sm font-bold transition ${selected.includes(String(index)) ? 'border-cyan-300 bg-cyan-300/30' : 'border-white/15 bg-black/30 hover:border-cyan-300 hover:bg-cyan-500/20'}`}
                                >
                                    {optionLabel(option, index)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {needsMultiSelect && selected.length > 0 && (
                    <div className="mt-3 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
                        選択中: {selectedOptionLabels.join('、')}
                    </div>
                )}
                {(select?.options ?? []).some(option => option.areaName === 'DECK' || option.areaName === 'LOOKING') && !(select?.deck?.length) && !(select?.looking?.length) && (
                    <div className="mt-3 rounded-lg border border-amber-300/30 bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-100">
                        山札候補のカード名を取得できていません。cabt bridgeを再起動するとカード名まで表示されます。
                    </div>
                )}
                {hasVisibleChoicePanel && (
                    <div className="mt-3 rounded-2xl border border-cyan-300/25 bg-slate-950/95 p-3 shadow-2xl">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <div className="text-sm font-black text-cyan-100">
                                    {visibleChoiceArea === 'LOOKING' ? '見ているカードから選ぶ' : '山札から選ぶ'}
                                </div>
                                <div className="mt-1 text-[11px] text-cyan-100/60">
                                    光っているカードだけ選べます。選ばない場合は上の「選ばない」を押してください。
                                </div>
                            </div>
                            <div className="rounded-full bg-cyan-400/15 px-3 py-1 text-[11px] font-black text-cyan-100">
                                {visibleChoiceCards.length}枚表示
                            </div>
                        </div>
                        <div className="grid max-h-[58vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {visibleChoiceCards.map((card, index) => (
                                <div key={`cabt-visible-choice-${index}`} className="flex justify-center">
                                    {renderZoneCard(card, 0, visibleChoiceArea, index, 'large')}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
            )}

            {recentLogs.length > 0 && (
                <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-white shadow-xl">
                    <div className="mb-2 text-xs font-black text-white/70">直近の処理</div>
                    <div className="grid max-h-36 gap-1 overflow-y-auto pr-1 text-xs sm:grid-cols-2">
                        {recentLogs.map((log, index) => (
                            <div
                                key={`cabt-log-${index}-${log.typeName ?? 'log'}`}
                                className={`rounded-lg px-2 py-1 ${log.playerIndex === 0 ? 'bg-blue-500/15 text-blue-50' : log.playerIndex === 1 ? 'bg-red-500/15 text-red-50' : 'bg-white/10 text-white/80'}`}
                            >
                                {cabtLogText(log)}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {renderPlayerBoard(self, 0, '自分', 'blue')}
        </div>
    )
}

function cabtOptionFallbackLabel(option: CabtOption, index: number, sourceIndex?: number) {
    const area = cabtAreaLabel(option.areaName || option.inPlayAreaName)
    if (option.typeName === 'NUMBER') {
        return cabtNumberOptionLabel(option, undefined, index)
    }
    if (option.areaName === 'DECK') {
        return `山札候補 ${typeof sourceIndex === 'number' ? sourceIndex + 1 : index + 1}（カード名未取得）`
    }
    if (option.areaName === 'LOOKING') {
        return `見ているカード候補 ${typeof sourceIndex === 'number' ? sourceIndex + 1 : index + 1}（カード名未取得）`
    }
    return `${index}: ${area ? `${area} ` : ''}${option.typeName ?? '選択'}`
}

// Sub-components for D&D in Practice Page
function DraggableDamageCounter({ amount }: { amount: number }) {
    const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
        id: amount === -999 ? 'damage-counter-clr' : `damage-counter-${amount}`,
        data: {
            type: 'counter',
            amount: amount,
        },
    })

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 1000,
    } : undefined

    return (
        <div
            ref={setDraggableRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                rounded-full shadow-md flex items-center justify-center font-black border-2 border-white cursor-move hover:scale-110 transition select-none touch-none
                ${amount === 100 ? 'w-10 h-10 bg-red-600 text-xs text-white' : ''}
                ${amount === 50 ? 'w-8 h-8 bg-orange-500 text-[10px] text-white' : ''}
                ${amount === 10 ? 'w-6 h-6 bg-yellow-500 text-black text-[9px]' : ''}
                ${amount === -999 ? 'w-8 h-8 bg-white text-black text-[8px] border-gray-200' : ''}
                ${isDragging ? 'opacity-0' : ''}
            `}
        >
            {amount === -999 ? 'CLR' : amount}
        </div>
    )
}

function DroppableZone({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div
            ref={setNodeRef}
            className={`${className} ${isOver ? 'ring-4 ring-blue-300 bg-blue-50/50' : ''}`}
        >
            {children}
        </div>
    )
}

export default function PracticePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
            <PracticeContent />
        </Suspense>
    )
}
