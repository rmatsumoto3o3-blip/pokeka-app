// 海外(PTCG)環境データ。GASウェブアプリが配信するJSONを読み、型へ変換する。
// データ源: 海外用スプレッドシートの doGet（Limitless収集→自前集計）。Supabase不使用。
// ※GASのデプロイを「更新」する限りURLは不変。新規デプロイすると変わるので、その時はここを差し替える。
const OVERSEAS_DATA_URL = 'https://script.google.com/macros/s/AKfycbw9sGZEPw0HnMfs_rB2JEMfeYhCd4z08LPuaD9VIYxH4vIWY0jKvO3uE6C00KO-e69lmA/exec'

export type OverseasRegion = 'North America' | 'Europe' | 'Oceania' | 'Latin America' | 'Asia' | 'Other'
export type OverseasCardCategory = 'Pokemon' | 'Trainer' | 'Energy'

export interface OverseasDeckCard {
    cardKey: string
    nameEn: string
    nameJa?: string
    setCode: string
    collectorNumber: string
    quantity: number
    category: OverseasCardCategory
    imageUrl: string | null
}

export interface OverseasArchetype {
    id: string
    slug: string
    nameEn: string
    nameJa?: string
    coverImageUrl: string | null
}

export interface OverseasTournament {
    id: string
    source: 'limitless_play' | 'manual'
    sourceTournamentId: string
    name: string
    shortName: string
    eventDateStart: string
    eventDateEnd?: string
    city: string
    countryCode: string
    region: OverseasRegion
    playerCount: number
    format: string
    division: string
    sourceUrl: string
}

export interface OverseasResult {
    id: string
    tournamentId: string
    archetypeId: string
    sourceResultId: string
    placing: number
    rankLabel: 'Winner' | 'Runner-up' | 'Top 4' | 'Top 8'
    playerName: string
    countryCode: string
    decklistPublic: boolean
    sourceUrl: string
    cards: OverseasDeckCard[]
}

export interface OverseasArchetypeStat {
    id: string
    snapshotDate: string
    periodStart: string
    periodEnd: string
    region: 'All' | OverseasRegion
    format: string
    archetypeId: string
    deckCount: number
    totalDecks: number
    share: number
    wins: number
    topCutCount: number
}

// ---- GASのJSON生スキーマ ----
interface RawCard { name: string; quantity: number; supertype: string }
interface RawDeck {
    deckCode: string
    tournamentId: string
    archetypeId: string
    archetypeName: string
    rank: string
    date: string
    location: string
    cards: RawCard[]
}
interface RawArchetype { id: string; name: string; deckCount: number; sharePct: number; tier: string }
interface RawPayload { generatedAt: string; totalDecks: number; archetypes: RawArchetype[]; decks: RawDeck[] }

// 24時間キャッシュ（GASは常に最新を返すが、サイト側は1日1回取得で十分）
async function fetchOverseas(): Promise<RawPayload> {
    const res = await fetch(OVERSEAS_DATA_URL, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error('overseas fetch failed: ' + res.status)
    return res.json()
}

function rankToLabel(rank: string): OverseasResult['rankLabel'] {
    if (rank === '優勝') return 'Winner'
    if (rank === '準優勝') return 'Runner-up'
    if (rank === 'TOP4') return 'Top 4'
    return 'Top 8'
}

function mapCategory(supertype: string): OverseasCardCategory {
    if (supertype === 'Pokémon' || supertype === 'Pokemon') return 'Pokemon'
    if (supertype === 'Energy') return 'Energy'
    return 'Trainer'
}

// "REFINE Summer ... (US)" → { name: "REFINE Summer ...", country: "US" }
function splitLocation(loc: string): { name: string; country: string } {
    const m = loc.match(/^(.*?)\s*\(([^)]*)\)\s*$/)
    if (m) return { name: m[1].trim(), country: m[2].trim() }
    return { name: loc, country: '' }
}

function toResult(d: RawDeck): OverseasResult {
    const placing = parseInt(d.deckCode.split('-')[1] || '0', 10)
    const country = splitLocation(d.location).country
    return {
        id: d.deckCode,
        tournamentId: d.tournamentId,
        archetypeId: d.archetypeId,
        sourceResultId: d.deckCode,
        placing: placing || 99,
        rankLabel: rankToLabel(d.rank),
        playerName: '',
        countryCode: country,
        decklistPublic: true,
        sourceUrl: 'https://play.limitlesstcg.com/tournament/' + d.tournamentId + '/standings',
        cards: (d.cards || []).map((c, i) => ({
            cardKey: d.deckCode + '-' + i + '-' + c.name,
            nameEn: c.name,
            setCode: '',
            collectorNumber: '',
            quantity: c.quantity,
            category: mapCategory(c.supertype),
            imageUrl: null,
        })),
    }
}

export async function getOverseasArchetypes(): Promise<OverseasArchetype[]> {
    const data = await fetchOverseas()
    return data.archetypes.map(a => ({ id: a.id, slug: a.id, nameEn: a.name, coverImageUrl: null }))
}

export async function getOverseasArchetypeStats(): Promise<OverseasArchetypeStat[]> {
    const data = await fetchOverseas()
    return data.archetypes.map(a => ({
        id: 'All-' + a.id,
        snapshotDate: (data.generatedAt || '').split('T')[0],
        periodStart: '',
        periodEnd: (data.generatedAt || '').split('T')[0],
        region: 'All',
        format: 'Standard',
        archetypeId: a.id,
        deckCount: a.deckCount,
        totalDecks: data.totalDecks,
        share: a.sharePct,
        wins: 0,
        topCutCount: a.deckCount,
    }))
}

export async function getOverseasTournaments(): Promise<OverseasTournament[]> {
    const data = await fetchOverseas()
    const byId = new Map<string, OverseasTournament>()
    data.decks.forEach(d => {
        if (byId.has(d.tournamentId)) return
        const { name, country } = splitLocation(d.location)
        byId.set(d.tournamentId, {
            id: d.tournamentId,
            source: 'limitless_play',
            sourceTournamentId: d.tournamentId,
            name,
            shortName: name.length > 40 ? name.slice(0, 40) + '…' : name,
            eventDateStart: String(d.date || '').slice(0, 10),
            city: '',
            countryCode: country,
            region: 'Other',
            playerCount: 0,
            format: 'Standard',
            division: 'Masters',
            sourceUrl: 'https://play.limitlesstcg.com/tournament/' + d.tournamentId + '/standings',
        })
    })
    return Array.from(byId.values())
}

export async function getOverseasResults(): Promise<OverseasResult[]> {
    const data = await fetchOverseas()
    return data.decks.map(toResult)
}

export async function getOverseasDeck(id: string): Promise<{ result: OverseasResult; tournament: OverseasTournament | null; archetype: OverseasArchetype | null } | null> {
    const data = await fetchOverseas()
    const deck = data.decks.find(d => d.deckCode === id)
    if (!deck) return null
    const { name, country } = splitLocation(deck.location)
    const arch = data.archetypes.find(a => a.id === deck.archetypeId)
    return {
        result: toResult(deck),
        tournament: {
            id: deck.tournamentId, source: 'limitless_play', sourceTournamentId: deck.tournamentId,
            name, shortName: name.length > 40 ? name.slice(0, 40) + '…' : name,
            eventDateStart: String(deck.date || '').slice(0, 10), city: '', countryCode: country, region: 'Other',
            playerCount: 0, format: 'Standard', division: 'Masters',
            sourceUrl: 'https://play.limitlesstcg.com/tournament/' + deck.tournamentId + '/standings',
        },
        archetype: arch ? { id: arch.id, slug: arch.id, nameEn: arch.name, coverImageUrl: null } : { id: deck.archetypeId, slug: deck.archetypeId, nameEn: deck.archetypeName, coverImageUrl: null },
    }
}
