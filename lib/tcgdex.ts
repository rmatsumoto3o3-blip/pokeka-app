import type { CardData } from './deckParser'

const CACHE_PREFIX = 'tcgdex:'
const CACHE_NOT_FOUND = '__not_found__'

function getCached(setCode: string, number: string): string | null {
    try {
        return localStorage.getItem(`${CACHE_PREFIX}${setCode}:${number}`)
    } catch {
        return null
    }
}

function setCache(setCode: string, number: string, imageUrl: string) {
    try {
        localStorage.setItem(`${CACHE_PREFIX}${setCode}:${number}`, imageUrl)
    } catch {
        // localStorage unavailable — silently skip
    }
}

async function fetchImageUrl(setCode: string, number: string): Promise<string> {
    const cached = getCached(setCode, number)
    if (cached !== null) {
        return cached === CACHE_NOT_FOUND ? '' : cached
    }

    try {
        const res = await fetch(
            `https://api.tcgdex.net/v2/en/cards/${setCode}/${number}`,
            { cache: 'force-cache' }
        )
        if (!res.ok) {
            setCache(setCode, number, CACHE_NOT_FOUND)
            return ''
        }
        const data = await res.json()
        const imageUrl = data.image ? `${data.image}/high.webp` : ''
        setCache(setCode, number, imageUrl || CACHE_NOT_FOUND)
        return imageUrl
    } catch {
        setCache(setCode, number, CACHE_NOT_FOUND)
        return ''
    }
}

export async function enrichCardsWithImages(cards: CardData[]): Promise<CardData[]> {
    const results = await Promise.all(
        cards.map(async (card) => {
            if (!card.setCode || !card.collectorNumber) return card
            if (card.imageUrl) return card
            const imageUrl = await fetchImageUrl(card.setCode, card.collectorNumber)
            return { ...card, imageUrl }
        })
    )
    return results
}
