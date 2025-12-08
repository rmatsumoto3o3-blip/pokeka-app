'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Match, Deck } from '@/lib/supabase'

interface MatchHistoryProps {
    userId: string
}

interface MatchWithDeck extends Match {
    deck: Deck
}

export default function MatchHistory({ userId }: MatchHistoryProps) {
    const [matches, setMatches] = useState<MatchWithDeck[]>([])
    const [allMatches, setAllMatches] = useState<MatchWithDeck[]>([])
    const [decks, setDecks] = useState<Deck[]>([])
    const [selectedDeckId, setSelectedDeckId] = useState<string>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMatches()
    }, [userId])

    const fetchMatches = async () => {
        try {
            // Fetch matches with deck information
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false })

            if (matchesError) throw matchesError

            // Fetch decks
            const { data: decksData, error: decksError } = await supabase
                .from('decks')
                .select('*')
                .eq('user_id', userId)

            if (decksError) throw decksError

            // Combine data
            const matchesWithDecks: MatchWithDeck[] = (matchesData || []).map((match) => ({
                ...match,
                deck: (decksData || []).find((d) => d.id === match.deck_id)!,
            }))

            setAllMatches(matchesWithDecks)
            setMatches(matchesWithDecks)
            setDecks(decksData || [])
        } catch (err) {
            console.error('Error fetching matches:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeckFilter = (deckId: string) => {
        setSelectedDeckId(deckId)
        if (deckId === 'all') {
            setMatches(allMatches)
        } else {
            setMatches(allMatches.filter(match => match.deck_id === deckId))
        }
    }


    const getResultColor = (result: string) => {
        switch (result) {
            case 'win':
                return 'bg-green-50 text-green-700 border-green-200'
            case 'loss':
                return 'bg-red-50 text-red-700 border-red-200'
            case 'draw':
                return 'bg-gray-50 text-gray-700 border-gray-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const getResultText = (result: string) => {
        switch (result) {
            case 'win':
                return '勝ち'
            case 'loss':
                return '負け'
            case 'draw':
                return '引き分け'
            default:
                return result
        }
    }

    // Color Change: White base
    if (loading) {
        return <div className="text-gray-600 text-center">読み込み中...</div>
    }

    if (matches.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 border-2 border-pink-100 text-center shadow-sm">
                <p className="text-gray-500 text-lg">まだ試合記録がありません</p>
                <p className="text-gray-400 mt-2">デッキ管理タブから試合を記録しましょう!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                {/* H2 Removed as it's in parent */}
                <div />

                {/* デッキフィルター */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">デッキで絞り込み:</label>
                    <select
                        value={selectedDeckId}
                        onChange={(e) => handleDeckFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
                    >
                        <option value="all">すべてのデッキ</option>
                        {decks.map((deck) => (
                            <option key={deck.id} value={deck.id}>
                                {deck.deck_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-lg border font-semibold ${getResultColor(match.result)}`}>
                                        {getResultText(match.result)}
                                    </span>
                                    <span className="text-gray-900 font-semibold">{match.deck?.deck_name || 'デッキ不明'}</span>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="text-gray-600">
                                        <span className="text-gray-400">対戦相手:</span> {match.opponent_name}
                                    </div>
                                    <div className="text-gray-600">
                                        <span className="text-gray-400">日付:</span> {new Date(match.date).toLocaleDateString('ja-JP')}
                                    </div>
                                    {match.side && (
                                        <div className="text-gray-600">
                                            <span className="text-gray-400">サイド:</span> {match.side}
                                        </div>
                                    )}
                                    {match.going_first !== null && (
                                        <div className="text-gray-600">
                                            <span className="text-gray-400">先攻:</span> {match.going_first ? '取った' : '取らなかった'}
                                        </div>
                                    )}
                                    {match.notes && (
                                        <div className="text-gray-600">
                                            <span className="text-gray-400">メモ:</span> {match.notes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
