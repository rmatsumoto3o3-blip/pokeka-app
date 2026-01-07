'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Match, Deck, GameEnvironment } from '@/lib/supabase'
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
    const [environments, setEnvironments] = useState<GameEnvironment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDeckId, setSelectedDeckId] = useState<string>('all')
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>('all')
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
                .order('created_at', { ascending: false })

            if (matchesError) throw matchesError

            // Fetch decks
            const { data: decksData, error: decksError } = await supabase
                .from('decks')
                .select('*')
                .eq('user_id', userId)

            if (decksError) throw decksError

            // Fetch environments
            const { data: environmentsData, error: environmentsError } = await supabase
                .from('game_environments')
                .select('*')
                .order('start_date', { ascending: false })

            if (environmentsError) throw environmentsError

            // Combine
            const matchesWithDecks: MatchWithDeck[] = (matchesData || []).map((match) => ({
                ...match,
                deck: (decksData || []).find((d) => d.id === match.deck_id)!,
            })).filter(m => m.deck) // filter out if deck deleted

            setMatches(matchesWithDecks)
            setDecks(decksData || [])
            setEnvironments(environmentsData || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // --- Computed Data ---

    // 1. Filtered Matches (by Deck AND Tab AND Environment)
    const filteredMatches = useMemo(() => {
        return matches.filter(match => {
            const deckMatch = selectedDeckId === 'all' || match.deck_id === selectedDeckId
            const tabMatch = activeTab === 'all' || match.result === activeTab

            // Environment filter
            let environmentMatch = true
            if (selectedEnvironmentId !== 'all') {
                const env = environments.find(e => e.id === selectedEnvironmentId)
                if (env) {
                    const matchDate = new Date(match.date)
                    const startDate = new Date(env.start_date)
                    const endDate = env.end_date ? new Date(env.end_date) : new Date()
                    environmentMatch = matchDate >= startDate && matchDate <= endDate
                }
            }

            return deckMatch && tabMatch && environmentMatch
        })
    }, [matches, selectedDeckId, activeTab, selectedEnvironmentId, environments])


    // 2. Stats for Graphs (by Deck and Environment, ignoring Tab)
    const graphData = useMemo(() => {
        let targetMatches = matches.filter(match =>
            selectedDeckId === 'all' || match.deck_id === selectedDeckId
        )

        // Apply environment filter
        if (selectedEnvironmentId !== 'all') {
            const env = environments.find(e => e.id === selectedEnvironmentId)
            if (env) {
                targetMatches = targetMatches.filter(match => {
                    const matchDate = new Date(match.date)
                    const startDate = new Date(env.start_date)
                    const endDate = env.end_date ? new Date(env.end_date) : new Date()
                    return matchDate >= startDate && matchDate <= endDate
                })
            }
        }

        const wins = targetMatches.filter(m => m.result === 'win').length
        const losses = targetMatches.filter(m => m.result === 'loss').length
        const draws = targetMatches.filter(m => m.result === 'draw').length
        const total = wins + losses + draws

        const pieData = [
            { name: '勝ち', value: wins, color: COLORS.win },
            { name: '負け', value: losses, color: COLORS.loss },
            { name: '引き分け', value: draws, color: COLORS.draw },
        ].filter(d => d.value > 0)

        // First/Second turn stats
        const firstTurnMatches = targetMatches.filter(m => m.going_first === '先攻')
        const secondTurnMatches = targetMatches.filter(m => m.going_first === '後攻')

        const firstTurnWins = firstTurnMatches.filter(m => m.result === 'win').length
        const firstTurnTotal = firstTurnMatches.length
        const firstTurnWinRate = firstTurnTotal > 0 ? (firstTurnWins / firstTurnTotal) * 100 : 0

        const secondTurnWins = secondTurnMatches.filter(m => m.result === 'win').length
        const secondTurnTotal = secondTurnMatches.length
        const secondTurnWinRate = secondTurnTotal > 0 ? (secondTurnWins / secondTurnTotal) * 100 : 0

        return {
            total, pieData, wins, losses, draws,
            firstTurnWins, firstTurnTotal, firstTurnWinRate,
            secondTurnWins, secondTurnTotal, secondTurnWinRate
        }
    }, [matches, selectedDeckId, selectedEnvironmentId, environments])

    // 3. Deck Performance Data (Only for 'All' view)
    const deckPerformanceData = useMemo(() => {
        if (selectedDeckId !== 'all') return []

        // Apply environment filter
        let targetMatches = matches
        if (selectedEnvironmentId !== 'all') {
            const env = environments.find(e => e.id === selectedEnvironmentId)
            if (env) {
                targetMatches = matches.filter(match => {
                    const matchDate = new Date(match.date)
                    const startDate = new Date(env.start_date)
                    const endDate = env.end_date ? new Date(env.end_date) : new Date()
                    return matchDate >= startDate && matchDate <= endDate
                })
            }
        }

        // Group by deck
        const deckStats: Record<string, { name: string, wins: number, total: number }> = {}

        targetMatches.forEach(match => {
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
    }, [matches, selectedDeckId, selectedEnvironmentId, environments])

    // ... (existing imports)

    // Editing State
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({
        result: 'win' as 'win' | 'loss' | 'draw',
        going_first: null as '先攻' | '後攻' | null,
        side: '',
        mySide: null as number | null,
        opSide: null as number | null,
        opponent_name: '',
        date: '',
        notes: ''
    })
    const [updating, setUpdating] = useState(false)

    const startEditing = (match: MatchWithDeck) => {
        // Parse side safely
        let mySide: number | null = null
        let opSide: number | null = null
        if (match.side && match.side.includes('-')) {
            const parts = match.side.split('-')
            mySide = parseInt(parts[0])
            opSide = parseInt(parts[1])
        }

        setEditingMatchId(match.id)
        setEditForm({
            result: match.result,
            going_first: match.going_first,
            side: match.side || '',
            mySide: isNaN(mySide as any) || mySide === null ? 0 : mySide,
            opSide: isNaN(opSide as any) || opSide === null ? 0 : opSide,
            opponent_name: match.opponent_name || '',
            date: match.date,
            notes: match.notes || ''
        })
    }

    const cancelEditing = () => {
        setEditingMatchId(null)
    }

    const saveMatch = async (matchId: string) => {
        if (updating) return
        if (!editForm.going_first) {
            alert('先攻/後攻を選択してください')
            return
        }
        if (editForm.mySide === null || editForm.opSide === null) {
            alert('サイド枚数を選択してください')
            return
        }

        setUpdating(true)
        try {
            const sideFormatted = `${editForm.mySide}-${editForm.opSide}`
            const { error } = await supabase
                .from('matches')
                .update({
                    result: editForm.result,
                    going_first: editForm.going_first,
                    side: sideFormatted,
                    opponent_name: editForm.opponent_name || null,
                    date: editForm.date,
                    notes: editForm.notes || null
                })
                .eq('id', matchId)

            if (error) throw error

            // Update local state
            setMatches(matches.map(m =>
                m.id === matchId ? {
                    ...m,
                    result: editForm.result,
                    going_first: editForm.going_first,
                    side: sideFormatted,
                    opponent_name: editForm.opponent_name || null,
                    date: editForm.date,
                    notes: editForm.notes || null
                } : m
            ))
            setEditingMatchId(null)
        } catch (err: any) {
            alert('戦績の更新に失敗しました: ' + err.message)
        } finally {
            setUpdating(false)
        }
    }

    const deleteMatch = async (matchId: string) => {
        if (!confirm('この戦績を削除してもよろしいですか？')) return
        if (updating) return

        setUpdating(true)
        try {
            const { error } = await supabase
                .from('matches')
                .delete()
                .eq('id', matchId)

            if (error) throw error

            setMatches(matches.filter(m => m.id !== matchId))
        } catch (err: any) {
            alert('削除に失敗しました: ' + err.message)
        } finally {
            setUpdating(false)
        }
    }

    // ... (existing render logic)

    return (
        <div className="space-y-8">
            {/* Header / Filter */}
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 shadow-sm">
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-gray-900">戦績分析</h2>

                    <div className="flex flex-col md:flex-row gap-3">
                        <select
                            value={selectedDeckId}
                            onChange={(e) => setSelectedDeckId(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">すべてのデッキ</option>
                            {decks.map(deck => (
                                <option key={deck.id} value={deck.id}>{deck.deck_name}</option>
                            ))}
                        </select>

                        <select
                            value={selectedEnvironmentId}
                            onChange={(e) => setSelectedEnvironmentId(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">全期間</option>
                            {environments.map(env => (
                                <option key={env.id} value={env.id}>
                                    {env.name} ({env.start_date}～{env.end_date || '現在'})
                                </option>
                            ))}
                        </select>
                    </div>
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

                        {/* First/Second Turn Win Rate Badges */}
                        {graphData.total > 0 && (graphData.firstTurnTotal > 0 || graphData.secondTurnTotal > 0) && (
                            <div className="flex gap-2 justify-center mt-4">
                                {graphData.firstTurnTotal > 0 && (
                                    <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                                        <span className="text-xs font-bold text-blue-700">先攻 {Math.round(graphData.firstTurnWinRate)}%</span>
                                        <span className="text-xs text-blue-500 ml-1">({graphData.firstTurnWins}/{graphData.firstTurnTotal})</span>
                                    </div>
                                )}
                                {graphData.secondTurnTotal > 0 && (
                                    <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full">
                                        <span className="text-xs font-bold text-purple-700">後攻 {Math.round(graphData.secondTurnWinRate)}%</span>
                                        <span className="text-xs text-purple-500 ml-1">({graphData.secondTurnWins}/{graphData.secondTurnTotal})</span>
                                    </div>
                                )}
                            </div>
                        )}
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
                {/* Result Filter Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        総合 ({matches.filter(m => selectedDeckId === 'all' || m.deck_id === selectedDeckId).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('win')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === 'win'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                    >
                        勝ち ({matches.filter(m => (selectedDeckId === 'all' || m.deck_id === selectedDeckId) && m.result === 'win').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('loss')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === 'loss'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
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
                                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start mb-2">
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
                                                {match.side && <span className="ml-2 bg-gray-100 px-1 rounded">Side: {match.side}</span>}
                                                {match.going_first && <span className="ml-2 bg-gray-100 px-1 rounded">{match.going_first}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => startEditing(match)}
                                            className="text-gray-400 hover:text-pink-500 p-1"
                                            title="戦績を編集"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => deleteMatch(match.id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                            title="戦績を削除"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Note & Edit Section */}
                                <div className="mt-3 pl-2 border-l-4 border-gray-100">
                                    {editingMatchId === match.id ? (
                                        <div className="space-y-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Edit Result */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">結果</label>
                                                    <div className="flex gap-1">
                                                        {(['win', 'loss', 'draw'] as const).map((r) => (
                                                            <button
                                                                key={r}
                                                                type="button"
                                                                onClick={() => setEditForm({ ...editForm, result: r })}
                                                                className={`flex-1 py-3 px-1 rounded-xl text-xs font-bold transition-all shadow-sm ${editForm.result === r
                                                                    ? (r === 'win' ? 'bg-green-700 text-white translate-y-[-1px] shadow-green-100 ring-2 ring-green-400' : r === 'loss' ? 'bg-red-700 text-white translate-y-[-1px] shadow-red-100 ring-2 ring-red-400' : 'bg-gray-700 text-white translate-y-[-1px] shadow-gray-100 ring-2 ring-gray-400')
                                                                    : 'bg-white text-gray-400 border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                                                                    }`}
                                                            >
                                                                {r === 'win' ? '勝ち' : r === 'loss' ? '負け' : '引分'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Edit Going First */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">先攻/後攻</label>
                                                    <div className="flex gap-1">
                                                        {(['先攻', '後攻'] as const).map((g) => (
                                                            <button
                                                                key={g}
                                                                type="button"
                                                                onClick={() => setEditForm({ ...editForm, going_first: g })}
                                                                className={`flex-1 py-3 px-1 rounded-xl text-xs font-bold transition-all shadow-sm ${editForm.going_first === g
                                                                    ? 'bg-purple-700 text-white translate-y-[-1px] shadow-purple-100 ring-2 ring-purple-400'
                                                                    : 'bg-white text-gray-400 border-2 border-gray-100 hover:bg-gray-50 hover:border-purple-200'
                                                                    }`}
                                                            >
                                                                {g}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Edit Side */}
                                            <div className="space-y-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">サイド状況 (取った枚数)</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-bold text-gray-400 ml-1">自分</span>
                                                        <select
                                                            value={editForm.mySide ?? 0}
                                                            onChange={(e) => setEditForm({ ...editForm, mySide: Number(e.target.value) })}
                                                            className="w-full px-2 py-2 bg-white border-2 border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 transition cursor-pointer appearance-none"
                                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                                                        >
                                                            {[0, 1, 2, 3, 4, 5, 6].map(n => (
                                                                <option key={n} value={n}>{n}枚</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-bold text-gray-400 ml-1">相手</span>
                                                        <select
                                                            value={editForm.opSide ?? 0}
                                                            onChange={(e) => setEditForm({ ...editForm, opSide: Number(e.target.value) })}
                                                            className="w-full px-2 py-2 bg-white border-2 border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 transition cursor-pointer appearance-none"
                                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                                                        >
                                                            {[0, 1, 2, 3, 4, 5, 6].map(n => (
                                                                <option key={n} value={n}>{n}枚</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Edit Opponent */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">対戦相手</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.opponent_name}
                                                        onChange={(e) => setEditForm({ ...editForm, opponent_name: e.target.value })}
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-pink-500 outline-none"
                                                        placeholder="相手のデッキ名など"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">日付</label>
                                                    <input
                                                        type="date"
                                                        value={editForm.date}
                                                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                        className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-pink-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">メモ</label>
                                                <textarea
                                                    value={editForm.notes}
                                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                                    className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-pink-500 outline-none"
                                                    rows={2}
                                                    placeholder="試合のメモ..."
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                                                <button
                                                    onClick={cancelEditing}
                                                    className="px-4 py-2 text-sm text-gray-500 hover:bg-white rounded-md transition"
                                                    disabled={updating}
                                                >
                                                    キャンセル
                                                </button>
                                                <button
                                                    onClick={() => saveMatch(match.id)}
                                                    className="px-4 py-2 text-sm font-bold bg-pink-500 text-white rounded-md hover:bg-pink-600 shadow-sm transition disabled:opacity-50"
                                                    disabled={updating}
                                                >
                                                    {updating ? '保存中...' : '保存'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                            {match.notes || <span className="text-gray-400 italic">メモなし</span>}
                                        </p>
                                    )}
                                </div>
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
