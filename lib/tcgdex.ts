import type { CardData } from './deckParser'

// PTCGL set code → TCGdex { setId, series, pad }
// pad: whether to zero-pad card numbers to 3 digits
const SET_MAP: Record<string, { setId: string; series: string; pad: boolean }> = {
    // Scarlet & Violet
    SVI:  { setId: 'sv01',    series: 'sv',   pad: true },
    PAL:  { setId: 'sv02',    series: 'sv',   pad: true },
    OBF:  { setId: 'sv03',    series: 'sv',   pad: true },
    MEW:  { setId: 'sv03.5',  series: 'sv',   pad: true },
    PAR:  { setId: 'sv04',    series: 'sv',   pad: true },
    PAF:  { setId: 'sv04.5',  series: 'sv',   pad: true },
    TEF:  { setId: 'sv05',    series: 'sv',   pad: true },
    TWM:  { setId: 'sv06',    series: 'sv',   pad: true },
    SFA:  { setId: 'sv06.5',  series: 'sv',   pad: true },
    SCR:  { setId: 'sv07',    series: 'sv',   pad: true },
    SSP:  { setId: 'sv08',    series: 'sv',   pad: true },
    PRE:  { setId: 'sv08.5',  series: 'sv',   pad: true },
    JTG:  { setId: 'sv09',    series: 'sv',   pad: true },
    DRI:  { setId: 'sv10',    series: 'sv',   pad: true },
    // Sword & Shield
    SSH:  { setId: 'swsh1',   series: 'swsh', pad: false },
    RCL:  { setId: 'swsh2',   series: 'swsh', pad: true },
    DAA:  { setId: 'swsh3',   series: 'swsh', pad: true },
    CPA:  { setId: 'swsh3.5', series: 'swsh', pad: true },
    VIV:  { setId: 'swsh4',   series: 'swsh', pad: true },
    SHF:  { setId: 'swsh4.5', series: 'swsh', pad: true },
    BST:  { setId: 'swsh5',   series: 'swsh', pad: true },
    CRE:  { setId: 'swsh6',   series: 'swsh', pad: true },
    EVS:  { setId: 'swsh7',   series: 'swsh', pad: true },
    CEL:  { setId: 'swsh7.5', series: 'swsh', pad: true },
    FST:  { setId: 'swsh8',   series: 'swsh', pad: true },
    BRS:  { setId: 'swsh9',   series: 'swsh', pad: true },
    ASR:  { setId: 'swsh10',  series: 'swsh', pad: true },
    PGO:  { setId: 'swsh10.5',series: 'swsh', pad: true },
    LOR:  { setId: 'swsh11',  series: 'swsh', pad: true },
    SIT:  { setId: 'swsh12',  series: 'swsh', pad: true },
    CRZ:  { setId: 'swsh12.5',series: 'swsh', pad: true },
}

const CACHE_PREFIX = 'tcgdex:'
const NOT_FOUND = '__nf__'

function buildImageUrl(setCode: string, collectorNumber: string): string | null {
    const mapping = SET_MAP[setCode.toUpperCase()]
    if (!mapping) return null
    const num = mapping.pad
        ? collectorNumber.padStart(3, '0')
        : collectorNumber
    return `https://assets.tcgdex.net/en/${mapping.series}/${mapping.setId}/${num}/high.webp`
}

function readCache(key: string): string | null {
    try { return localStorage.getItem(`${CACHE_PREFIX}${key}`) } catch { return null }
}

function writeCache(key: string, value: string) {
    try { localStorage.setItem(`${CACHE_PREFIX}${key}`, value) } catch { /* ignore */ }
}

async function resolveImage(setCode: string, collectorNumber: string): Promise<string> {
    const cacheKey = `${setCode}:${collectorNumber}`
    const cached = readCache(cacheKey)
    if (cached !== null) return cached === NOT_FOUND ? '' : cached

    const url = buildImageUrl(setCode, collectorNumber)
    if (!url) {
        writeCache(cacheKey, NOT_FOUND)
        return ''
    }

    // Verify the image exists (lightweight HEAD request)
    try {
        const res = await fetch(url, { method: 'HEAD' })
        if (res.ok) {
            writeCache(cacheKey, url)
            return url
        }
    } catch { /* ignore */ }

    writeCache(cacheKey, NOT_FOUND)
    return ''
}

export async function enrichCardsWithImages(cards: CardData[]): Promise<CardData[]> {
    return Promise.all(
        cards.map(async (card) => {
            if (!card.setCode || !card.collectorNumber) return card
            if (card.imageUrl) return card
            const imageUrl = await resolveImage(card.setCode, card.collectorNumber)
            return { ...card, imageUrl }
        })
    )
}
