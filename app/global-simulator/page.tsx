'use client'

import { useState } from 'react'
import { getPTCGLDeckDataAction } from '@/app/actions'
import SimulatorManager from '@/components/SimulatorManager'
import type { CardData } from '@/lib/deckParser'

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
                setCards(res.data)
            } else {
                setError(res.error || 'Failed to parse deck list. Please ensure it follows the PTCGL export format.')
            }
        } catch (e) {
            setError('An unexpected error occurred.')
            console.error(e)
        } finally {
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

                {/* Usage Guide (Added for SEO & User Help) */}
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
            </div>
        </div>
    )
}
