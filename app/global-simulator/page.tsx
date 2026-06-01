'use client'

import { useState } from 'react'
import { getPTCGLDeckDataAction } from '@/app/actions'
import SimulatorManager from '@/components/SimulatorManager'
import type { CardData } from '@/lib/deckParser'
import { enrichCardsWithImages } from '@/lib/tcgdex'
// enrichCardsWithImages is synchronous — URLs are constructed directly from set mapping

export default function GlobalSimulatorPage() {
    const [inputText, setInputText] = useState('')
    const [loading, setLoading] = useState(false)
    const [cards, setCards] = useState<CardData[]>([])
    const [error, setError] = useState<string | null>(null)

    const handleParse = async () => {
        if (!inputText.trim()) return

        setLoading(true)
        setError(null)
        setCards([])

        try {
            const res = await getPTCGLDeckDataAction(inputText)
            if (res.success && res.data) {
                const enriched = enrichCardsWithImages(res.data)
                setCards(enriched)
                setLoading(false)
            } else {
                setError(res.error || 'Failed to parse deck list. Please ensure it follows the PTCGL export format.')
                setLoading(false)
            }
        } catch (e) {
            setError('An unexpected error occurred.')
            console.error(e)
            setLoading(false)
        }
    }

    // Since we want to use the same SimulatorManager but with pre-loaded cards,
    // we need to modify SimulatorManager to accept direct card data as a prop.
    // For now, let's create a wrapper or update SimulatorManager.

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        Global Deck Simulator
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Analyze your deck's opening probability and <br />
                        prize card risks using PTCGL format.
                    </p>
                </div>

                {/* Import Section */}
                {!cards.length && (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Paste your PTCGL Deck List (Export Format)
                            </label>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                rows={10}
                                placeholder="Example:&#10;1 Hisuian Goodra V AST 133&#10;2 Hisuian Goodra VSTAR AST 136&#10;..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition font-mono text-sm bg-gray-50/50"
                            />
                        </div>
                        <button
                            onClick={handleParse}
                            disabled={loading || !inputText.trim()}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center space-x-2
                                ${loading || !inputText.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {loading ? (
                                <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    <span>Import and Analyze</span>
                                    <span>🚀</span>
                                </>
                            )}
                        </button>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in shake-in">
                                {error}
                            </div>
                        )}
                        <div className="pt-4 border-t border-gray-100 text-sm text-gray-500 text-center">
                            Currently supporting English card names. Image support coming soon.
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {cards.length > 0 && (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="bg-white/80 backdrop-blur p-4 rounded-xl flex justify-between items-center border border-indigo-100 shadow-sm">
                            <button
                                onClick={() => setCards([])}
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                            >
                                <span>← Back to Import</span>
                            </button>
                            <div className="text-xs text-gray-500 italic">
                                Note: Images are currently unavailable for global cards.
                            </div>
                        </div>
                        <SimulatorManager initialCards={cards} lang="en" />
                    </div>
                )}

                {/* Usage Guide */}
                <div className="mt-20 prose prose-indigo max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
                        <span className="text-3xl">📝</span>
                        How to use the Simulator
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">🔢 Key Features</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                                <li>Instantly calculate probabilities from PTCGL deck lists.</li>
                                <li>Opening Hand Probability (7 cards).</li>
                                <li>Prize Card Risk (Probability of being prized).</li>
                                <li>Remaining in Deck distribution (after hand/prizes).</li>
                            </ul>

                            <h3 className="text-lg font-bold text-gray-900 mb-3">🎲 About Calculation Logic</h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                This simulator uses the <strong>Monte Carlo method</strong> with 100,000 virtual hands to determine probabilities statistically.<br />
                                It accurately handles complex combinations that are difficult with simple hypergeometric formulas.
                            </p>
                            <h4 className="font-bold text-gray-800 mb-1">About Remaining in Deck Distribution</h4>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                This calculates the probability distribution of how many copies of a specific card remain in the 47-card deck (after drawing 7 hand cards and setting 6 prize cards).
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Tips for Use</h3>
                            <div className="space-y-4">
                                <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                                    <h4 className="font-bold text-pink-800 mb-1">Ball Search Counts</h4>
                                    <p className="text-sm text-pink-700">Useful for optimizing the count of Nest Balls, Ultra Balls, etc., to ensure you find Basic Pokémon.</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                    <h4 className="font-bold text-purple-800 mb-1">Consistency Check</h4>
                                    <p className="text-sm text-purple-700">Visualize "brick" rates (unplayable hands) when you reduce Energy or Supporter counts.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section (SEO for English search) */}
                <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 border-b pb-4 mb-8">
                        <span className="text-3xl">❓</span>
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        {/* Q1 */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="bg-indigo-50 px-6 py-4">
                                <h3 className="font-bold text-gray-900 text-base">
                                    What does this Pokémon TCG deck simulator calculate?
                                </h3>
                            </div>
                            <div className="px-6 py-4 text-gray-600 text-sm leading-relaxed space-y-2">
                                <p>
                                    This simulator calculates three key probabilities for any Pokémon TCG deck:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li><strong>Opening Hand Probability</strong> — the chance of drawing a specific card (or combination) in your initial 7-card hand.</li>
                                    <li><strong>Prize Card Risk</strong> — the probability that a specific card ends up as one of the 6 prize cards, making it unavailable early in the game.</li>
                                    <li><strong>Remaining in Deck</strong> — after setting aside 6 prizes and drawing 7 cards, the distribution of how many copies of a card remain in your 47-card deck.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Q2 */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="bg-indigo-50 px-6 py-4">
                                <h3 className="font-bold text-gray-900 text-base">
                                    How accurate is the probability calculation?
                                </h3>
                            </div>
                            <div className="px-6 py-4 text-gray-600 text-sm leading-relaxed space-y-2">
                                <p>
                                    PokéLix uses the <strong>Monte Carlo simulation method</strong>, running <strong>100,000 virtual game setups</strong> per calculation. This statistical approach is highly accurate — results are within ±0.1% of the true probability in almost all cases.
                                </p>
                                <p>
                                    Unlike simple hypergeometric distribution formulas, Monte Carlo simulation correctly handles complex scenarios like mulligans (no Basic Pokémon in opening hand) and multi-card conditional probabilities.
                                </p>
                            </div>
                        </div>

                        {/* Q3 */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="bg-indigo-50 px-6 py-4">
                                <h3 className="font-bold text-gray-900 text-base">
                                    What is PTCGL format? How do I export my deck list?
                                </h3>
                            </div>
                            <div className="px-6 py-4 text-gray-600 text-sm leading-relaxed space-y-2">
                                <p>
                                    <strong>PTCGL (Pokémon TCG Live)</strong> is the official digital Pokémon card game client. The export format is a plain-text deck list that looks like this:
                                </p>
                                <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs mt-2">
                                    <div>Pokémon: 12</div>
                                    <div>4 Charizard ex OBF 125</div>
                                    <div>2 Charmeleon OBF 28</div>
                                    <div>4 Charmander OBF 26</div>
                                    <div>2 Pidgeot ex OBF 164</div>
                                    <div className="mt-1">Trainer: 36</div>
                                    <div>4 Rare Candy SSH 180</div>
                                    <div>4 Arven OBF 186</div>
                                    <div>...</div>
                                </div>
                                <p className="mt-2">
                                    To export from PTCGL: open your deck → click <strong>Share</strong> → select <strong>Copy to Clipboard</strong>. Then paste it into the text box above.
                                </p>
                            </div>
                        </div>

                        {/* Q4 */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="bg-indigo-50 px-6 py-4">
                                <h3 className="font-bold text-gray-900 text-base">
                                    Which sets and cards are supported?
                                </h3>
                            </div>
                            <div className="px-6 py-4 text-gray-600 text-sm leading-relaxed space-y-2">
                                <p>
                                    The simulator supports <strong>all standard PTCGL set codes</strong>. Any deck list exported from PTCGL will be parsed correctly, including:
                                </p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="font-bold text-gray-700 text-xs mb-1">Scarlet &amp; Violet Era</div>
                                        <div className="text-gray-500 text-xs">SVI · PAL · OBF · MEW · PAR · PAF · TEF · TWM · SFA · SCR · SSP · PRE · JTG · DRI</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="font-bold text-gray-700 text-xs mb-1">Sword &amp; Shield Era</div>
                                        <div className="text-gray-500 text-xs">SSH · RCL · DAA · VIV · BST · CRE · EVS · FST · BRS · ASR · LOR · SIT · CRZ + more</div>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Card images are provided via TCGdex for supported sets. Cards without images will display the card name as a text fallback.
                                </p>
                            </div>
                        </div>

                        {/* Q5 */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="bg-green-50 px-6 py-4">
                                <h3 className="font-bold text-gray-900 text-base">
                                    Is this simulator free to use?
                                </h3>
                            </div>
                            <div className="px-6 py-4 text-gray-600 text-sm leading-relaxed">
                                <p>
                                    <strong className="text-green-700">Yes, completely free.</strong> PokéLix is a free Pokémon TCG analytics platform. No account, login, or payment is required to use the deck simulator. Simply paste your PTCGL deck list and get instant results.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
