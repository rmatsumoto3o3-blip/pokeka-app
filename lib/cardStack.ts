import { Card } from './deckParser'

export interface CardStack {
    cards: Card[]  // Bottom to top order
    energyCount: number
    toolCount: number
    damage: number
}

// Helper to create a stack from a single card
export function createStack(card: Card): CardStack {
    return {
        cards: [card],
        energyCount: card.supertype === 'Energy' ? 1 : 0,
        toolCount: card.subtypes?.includes('Pokémon Tool') ? 1 : 0,
        damage: 0
    }
}

// Helper to get the top card of a stack
export function getTopCard(stack: CardStack): Card {
    return stack.cards[stack.cards.length - 1]
}

// Card type checkers
export function isEnergy(card: Card): boolean {
    return card.supertype === 'Energy'
}

export function isTool(card: Card): boolean {
    return card.subtypes?.includes('Pokémon Tool') || false
}

export function isPokemon(card: Card): boolean {
    return card.supertype === 'Pokémon'
}

// Check if a card can be stacked on another
export function canStack(card: Card, stack: CardStack): boolean {
    const topCard = getTopCard(stack)

    // Energy can be attached to Pokémon
    if (isEnergy(card) && isPokemon(topCard)) {
        return true
    }

    // Tools can be attached to Pokémon
    if (isTool(card) && isPokemon(topCard)) {
        return true
    }

    // Pokémon can evolve (simplified - in real game would check evolution chain)
    if (isPokemon(card) && isPokemon(topCard)) {
        return true
    }

    return false
}
