'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Deck, Match } from '@/lib/supabase'
import AddMatchForm from './AddMatchForm'

interface DeckListProps {
    userId: string
}

interface DeckWithStats extends Deck {
    matches: Match[]
    total_matches: number
    wins: number
    losses: number
    draws: number
    win_rate: number
}

export default function DeckList({ userId }: DeckListProps) {
    const [decks, setDecks] = useState<DeckWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null)

    useEffect(() => {
        fetchDecks()
    }, [userId])

    const fetchDecks = async () => {
        try {
            // Fetch decks
            const { data: decksData, error: decksError } = await supabase
                .from('decks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (decksError) throw decksError

            // Fetch matches for each deck
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .eq('user_id', userId)

            if (matchesError) throw matchesError

            // Calculate stats
            const decksWithStats: DeckWithStats[] = (decksData || []).map((deck) => {
                const deckMatches = (matchesData || []).filter((m) => m.deck_id === deck.id)
                const wins = deckMatches.filter((m) => m.result === 'win').length
                const losses = deckMatches.filter((m) => m.result === 'loss').length
                const draws = deckMatches.filter((m) => m.result === 'draw').length
                const total = deckMatches.length

                return {
                    ...deck,
                    matches: deckMatches,
                    total_matches: total,
                    wins,
                    losses,
                    draws,
                    win_rate: total > 0 ? (wins / total) * 100 : 0,
                }
            })

            setDecks(decksWithStats)
        } catch (err) {
            console.error('Error fetching decks:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (deckId: string) => {
        if (!confirm('このデッキを削除しますか?')) return

        try {
            const { error } = await supabase
                .from('decks')
                .delete()
                .eq('id', deckId)

            if (error) throw error
            fetchDecks()
        } catch (err) {
            console.error('Error deleting deck:', err)
        }
    }

    if (loading) {
        return <div className="text-white text-center">読み込み中...</div>
    }

    if (decks.length === 0) {
        return (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
                <p className="text-gray-300 text-lg">まだデッキが登録されていません</p>
                <p className="text-gray-400 mt-2">上のフォームから最初のデッキを登録しましょう!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">登録済みデッキ</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck) => (
                    <div
                        key={deck.id}
                        className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-white/40 transition"
                    >
                        {deck.image_url && (
                            <img
                                src={deck.image_url}
                                alt={deck.deck_name}
                                className="w-full h-48 object-cover"
                            />
                        )}

                        <div className="p-4">
                            <h3 className="text-xl font-bold text-white mb-2">{deck.deck_name}</h3>
                            <p className="text-sm text-gray-400 mb-4 font-mono">{deck.deck_code}</p>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <div className="text-2xl font-bold text-white">{deck.total_matches}</div>
                                    <div className="text-xs text-gray-400">試合数</div>
                                </div>
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <div className="text-2xl font-bold text-green-400">
                                        {deck.win_rate.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-400">勝率</div>
                                </div>
                            </div>

                            <div className="flex gap-2 text-sm mb-4">
                                <span className="text-green-400">{deck.wins}勝</span>
                                <span className="text-red-400">{deck.losses}敗</span>
                                <span className="text-gray-400">{deck.draws}分</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedDeck(selectedDeck === deck.id ? null : deck.id)}
                                    className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                                >
                                    {selectedDeck === deck.id ? '閉じる' : '試合を記録'}
                                </button>
                                <button
                                    onClick={() => handleDelete(deck.id)}
                                    className="py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg border border-red-500/30 transition"
                                >
                                    削除
                                </button>
                            </div>

                            {selectedDeck === deck.id && (
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <AddMatchForm
                                        deckId={deck.id}
                                        userId={userId}
                                        onSuccess={() => {
                                            setSelectedDeck(null)
                                            fetchDecks()
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
