/**
 * Calculate Factorial
 */
function factorial(n: number): number {
    if (n < 0) return 0
    if (n === 0 || n === 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) {
        result *= i
    }
    return result
}

/**
 * Calculate Combinations nCr
 */
function combinations(n: number, r: number): number {
    if (r < 0 || r > n) return 0
    // Optimization: nCr = nC(n-r)
    if (r > n / 2) r = n - r

    let res = 1
    for (let i = 1; i <= r; i++) {
        res = res * (n - i + 1) / i
    }
    return res
}

/**
 * Calculate Probability of having AT LEAST 1 copy in the Initial Hand (7 cards).
 * N = 60 (Deck Size)
 * k = copies in deck
 * n = 7 (Hand Size)
 * P(X >= 1) = 1 - P(X = 0)
 * P(X = 0) = C(60-k, 7) / C(60, 7)
 */
export function calculateOpeningProbability(copies: number): string {
    if (copies <= 0) return '0.0'

    const N = 60
    const n = 7
    const k = copies

    const probNone = combinations(N - k, n) / combinations(N, n)
    const probAtLeastOne = 1 - probNone

    return (probAtLeastOne * 100).toFixed(1)
}

/**
 * Calculate Probability of having AT LEAST 1 copy remaining in the Deck (47 cards)
 * AFTER Initial Hand (7) and Prize Cards (6) are set.
 * Total removed from 60 is 13 cards.
 * Deck remaining is 47 cards.
 * 
 * "Remaining in Deck" means NOT ALL copies are in the Removed 13 cards.
 * If all k copies are in the first 13 cards, then 0 are in the deck.
 * P(Remaining >= 1) = 1 - P(All k in Removed 13)
 * P(All k in 13) = C(13, k) / C(60, k)
 */
export function calculateRemainingInDeckProbability(copies: number): string {
    if (copies <= 0) return '0.0'

    const N = 60
    const k = copies
    const removedSize = 13 // 7 Hand + 6 Prize

    // If copies > removedSize (impossible for Pokemon cards max 4), check bounds
    if (k > removedSize) return '100.0'

    const probAllInRemoved = combinations(removedSize, k) / combinations(N, k)
    const probRemaining = 1 - probAllInRemoved

    return (probRemaining * 100).toFixed(1)
}

/**
 * Calculate Probability of having AT LEAST 1 copy in the Prize Cards (6 cards).
 * The pool for calculation is 53 cards (60 - 7 hand).
 * However, the user request says "Calculate from 53 cards".
 * Usually, Prize Probability is P(Prize >= 1) calculated on the remaining 53 cards after initial hand.
 * 
 * N = 53
 * k = copies (Assuming none were drawn in hand? Or just general probability?)
 * User request: "サイドに落ちる確率は５３枚から計算" -> Calculate based on 53 cards pool.
 * This implies we are calculating the probability that a specific card is in the prizes, GIVEN it wasn't in the hand? 
 * Or simply the prior probability of being in the prizes?
 * 
 * Actually, standard hypergeometric:
 * N = 60, n = 6 (Prize count).
 * But user specified "53 cards". This strongly suggests they want the conditional probability:
 * "Given 7 cards are drawn (and didn't contain the card?), what is probability it's in the 6 prizes out of remaining 53?"
 * OR "Just treat the combined Hand+Deck as 53? No, that doesn't make sense."
 * 
 * Let's interpret "53枚から計算" as:
 * The pool from which prizes are chosen is 53 cards (after 7 hand cards are removed).
 * The prizes are 6 cards.
 * So N = 53, n = 6.
 * k = copies (assuming all 'k' copies are in this 53-card pool).
 * This usually models "If I didn't draw it in my opening hand, what is the chance it is prized?".
 * P(X >= 1) = 1 - P(X = 0)
 * P(X = 0) = C(53-k, 6) / C(53, 6)
 */
export function calculatePrizeProbability(copies: number): string {
    if (copies <= 0) return '0.0'

    const N = 53
    const n = 6
    const k = copies

    if (k > N) return '100.0' // Should not happen

    const probNone = combinations(N - k, n) / combinations(N, n)
    const probAtLeastOne = 1 - probNone

    return (probAtLeastOne * 100).toFixed(1)
}

/**
 * Represents the distribution of remaining copies of a card.
 * Indices 0 to 4 represent having 0, 1, 2, 3, or 4 copies remaining.
 * Values are probabilities (0.0 to 1.0).
 */
export interface RemainingDistribution {
    probabilities: number[] // [P(0), P(1), P(2), P(3), P(4)]
    expectedValue: number
}

/**
 * Calculates the probability distribution of having X copies remaining in the deck (47 cards).
 * Given K total copies in the 60 card deck.
 * Used copies U = K - Remaining.
 * Used copies are in the 13 removed cards (7 hand + 6 prize).
 * 
 * We want P(Remaining = r).
 * Remaining = r means Used = K - r copies are in the Removed 13.
 * P(Remaining = r) = P(Used = K - r)
 * 
 * Hypergeometric Distribution:
 * Population N = 60
 * Successes K = Total Copies
 * Draws n = 13 (Removed cards)
 * k = (K - r) (Number of successes in draw)
 * 
 * P(X = k) = [C(K, k) * C(N-K, n-k)] / C(N, n)
 */
export function calculateRemainingDistribution(totalCopies: number): RemainingDistribution {
    const N = 60
    const n = 13
    const K = totalCopies

    const probabilities: number[] = []
    let expectedValue = 0

    // Possible remaining counts: from 0 to K (limited by deck size behavior, practically 0 to 4)
    // Actually, remaining r can be anything from 0 to K subject to valid constraints.
    // k (used) = K - r.
    // Constraints on k:
    // 0 <= k <= n (13) -> Usually true since n=13 > K=4
    // 0 <= k <= K -> True by definition
    // n - k <= N - K -> 13 - k <= 60 - K -> True

    // We iterate r from 0 to K
    // Note: If user puts 20 energy, K=20. We should handle arbitrary K.
    // But interface usually expects distinct cards (max 4). 
    // Let's return array up to K.

    for (let r = 0; r <= K; r++) {
        const k_used = K - r // Count in removed pile

        let p = 0
        if (k_used >= 0 && k_used <= n) {
            p = (combinations(K, k_used) * combinations(N - K, n - k_used)) / combinations(N, n)
        }
        probabilities.push(p)
        expectedValue += r * p
    }

    return { probabilities, expectedValue }
}

// --- Multi-Card Simulation ---

export interface CustomHandTarget {
    id: string
    deckQuantity: number
    targetQuantity: number
}

/**
 * Simulates drawing an opening hand of 7 cards from a 60 card deck.
 * Calculates probability that ALL targets are met simultaneously.
 * Uses Monte Carlo simulation.
 * 
 * @param targets List of card constraints (e.g. "Pidgey: need 1", "Candy: need 1")
 * @param trials Number of simulations (default 100000)
 * @returns Success rate string (e.g. "45.2")
 */
export function simulateCustomHandProbability(targets: CustomHandTarget[], trials: number = 100000): string {
    if (!targets || targets.length === 0) return '0.0'

    let successCount = 0
    const deckSize = 60
    const handSize = 7

    // 1. Construct representative deck array
    // Integers representing card types. 0 = Filler. 1..N = Target Indices + 1.
    const baseDeck: number[] = []

    // Safety check for total cards
    let totalTargetCards = 0
    targets.forEach((t, i) => {
        const typeId = i + 1
        for (let j = 0; j < t.deckQuantity; j++) {
            baseDeck.push(typeId)
        }
        totalTargetCards += t.deckQuantity
    })

    if (totalTargetCards > deckSize) return 'Error'

    // Fill remaining with 0
    for (let i = baseDeck.length; i < deckSize; i++) {
        baseDeck.push(0)
    }

    // 2. Run Simulation
    for (let i = 0; i < trials; i++) {
        // Fisher-Yates Shuffle (Optimization: Only need first 7)
        // Actually, shuffling first 7 is enough? No, need to pick 7 random from 60.
        // Standard shuffle is fast enough for N=60.

        const currentDeck = [...baseDeck] // Copy

        // Shuffle at least first `handSize` elements
        for (let j = 0; j < handSize; j++) {
            const r = j + Math.floor(Math.random() * (deckSize - j))
            const temp = currentDeck[j]
            currentDeck[j] = currentDeck[r]
            currentDeck[r] = temp
        }

        const hand = currentDeck.slice(0, handSize)

        // 3. Check Conditions
        // Count occurrences in hand
        const counts = new Map<number, number>()
        for (const cardType of hand) {
            if (cardType > 0) {
                counts.set(cardType, (counts.get(cardType) || 0) + 1)
            }
        }

        let allMet = true
        for (let t = 0; t < targets.length; t++) {
            const typeId = t + 1
            const count = counts.get(typeId) || 0
            if (count < targets[t].targetQuantity) {
                allMet = false
                break
            }
        }

        if (allMet) {
            successCount++
        }
    }

    return ((successCount / trials) * 100).toFixed(1)
}
