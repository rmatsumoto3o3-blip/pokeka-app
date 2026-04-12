'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Match, Deck, GameEnvironment, DeckArchetype } from '@/lib/supabase'
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts'
import Image from 'next/image'
import PokemonIconSelector from './PokemonIconSelector'

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
    const supabase = createClient()
    const [matches, setMatches] = useState<MatchWithDeck[]>([])
    const [decks, setDecks] = useState<Deck[]>([])
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>([])
    const [environments, setEnvironments] = useState<GameEnvironment[]>([])
    // const [loading, setLoading] = useState(true) // Removed as unused per lint
    const [selectedDeckId, setSelectedDeckId] = useState<string>('all')
    const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<'all' | 'win' | 'loss'>('all')

    const fetchData = useCallback(async () => {
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

            // Fetch Archetypes
            const { data: archData } = await supabase
                .from('user_deck_archetypes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            setArchetypes(archData || [])

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
        }
    }, [userId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // --- Computed Data ---

    // 1. Filtered Matches (by Deck AND Tab AND Environment)
    const filteredMatches = useMemo(() => {
        return matches.filter(match => {
            let deckMatch = true

            if (selectedDeckId === 'all') {
                deckMatch = true
            } else if (selectedDeckId.startsWith('arch_')) {
                // Filter by Archetype (Folder)
                const targetArchId = selectedDeckId.replace('arch_', '')
                deckMatch = match.deck.archetype_id === targetArchId
            } else {
                // Filter by Specific Deck
                deckMatch = match.deck_id === selectedDeckId
            }

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
        let targetMatches = matches.filter(match => {
            if (selectedDeckId === 'all') return true
            if (selectedDeckId.startsWith('arch_')) {
                const targetArchId = selectedDeckId.replace('arch_', '')
                return match.deck.archetype_id === targetArchId
            }
            return match.deck_id === selectedDeckId
        })

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
        opponent_icon_1: null as string | null,
        opponent_icon_2: null as string | null,
        date: '',
        notes: ''
    })
    const [updating, setUpdating] = useState(false)
    const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)

    const toggleExpand = (id: string) => {
        setExpandedMatchId(prev => prev === id ? null : id)
    }

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
            mySide: mySide === null ? 0 : mySide,
            opSide: opSide === null ? 0 : opSide,
            opponent_name: match.opponent_name || '',
            opponent_icon_1: match.opponent_icon_1,
            opponent_icon_2: match.opponent_icon_2,
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
                    opponent_icon_1: editForm.opponent_icon_1,
                    opponent_icon_2: editForm.opponent_icon_2,
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
                    opponent_icon_1: editForm.opponent_icon_1,
                    opponent_icon_2: editForm.opponent_icon_2,
                    date: editForm.date,
                    notes: editForm.notes || null
                } : m
            ))
            setEditingMatchId(null)
        } catch (err) {
            alert('戦績の更新に失敗しました: ' + (err instanceof Error ? err.message : String(err)))
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
        } catch (err) {
            alert('削除に失敗しました: ' + (err instanceof Error ? err.message : String(err)))
        } finally {
            setUpdating(false)
        }
    }

    // ... (existing render logic)

    return (
        <div className="space-y-8">
            {/* Header / Filter */}
            <div className="bg-white rounded-2xl p-2.5 border-2 border-purple-100 shadow-sm">
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-gray-900">戦績分析</h2>

                    <div className="flex flex-col md:flex-row gap-3">
                        <select
                            value={selectedDeckId}
                            onChange={(e) => setSelectedDeckId(e.target.value)}
                            className="flex-1 px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">すべてのデッキ</option>

                            {/* Archetypes (Folders) */}
                            {archetypes.length > 0 && (
                                <optgroup label="📁 フォルダ (デッキタイプ集計)">
                                    {archetypes.map(arch => (
                                        <option key={`arch_${arch.id}`} value={`arch_${arch.id}`}>
                                            {arch.name} (合計)
                                        </option>
                                    ))}
                                </optgroup>
                            )}

                            {/* Individual Decks */}
                            <optgroup label="🃏 個別デッキ">
                                {decks.map(deck => (
                                    <option key={deck.id} value={deck.id}>
                                        {deck.deck_name} {deck.version_label ? `(${deck.version_label})` : ''}
                                    </option>
                                ))}
                            </optgroup>
                        </select>

                        <select
                            value={selectedEnvironmentId}
                            onChange={(e) => setSelectedEnvironmentId(e.target.value)}
                            className="flex-1 px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    {/* Win Rate Gauge Chart */}
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center relative overflow-hidden">
                        <h3 className="text-sm font-bold text-gray-500 mb-1 z-10">勝率 (Win Rate)</h3>

                        <div className="h-48 w-full relative -mb-10">
                            {graphData.total > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={graphData.pieData}
                                            cx="50%"
                                            cy="70%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {graphData.pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 pb-10">データなし</div>
                            )}

                            {/* Center Label for Gauge */}
                            {graphData.total > 0 && (
                                <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <div className="text-4xl font-black text-gray-900 tracking-tighter">
                                        {Math.round((graphData.wins / graphData.total) * 100)}
                                        <span className="text-base font-bold text-gray-400 ml-0.5">%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stats Bar */}
                        <div className="w-full grid grid-cols-3 gap-2 mt-2 z-10">
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">WIN</span>
                                <span className="text-xl font-bold text-green-500">{graphData.wins}</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">LOSE</span>
                                <span className="text-xl font-bold text-red-500">{graphData.losses}</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">DRAW</span>
                                <span className="text-xl font-bold text-gray-500">{graphData.draws}</span>
                            </div>
                        </div>

                        {/* First/Second Turn Win Rate Badges (Re-styled) */}
                        {graphData.total > 0 && (graphData.firstTurnTotal > 0 || graphData.secondTurnTotal > 0) && (
                            <div className="flex w-full gap-2 mt-3 z-10">
                                {graphData.firstTurnTotal > 0 && (
                                    <div className="flex-1 flex justify-between items-center px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg">
                                        <span className="text-[10px] font-bold text-blue-600">先攻</span>
                                        <span className="text-sm font-bold text-blue-700">{Math.round(graphData.firstTurnWinRate)}%</span>
                                    </div>
                                )}
                                {graphData.secondTurnTotal > 0 && (
                                    <div className="flex-1 flex justify-between items-center px-3 py-2 bg-purple-50/50 border border-purple-100 rounded-lg">
                                        <span className="text-[10px] font-bold text-purple-600">後攻</span>
                                        <span className="text-sm font-bold text-purple-700">{Math.round(graphData.secondTurnWinRate)}%</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bar Chart (Only for All Decks) */}
                    {selectedDeckId === 'all' && (
                        <div className="bg-gray-50 rounded-xl p-2.5 flex flex-col items-center">
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
                        <div className="bg-gray-50 rounded-xl p-2.5 grid grid-cols-2 gap-4 place-items-center">
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
            <div className="bg-white rounded-2xl p-2.5 border-2 border-pink-100 shadow-sm">
                {/* Result Filter Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-2.5 py-2 rounded-lg font-medium text-sm transition ${activeTab === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        総合 ({matches.filter(m => selectedDeckId === 'all' || m.deck_id === selectedDeckId).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('win')}
                        className={`px-2.5 py-2 rounded-lg font-medium text-sm transition ${activeTab === 'win'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                    >
                        勝ち ({matches.filter(m => (selectedDeckId === 'all' || m.deck_id === selectedDeckId) && m.result === 'win').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('loss')}
                        className={`px-2.5 py-2 rounded-lg font-medium text-sm transition ${activeTab === 'loss'
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
                                onClick={() => toggleExpand(match.id)}
                                className={`bg-white rounded-xl p-3 border shadow-sm hover:shadow-md transition cursor-pointer ${expandedMatchId === match.id ? 'border-pink-300 ring-1 ring-pink-100' : 'border-gray-200'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {/* Result Badge */}
                                        <div className={`px-2 py-1 rounded-lg border font-black text-xs min-w-[54px] text-center shadow-sm ${match.result === 'win' ? 'bg-green-500 text-white border-green-600' :
                                            match.result === 'loss' ? 'bg-red-500 text-white border-red-600' :
                                                'bg-gray-400 text-white border-gray-500'
                                            }`}>
                                            {match.result === 'win' ? 'WIN' : match.result === 'loss' ? 'LOSE' : 'DRAW'}
                                        </div>

                                        {/* Side Count (Prominent) */}
                                        {match.side && (
                                            <div className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1 shadow-inner">
                                                <span className="text-[10px] text-gray-400">SIDE</span>
                                                {match.side}
                                            </div>
                                        )}

                                        {/* Opponent Info */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-1.5">
                                                {match.opponent_icon_1 && (
                                                    <div className="w-7 h-7 bg-white rounded-full border border-gray-100 flex items-center justify-center p-0.5 shadow-sm">
                                                        <Image src={`/pokemon-icons/${match.opponent_icon_1}.png`} alt={match.opponent_icon_1} width={22} height={22} className="object-contain" />
                                                    </div>
                                                )}
                                                {match.opponent_icon_2 && (
                                                    <div className="w-7 h-7 bg-white rounded-full border border-gray-100 flex items-center justify-center p-0.5 shadow-sm">
                                                        <Image src={`/pokemon-icons/${match.opponent_icon_2}.png`} alt={match.opponent_icon_2} width={22} height={22} className="object-contain" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm font-bold text-gray-900 truncate max-w-[120px] sm:max-w-none">
                                                {match.opponent_name || '対戦相手'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:flex flex-col items-end text-[10px] text-gray-400">
                                            <div className="font-bold text-gray-500">{match.deck.deck_name}</div>
                                            <div>{new Date(match.date).toLocaleDateString()}</div>
                                        </div>
                                        <div className={`text-gray-400 transition-transform duration-200 ${expandedMatchId === match.id ? 'rotate-180' : ''}`}>
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                <div className="flex sm:hidden mt-1 text-[10px] text-gray-400 gap-2 font-medium">
                                    <span>{match.deck.deck_name}</span>
                                    <span>|</span>
                                    <span>{new Date(match.date).toLocaleDateString()}</span>
                                    {match.going_first && <span>| {match.going_first}</span>}
                                </div>

                                {/* Note & Edit Section (Conditional) */}
                                {expandedMatchId === match.id && (
                                    <div className="mt-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="flex justify-between items-center mb-2 px-1">
                                            <div className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                                <span>📝 メモ・詳細</span>
                                                {match.going_first && <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{match.going_first}</span>}
                                            </div>
                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => startEditing(match)}
                                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-pink-50 hover:text-pink-600 transition font-bold border border-gray-200 flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                    編集
                                                </button>
                                                <button
                                                    onClick={() => deleteMatch(match.id)}
                                                    className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition font-bold border border-red-100 flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                    削除
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pl-3 border-l-4 border-pink-100 pt-1 pb-2" onClick={(e) => e.stopPropagation()}>
                                            {editingMatchId === match.id ? (
                                                <div className="space-y-4 p-2 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                                                    {/* Existing editing form fields... */}
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
                                                                        className={`flex-1 py-2.5 px-1 rounded-xl text-xs font-bold transition-all shadow-sm ${editForm.result === r
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
                                                                        className={`flex-1 py-2.5 px-1 rounded-xl text-xs font-bold transition-all shadow-sm ${editForm.going_first === g
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
                                                    <div className="space-y-3 p-2.5 bg-gray-50 rounded-xl border-2 border-gray-100">
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
                                                        <PokemonIconSelector
                                                            selectedIcons={[editForm.opponent_icon_1, editForm.opponent_icon_2]}
                                                            onSelect={(icons) => setEditForm({ ...editForm, opponent_icon_1: icons[0], opponent_icon_2: icons[1] })}
                                                            label="相手のデッキアイコン"
                                                        />
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
                                                            className="px-2.5 py-2 text-sm text-gray-500 hover:bg-white rounded-md transition"
                                                            disabled={updating}
                                                        >
                                                            キャンセル
                                                        </button>
                                                        <button
                                                            onClick={() => saveMatch(match.id)}
                                                            className="px-2.5 py-2 text-sm font-bold bg-pink-500 text-white rounded-md hover:bg-pink-600 shadow-sm transition disabled:opacity-50"
                                                            disabled={updating}
                                                        >
                                                            {updating ? '保存中...' : '保存'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                                    {match.notes || <span className="text-gray-400 italic">メモなし</span>}
                                                </p>
                                            )}
                                        </div>
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
