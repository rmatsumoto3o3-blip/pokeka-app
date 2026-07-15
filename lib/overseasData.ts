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

const dragapultCards: OverseasDeckCard[] = [
    { cardKey: 'TWM-130', nameEn: 'Dragapult ex', setCode: 'TWM', collectorNumber: '130', quantity: 3, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv06/130/high.webp' },
    { cardKey: 'TWM-129', nameEn: 'Drakloak', setCode: 'TWM', collectorNumber: '129', quantity: 4, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv06/129/high.webp' },
    { cardKey: 'TWM-128', nameEn: 'Dreepy', setCode: 'TWM', collectorNumber: '128', quantity: 4, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv06/128/high.webp' },
    { cardKey: 'SFA-020', nameEn: 'Dusknoir', setCode: 'SFA', collectorNumber: '020', quantity: 2, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv06.5/020/high.webp' },
    { cardKey: 'SFA-019', nameEn: 'Dusclops', setCode: 'SFA', collectorNumber: '019', quantity: 1, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv06.5/019/high.webp' },
    { cardKey: 'SFA-018', nameEn: 'Duskull', setCode: 'SFA', collectorNumber: '018', quantity: 2, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv06.5/018/high.webp' },
    { cardKey: 'SFA-038', nameEn: 'Fezandipiti ex', setCode: 'SFA', collectorNumber: '038', quantity: 1, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv06.5/038/high.webp' },
    { cardKey: 'SVI-191', nameEn: 'Rare Candy', setCode: 'SVI', collectorNumber: '191', quantity: 4, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv01/191/high.webp' },
    { cardKey: 'SVI-196', nameEn: 'Ultra Ball', setCode: 'SVI', collectorNumber: '196', quantity: 4, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv01/196/high.webp' },
    { cardKey: 'TEF-144', nameEn: 'Buddy-Buddy Poffin', setCode: 'TEF', collectorNumber: '144', quantity: 4, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv05/144/high.webp' },
    { cardKey: 'SVI-166', nameEn: 'Arven', setCode: 'SVI', collectorNumber: '166', quantity: 4, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv01/166/high.webp' },
    { cardKey: 'SVI-181', nameEn: 'Nest Ball', setCode: 'SVI', collectorNumber: '181', quantity: 3, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv01/181/high.webp' },
    { cardKey: 'SFA-061', nameEn: 'Night Stretcher', setCode: 'SFA', collectorNumber: '061', quantity: 3, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv06.5/061/high.webp' },
    { cardKey: 'PAR-160', nameEn: 'Counter Catcher', setCode: 'PAR', collectorNumber: '160', quantity: 2, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv04/160/high.webp' },
    { cardKey: 'PAR-163', nameEn: 'Earthen Vessel', setCode: 'PAR', collectorNumber: '163', quantity: 2, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv04/163/high.webp' },
    { cardKey: 'PAL-185', nameEn: 'Iono', setCode: 'PAL', collectorNumber: '185', quantity: 4, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv02/185/high.webp' },
    { cardKey: 'PAL-172', nameEn: "Boss's Orders", setCode: 'PAL', collectorNumber: '172', quantity: 2, category: 'Trainer', imageUrl: 'https://assets.tcgdex.net/en/sv/sv02/172/high.webp' },
    { cardKey: 'SVE-005', nameEn: 'Basic Psychic Energy', setCode: 'SVE', collectorNumber: '005', quantity: 7, category: 'Energy', imageUrl: 'https://images.pokemontcg.io/sve/5_hires.png' },
    { cardKey: 'SVE-002', nameEn: 'Basic Fire Energy', setCode: 'SVE', collectorNumber: '002', quantity: 4, category: 'Energy', imageUrl: 'https://images.pokemontcg.io/sve/2_hires.png' },
]

function mockSixtyCardList(primary: OverseasDeckCard): OverseasDeckCard[] {
    return [
        primary,
        { cardKey: `${primary.cardKey}-support`, nameEn: 'Sample supporting cards (mock)', setCode: 'MOCK', collectorNumber: '001', quantity: 46, category: 'Trainer', imageUrl: null },
        { cardKey: `${primary.cardKey}-energy`, nameEn: 'Basic Energy (mock)', setCode: 'MOCK', collectorNumber: '002', quantity: 10, category: 'Energy', imageUrl: null },
    ]
}

export const mockOverseasArchetypes: OverseasArchetype[] = [
    { id: 'dragapult', slug: 'dragapult-dusknoir', nameEn: 'Dragapult Dusknoir', nameJa: 'ドラパルト／ヨノワール', coverImageUrl: '/pokemon-icons/ドラパルト.png' },
    { id: 'zoroark', slug: 'ns-zoroark', nameEn: "N's Zoroark", nameJa: 'Nのゾロアーク', coverImageUrl: '/pokemon-icons/ゾロアーク.png' },
    { id: 'crustle', slug: 'crustle', nameEn: 'Crustle', nameJa: 'イワパレス', coverImageUrl: '/pokemon-icons/イワパレス.png' },
    { id: 'slowking', slug: 'slowking', nameEn: 'Slowking', nameJa: 'ヤドキング', coverImageUrl: '/pokemon-icons/ヤドキング.png' },
    { id: 'gholdengo', slug: 'gholdengo-lunatone', nameEn: 'Gholdengo Lunatone', nameJa: 'サーフゴー／ルナトーン', coverImageUrl: 'https://assets.tcgdex.net/en/sv/sv04/139/high.webp' },
    { id: 'grimmsnarl', slug: 'grimmsnarl-froslass', nameEn: 'Grimmsnarl Froslass', nameJa: 'オーロンゲ／ユキメノコ', coverImageUrl: '/pokemon-icons/オーロンゲ.png' },
]

export const mockOverseasTournaments: OverseasTournament[] = [
    { id: 'naic-2026', source: 'manual', sourceTournamentId: 'mock-naic-2026', name: 'North America International Championships 2026', shortName: 'NAIC 2026', eventDateStart: '2026-06-12', eventDateEnd: '2026-06-14', city: 'New Orleans', countryCode: 'US', region: 'North America', playerCount: 3752, format: 'Standard', division: 'Masters', sourceUrl: 'https://limitlesstcg.com/tournaments' },
    { id: 'turin-2026', source: 'manual', sourceTournamentId: 'mock-turin-2026', name: 'Special Event Turin 2026', shortName: 'Special Event Turin', eventDateStart: '2026-06-06', eventDateEnd: '2026-06-07', city: 'Turin', countryCode: 'IT', region: 'Europe', playerCount: 2033, format: 'Standard', division: 'Masters', sourceUrl: 'https://limitlesstcg.com/tournaments' },
    { id: 'melbourne-2026', source: 'manual', sourceTournamentId: 'mock-melbourne-2026', name: 'Regional Melbourne 2026', shortName: 'Regional Melbourne', eventDateStart: '2026-05-23', eventDateEnd: '2026-05-24', city: 'Melbourne', countryCode: 'AU', region: 'Oceania', playerCount: 959, format: 'Standard', division: 'Masters', sourceUrl: 'https://limitlesstcg.com/tournaments' },
]

export const mockOverseasResults: OverseasResult[] = [
    { id: 'naic-dragapult', tournamentId: 'naic-2026', archetypeId: 'dragapult', sourceResultId: 'mock-naic-1', placing: 1, rankLabel: 'Winner', playerName: 'Sample Player A', countryCode: 'US', decklistPublic: true, sourceUrl: 'https://limitlesstcg.com/tournaments', cards: dragapultCards },
    { id: 'naic-slowking', tournamentId: 'naic-2026', archetypeId: 'slowking', sourceResultId: 'mock-naic-2', placing: 2, rankLabel: 'Runner-up', playerName: 'Sample Player B', countryCode: 'CA', decklistPublic: true, sourceUrl: 'https://limitlesstcg.com/tournaments', cards: mockSixtyCardList({ cardKey: 'MOCK-slowking', nameEn: 'Slowking', setCode: 'MOCK', collectorNumber: '001', quantity: 4, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv08/058/high.webp' }) },
    { id: 'turin-zoroark', tournamentId: 'turin-2026', archetypeId: 'zoroark', sourceResultId: 'mock-turin-1', placing: 1, rankLabel: 'Winner', playerName: 'Sample Player C', countryCode: 'GB', decklistPublic: true, sourceUrl: 'https://limitlesstcg.com/tournaments', cards: mockSixtyCardList({ cardKey: 'MOCK-zoroark', nameEn: "N's Zoroark ex", setCode: 'MOCK', collectorNumber: '001', quantity: 4, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv09/098/high.webp' }) },
    { id: 'melbourne-grimmsnarl', tournamentId: 'melbourne-2026', archetypeId: 'grimmsnarl', sourceResultId: 'mock-melbourne-1', placing: 1, rankLabel: 'Winner', playerName: 'Sample Player D', countryCode: 'AU', decklistPublic: true, sourceUrl: 'https://limitlesstcg.com/tournaments', cards: mockSixtyCardList({ cardKey: 'MOCK-grimmsnarl', nameEn: "Marnie's Grimmsnarl ex", setCode: 'MOCK', collectorNumber: '001', quantity: 4, category: 'Pokemon', imageUrl: 'https://assets.tcgdex.net/en/sv/sv10/136/high.webp' }) },
]

const statBase = [
    ['dragapult', 486, 24.8, 7, 28],
    ['zoroark', 158, 8.1, 3, 12],
    ['crustle', 121, 6.2, 2, 9],
    ['slowking', 110, 5.6, 2, 8],
    ['gholdengo', 93, 4.7, 1, 6],
    ['grimmsnarl', 82, 4.2, 1, 5],
] as const

const statScopes = [
    { region: 'All' as const, totalDecks: 1960, factor: 1 },
    { region: 'North America' as const, totalDecks: 930, factor: 0.52 },
    { region: 'Europe' as const, totalDecks: 650, factor: 0.31 },
    { region: 'Oceania' as const, totalDecks: 380, factor: 0.17 },
]

// 実運用ではGASの日次集計結果を overseas_archetype_stats から読む。
// ここでは結果行から集計せず、同テーブル相当の事前集計モックを固定で持つ。
export const mockOverseasArchetypeStats: OverseasArchetypeStat[] = statScopes.flatMap(scope =>
    statBase.map(([archetypeId, deckCount, share, wins, topCutCount]) => ({
        id: `${scope.region}-${archetypeId}`,
        snapshotDate: '2026-07-14',
        periodStart: '2026-05-01',
        periodEnd: '2026-07-14',
        region: scope.region,
        format: 'Standard',
        archetypeId,
        deckCount: Math.max(1, Math.round(deckCount * scope.factor)),
        totalDecks: scope.totalDecks,
        share,
        wins: Math.max(0, Math.round(wins * scope.factor)),
        topCutCount: Math.max(1, Math.round(topCutCount * scope.factor)),
    }))
)

export const OVERSEAS_DATA_MODE = 'mock' as const
