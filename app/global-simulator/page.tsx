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
            </div>
        </div>
    )
}
