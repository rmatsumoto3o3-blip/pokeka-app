'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Match, Deck } from '@/lib/supabase'
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts'

interface MatchAnalyticsProps {
    userId: string
}

interface MatchWithDeck extends Match {
    deck: Deck
}

const COLORS = {
    win: '#4ade80',  // green-400
    loss: '#f87171', // red-400
    draw: '#94a3b8'  // gray-400
}

export default function MatchAnalytics({ userId }: MatchAnalyticsProps) {
    const [matches, setMatches] = useState<MatchWithDeck[]>([])
    const [decks, setDecks] = useState<Deck[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDeckId, setSelectedDeckId] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<'all' | 'win' | 'loss'>('all')

    useEffect(() => {
        fetchData()
    }, [userId])

    const fetchData = async () => {
        try {
            // Fetch matches
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

            // Combine
            const matchesWithDecks: MatchWithDeck[] = (matchesData || []).map((match) => ({
                ...match,
                deck: (decksData || []).find((d) => d.id === match.deck_id)!,
            })).filter(m => m.deck) // filter out if deck deleted

            setMatches(matchesWithDecks)
            setDecks(decksData || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // --- Computed Data ---

    // 1. Filtered Matches (by Deck AND Tab)
    const filteredMatches = useMemo(() => {
        return matches.filter(match => {
            const deckMatch = selectedDeckId === 'all' || match.deck_id === selectedDeckId
            const tabMatch = activeTab === 'all' || match.result === activeTab
            return deckMatch && tabMatch
        })
    }, [matches, selectedDeckId, activeTab])

    // 2. Stats for Graphs (by Deck only, ignoring Tab)
    const graphData = useMemo(() => {
        const targetMatches = matches.filter(match =>
            selectedDeckId === 'all' || match.deck_id === selectedDeckId
        )

        const wins = targetMatches.filter(m => m.result === 'win').length
        const losses = targetMatches.filter(m => m.result === 'loss').length
        const draws = targetMatches.filter(m => m.result === 'draw').length
        const total = wins + losses + draws

        const pieData = [
            { name: '勝ち', value: wins, color: COLORS.win },
            { name: '負け', value: losses, color: COLORS.loss },
            { name: '引き分け', value: draws, color: COLORS.draw },
        ].filter(d => d.value > 0)

        return { total, pieData, wins, losses, draws }
    }, [matches, selectedDeckId])

    // 3. Deck Performance Data (Only for 'All' view)
    const deckPerformanceData = useMemo(() => {
        if (selectedDeckId !== 'all') return []

        // Group by deck
        const deckStats: Record<string, { name: string, wins: number, total: number }> = {}

        matches.forEach(match => {
            if (!match.deck) return
            const id = match.deck_id
            if (!deckStats[id]) {
                deckStats[id] = { name: match.deck.deck_name, wins: 0, total: 0 }
            }
            deckStats[id].total += 1
            if (match.result === 'win') deckStats[id].wins += 1
        })

        return Object.values(deckStats)
            .map(stat => ({
                name: stat.name,
                winRate: Math.round((stat.wins / stat.total) * 100)
            }))
            .sort((a, b) => b.winRate - a.winRate)
            .slice(0, 5) // Top 5
    }, [matches, selectedDeckId])


    if (loading) return <div className="text-center py-8">読み込み中...</div>

    return (
        <div className="space-y-8">
            {/* Header / Filter */}
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900">戦績分析</h2>
                    <select
                        value={selectedDeckId}
                        onChange={(e) => setSelectedDeckId(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">すべてのデッキ（月間）</option>
                        {decks.map(deck => (
                            <option key={deck.id} value={deck.id}>{deck.deck_name}</option>
                        ))}
                    </select>
                </div>

                {/* Graphs */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pie Chart */}
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                        <h3 className="text-sm font-bold text-gray-500 mb-2">勝率内訳</h3>
                        <div className="h-64 w-full relative">
                            {graphData.total > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={graphData.pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {graphData.pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">データなし</div>
                            )}
                            {graphData.total > 0 && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {Math.round((graphData.wins / graphData.total) * 100)}%
                                    </div>
                                    <div className="text-xs text-gray-500">勝率</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bar Chart (Only for All Decks) */}
                    {selectedDeckId === 'all' && (
                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                            <h3 className="text-sm font-bold text-gray-500 mb-2">デッキ別勝率 (TOP 5)</h3>
                            <div className="h-64 w-full">
                                {deckPerformanceData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={deckPerformanceData} layout="vertical">
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                            <Tooltip formatter={(value) => `${value}%`} />
                                            <Bar dataKey="winRate" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                                {deckPerformanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#a855f7' : '#c084fc'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">データなし</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stat Cards (For Specific Deck) */}
                    {selectedDeckId !== 'all' && (
                        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 place-items-center">
                            <div className="text-center">
                                <div className="text-sm text-gray-500">試合数</div>
                                <div className="text-2xl font-bold text-gray-900">{graphData.total}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500">勝利数</div>
                                <div className="text-2xl font-bold text-green-600">{graphData.wins}</div>
                            </div>
                            {/* Future: Add First/Second stats here */}
                        </div>
                    )}
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-2xl p-6 border-2 border-pink-100 shadow-sm">
                <div className="flex gap-4 border-b border-gray-100 pb-4 mb-4 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${activeTab === 'all'
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        すべて ({matches.filter(m => selectedDeckId === 'all' || m.deck_id === selectedDeckId).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('win')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${activeTab === 'win'
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        勝ち ({matches.filter(m => (selectedDeckId === 'all' || m.deck_id === selectedDeckId) && m.result === 'win').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('loss')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${activeTab === 'loss'
                                ? 'bg-red-100 text-red-700'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        負け ({matches.filter(m => (selectedDeckId === 'all' || m.deck_id === selectedDeckId) && m.result === 'loss').length})
                    </button>
                </div>

                <div className="space-y-3">
                    {filteredMatches.length > 0 ? (
                        filteredMatches.map((match) => (
                            <div
                                key={match.id}
                                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition flex justify-between items-center"
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-lg border font-bold text-sm min-w-[60px] text-center ${match.result === 'win' ? 'bg-green-50 text-green-700 border-green-200' :
                                            match.result === 'loss' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}>
                                        {match.result === 'win' ? '勝ち' : match.result === 'loss' ? '負け' : '引分'}
                                    </span>
                                    <div>
                                        <div className="font-bold text-gray-900">{match.deck.deck_name}</div>
                                        <div className="text-xs text-gray-500">
                                            vs {match.opponent_name || '不明'} | {new Date(match.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                {match.notes && (
                                    <div className="hidden md:block text-sm text-gray-400 max-w-[200px] truncate">
                                        {match.notes}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">該当する記録はありません</div>
                    )}
                </div>
            </div>
        </div>
    )
}
