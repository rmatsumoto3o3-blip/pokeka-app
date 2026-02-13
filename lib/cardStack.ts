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

export function isItem(card: Card): boolean {
    return card.subtypes?.includes('Item') || false
}

export function isSupporter(card: Card): boolean {
    return card.subtypes?.includes('Supporter') || false
}

export function isStadium(card: Card): boolean {
    return card.subtypes?.includes('Stadium') || false
}

export function isTrainer(card: Card): boolean {
    return card.supertype === 'Trainer' || isItem(card) || isSupporter(card) || isStadium(card)
}

export function isRuleBox(card: Card): boolean {
    if (!isPokemon(card)) return false
    const name = card.name
    // Rule box markers: ex, GX, V, VMAX, VSTAR, Radiant (輝く), V-UNION
    return name.includes('ex') ||
        name.includes('EX') ||
        name.includes('GX') ||
        name.includes(' V') || // Often "Name V"
        name.includes('VMAX') ||
        name.includes('VSTAR') ||
        name.includes('V-UNION') ||
        name.includes('輝く') ||
        name.includes('かがやく') ||
        name.includes('テラスタル')
}

// Check if a card can be stacked on another
export function canStack(card: Card, stack: CardStack): boolean {
    const topCard = getTopCard(stack)
    // Find the top-most Pokemon in the stack (ignoring Energy/Tools for check)
    const topPokemon = [...stack.cards].reverse().find(c => isPokemon(c))

    // Energy can be attached to Pokémon
    if (isEnergy(card) && topPokemon) {
        return true
    }

    // Tools can be attached to Pokémon
    if (isTool(card) && topPokemon) {
        return true
    }

    // Pokémon can evolve (stack on top of existing Pokemon)
    // We check topPokemon instead of topCard because the Pokemon might have tools/energy on top of it in the stack array
    // but semantically the new Pokemon evolves the underlying Pokemon.
    if (isPokemon(card) && topPokemon) {
        return true
    }

    return false
}
