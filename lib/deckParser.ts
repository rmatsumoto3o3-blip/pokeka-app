export interface CardData {
    name: string
    imageUrl: string
    quantity: number
    supertype: string
    subtypes?: string[]
}

export interface Card {
    name: string
    imageUrl: string
    supertype: string
    subtypes?: string[]
}

export async function fetchDeckData(deckCode: string): Promise<CardData[]> {
    const response = await fetch(
        `https://www.pokemon-card.com/deck/confirm.html/deckID/${deckCode}`,
        { cache: 'no-store' }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch deck data')
    }

    const html = await response.text()
    // const doc = new DOMParser().parseFromString(html, 'text/html') // DOMParser is client-side only

    return extractCardsFromHtml(html)
}

function extractCardsFromHtml(html: string): CardData[] {
    const cards: CardData[] = []

    // Map input IDs to types
    const inputTypeMap: Record<string, { supertype: string, subtype?: string }> = {
        'deck_pke': { supertype: 'Pokémon' },
        'deck_gds': { supertype: 'Trainer', subtype: 'Item' },
        'deck_tool': { supertype: 'Trainer', subtype: 'Pokémon Tool' },
        'deck_sup': { supertype: 'Trainer', subtype: 'Supporter' },
        'deck_sta': { supertype: 'Trainer', subtype: 'Stadium' },
        'deck_ene': { supertype: 'Energy' },
        'deck_tech': { supertype: 'Trainer', subtype: 'Technical Machine' },
        'deck_ajs': { supertype: 'Trainer', subtype: 'Item' }
    }

    const inputIds = Object.keys(inputTypeMap)

    // 1. Extract PCGDECK object maps from the HTML string
    // We look for patterns like: PCGDECK.searchItemName[123]='Name';
    const searchItemName: Record<string, string> = {}
    const searchItemCardPict: Record<string, string> = {}
    const searchItemNameAlt: Record<string, string> = {}

    // Regex global match for each property
    // Name
    const nameMatches = html.matchAll(/PCGDECK\.searchItemName\[(\d+)\]='([^']+)';/g)
    for (const match of nameMatches) {
        searchItemName[match[1]] = match[2]
    }

    // Pict
    const pictMatches = html.matchAll(/PCGDECK\.searchItemCardPict\[(\d+)\]='([^']+)';/g)
    for (const match of pictMatches) {
        searchItemCardPict[match[1]] = match[2]
    }

    // NameAlt
    const altNameMatches = html.matchAll(/PCGDECK\.searchItemNameAlt\[(\d+)\]='([^']+)';/g)
    for (const match of altNameMatches) {
        searchItemNameAlt[match[1]] = match[2]
    }

    if (Object.keys(searchItemName).length === 0) {
        console.error('PCGDECK object not found in HTML')
        return cards
    }

    // 2. Extract values from hidden inputs
    // <input type="hidden" name="deck_pke" id="deck_pke" value="123_2_123-456_1_456">
    // Regex to match: id="deck_pke" ... value="VALUE" OR value="VALUE" ... id="deck_pke"
    // Simplified strategy: Find the specific input tag pattern for each ID

    inputIds.forEach(inputId => {
        // Regex needs to be fairly robust to attributes order, but usually they are consistent.
        // Let's try to find value="..." where the tag also contains id="inputId"
        // But doing it generally on the whole HTML is safer with a specific RegExp for each input.

        // Pattern: <input [^>]*id="deck_pke"[^>]*value="([^"]*)"
        // Note: standard HTML from PHP usually uses double quotes.

        const inputRegex = new RegExp(`<input[^>]*id=["']${inputId}["'][^>]*value=["']([^"']*)["']`, 'i')
        const match = html.match(inputRegex)

        // Also check if id comes AFTER value
        const inputRegexReverse = new RegExp(`<input[^>]*value=["']([^"']*)["'][^>]*id=["']${inputId}["']`, 'i')

        let val = ''
        if (match && match[1]) {
            val = match[1]
        } else {
            const matchRev = html.match(inputRegexReverse)
            if (matchRev && matchRev[1]) val = matchRev[1]
        }

        if (val) {
            // Format: "id_quantity_index-id_quantity_index"
            val.split('-').forEach(entry => {
                const parts = entry.split('_')
                if (parts.length >= 2) {
                    const id = parts[0]
                    const quantity = parseInt(parts[1], 10)

                    if (id && quantity && searchItemCardPict[id]) {
                        const typeInfo = inputTypeMap[inputId]
                        cards.push({
                            name: searchItemNameAlt[id] || searchItemName[id] || 'Unknown',
                            imageUrl: `https://www.pokemon-card.com${searchItemCardPict[id]}`,
                            quantity,
                            supertype: typeInfo.supertype,
                            subtypes: typeInfo.subtype ? [typeInfo.subtype] : undefined
                        })
                    }
                }
            })
        }
    })

    return cards
}

/**
 * Parses PTCGL (Pokemon TCG Live) export format text.
 * Example:
 * Pokémon: 5
 * 1 Hisuian Goodra V AST 133
 * 2 Hisuian Goodra VSTAR AST 136
 * ...
 */
export function parsePTCGLFormat(text: string): CardData[] {
    const cards: CardData[] = []
    const lines = text.split('\n')

    // PTCGL Format Regex: Quantity (1), Name (2), Set (3), Number (4)
    // Example: "2 Comfey LOR 79"
    const cardRegex = /^(\d+)\s+(.+?)\s+([A-Z0-9]{2,})\s+(\d+)\s*$/i

    lines.forEach(line => {
        const trimmed = line.trim()
        if (!trimmed) return

        const match = trimmed.match(cardRegex)
        if (match) {
            const quantity = parseInt(match[1], 10)
            const name = match[2]
            const setCode = match[3]
            const collectorNumber = match[4]

            // Basic type detection based on keywords in name (very crude for now)
            let supertype = 'Trainer'
            let subtype: string | undefined = undefined

            const upperName = name.toUpperCase()
            if (upperName.includes(' V') || upperName.includes('EX') || upperName.includes('GX') || upperName.includes('VSTAR') || upperName.includes('VMAX')) {
                supertype = 'Pokémon'
            } else if (upperName.includes('ENERGY')) {
                supertype = 'Energy'
            }

            cards.push({
                name,
                imageUrl: '', // Placeholder for now
                quantity,
                supertype,
                subtypes: subtype ? [subtype] : undefined
            })
        }
    })

    return cards
}

export function buildDeck(cards: CardData[]): Card[] {
    return cards.flatMap(card =>
        Array(card.quantity).fill({
            name: card.name,
            imageUrl: card.imageUrl,
            supertype: card.supertype,
            subtypes: card.subtypes
        })
    )
}

export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}
