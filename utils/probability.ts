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
 * 
 * P(X >= 1) = 1 - C(53-k, 6) / C(53, 6)
 */
export function calculatePrizeProbability(copies: number): string {
    if (copies <= 0) return '0.0'

    const N = 53
    const n = 6
    const k = copies

    if (k > (N - n)) return '100.0' // If copies > 47, impossible to not have one in prize (extreme edge case)

    const probNone = combinations(N - k, n) / combinations(N, n)
    const probAtLeastOne = 1 - probNone

    return (probAtLeastOne * 100).toFixed(1)
}

/**
 * Calculate Probability Distribution of having EXACTLY x copies remaining in the Deck (47 cards).
 * N = 60 (Total)
 * n = 47 (Deck Size)
 * k = Total Copies
 * x = Copies in Deck (0 to k)
 * 
 * P(X=x) = C(k, x) * C(60-k, 47-x) / C(60, 47)
 */
export function calculateRemainingDistribution(copies: number): { count: number, prob: string }[] {
    if (copies <= 0) return []

    const N = 60
    const n = 47
    const k = copies
    const result = []

    // x can range from 0 to k
    for (let x = 0; x <= k; x++) {
        // Validation: We must be able to pick x from k, AND (n-x) from (N-k)
        // (47-x) must be <= (60-k)
        if (n - x > N - k) {
            continue
        }

        const combinationsX = combinations(k, x)
        const combinationsRest = combinations(N - k, n - x)
        const totalCombinations = combinations(N, n)

        const prob = (combinationsX * combinationsRest) / totalCombinations
        result.push({
            count: x,
            prob: (prob * 100).toFixed(1)
        })
    }

    return result.reverse() // Show max remaining first
}
