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
        `https://www.pokemon-card.com/deck/confirm.html/deckID/${deckCode}`
    )

    if (!response.ok) {
        throw new Error('Failed to fetch deck data')
    }

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    return extractCards(doc)
}

function extractCards(doc: Document): CardData[] {
    const cards: CardData[] = []

    // Card data is stored in hidden input fields
    // Map input IDs to types
    const inputTypeMap: Record<string, { supertype: string, subtype?: string }> = {
        'deck_pke': { supertype: 'Pokémon' },
        'deck_gds': { supertype: 'Trainer', subtype: 'Item' },
        'deck_tool': { supertype: 'Trainer', subtype: 'Pokémon Tool' },
        'deck_sup': { supertype: 'Trainer', subtype: 'Supporter' },
        'deck_sta': { supertype: 'Trainer', subtype: 'Stadium' },
        'deck_ene': { supertype: 'Energy' },
        'deck_tech': { supertype: 'Trainer', subtype: 'Technical Machine' }, // Guessing 'deck_tech' is TM
        'deck_ajs': { supertype: 'Trainer', subtype: 'Item' } // ACESPEC or similiar? Treat as Item for now
    }

    const inputIds = Object.keys(inputTypeMap)

    // Extract PCGDECK object from script tags
    const scripts = Array.from(doc.querySelectorAll('script'))
    const searchItemName: Record<string, string> = {}
    const searchItemCardPict: Record<string, string> = {}
    const searchItemNameAlt: Record<string, string> = {}

    for (const script of scripts) {
        const content = script.textContent || ''
        if (content.includes('PCGDECK')) {
            // Extract individual assignments line by line
            // Pattern: PCGDECK.searchItemName[12345]='Card Name';
            const nameMatches = content.matchAll(/PCGDECK\.searchItemName\[(\d+)\]='([^']+)';/g)
            for (const match of nameMatches) {
                searchItemName[match[1]] = match[2]
            }

            // Pattern: PCGDECK.searchItemCardPict[12345]='/path/to/image.jpg';
            const pictMatches = content.matchAll(/PCGDECK\.searchItemCardPict\[(\d+)\]='([^']+)';/g)
            for (const match of pictMatches) {
                searchItemCardPict[match[1]] = match[2]
            }

            // Pattern: PCGDECK.searchItemNameAlt[12345]='Short Name';
            const altNameMatches = content.matchAll(/PCGDECK\.searchItemNameAlt\[(\d+)\]='([^']+)';/g)
            for (const match of altNameMatches) {
                searchItemNameAlt[match[1]] = match[2]
            }
        }
    }

    if (Object.keys(searchItemName).length === 0) {
        console.error('PCGDECK object not found')
        return cards
    }

    console.log(`Found ${Object.keys(searchItemName).length} cards in PCGDECK`)

    // Extract card IDs and quantities from hidden inputs
    inputIds.forEach(inputId => {
        const input = doc.getElementById(inputId) as HTMLInputElement
        if (input && input.value) {
            console.log(`Processing ${inputId}: ${input.value}`)
            // Format: "id_quantity_index-id_quantity_index"
            input.value.split('-').forEach(entry => {
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

    console.log(`Extracted ${cards.length} card types, total ${cards.reduce((sum, c) => sum + c.quantity, 0)} cards`)

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
