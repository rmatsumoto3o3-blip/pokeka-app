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

            setMatches(matchesWithDecks)
        } catch (err) {
            console.error('Error fetching matches:', err)
        } finally {
            setLoading(false)
        }
    }


    const getResultColor = (result: string) => {
        switch (result) {
            case 'win':
                return 'bg-green-500/20 text-green-200 border-green-500/30'
            case 'loss':
                return 'bg-red-500/20 text-red-200 border-red-500/30'
            case 'draw':
                return 'bg-gray-500/20 text-gray-200 border-gray-500/30'
            default:
                return 'bg-white/10 text-white border-white/20'
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

    if (loading) {
        return <div className="text-white text-center">読み込み中...</div>
    }

    if (matches.length === 0) {
        return (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
                <p className="text-gray-300 text-lg">まだ試合記録がありません</p>
                <p className="text-gray-400 mt-2">デッキ管理タブから試合を記録しましょう!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">戦績履歴</h2>

            <div className="space-y-3">
                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-lg border font-semibold ${getResultColor(match.result)}`}>
                                        {getResultText(match.result)}
                                    </span>
                                    <span className="text-white font-semibold">{match.deck?.deck_name || 'デッキ不明'}</span>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="text-gray-300">
                                        <span className="text-gray-400">対戦相手:</span> {match.opponent_name}
                                    </div>
                                    <div className="text-gray-300">
                                        <span className="text-gray-400">日付:</span> {new Date(match.date).toLocaleDateString('ja-JP')}
                                    </div>
                                    {match.side && (
                                        <div className="text-gray-300">
                                            <span className="text-gray-400">サイド:</span> {match.side}
                                        </div>
                                    )}
                                    {match.going_first !== null && (
                                        <div className="text-gray-300">
                                            <span className="text-gray-400">先攻:</span> {match.going_first ? '取った' : '取らなかった'}
                                        </div>
                                    )}
                                    {match.notes && (
                                        <div className="text-gray-300">
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
