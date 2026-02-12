'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase'
import type { ReferenceDeck, DeckArchetype } from '@/lib/supabase'

interface DeckDistributionChartProps {
    decks?: ReferenceDeck[]
    archetypes?: DeckArchetype[]
}

const COLORS = [
    '#EC4899', // Pink (To match theme)
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#6366F1', // Indigo
    '#EF4444', // Red
    '#14B8A6', // Teal
    '#84CC16', // Lime
    '#F97316', // Orange
    '#64748B', // Slate
]

export default function DeckDistributionChart({ decks: initialDecks, archetypes: initialArchetypes }: DeckDistributionChartProps) {
    const [decks, setDecks] = useState<ReferenceDeck[]>(initialDecks || [])
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>(initialArchetypes || [])
    const [loading, setLoading] = useState(!initialDecks || !initialArchetypes)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const fetchData = async () => {
        try {
            const [
                { data: decksData },
                { data: archetypesData }
            ] = await Promise.all([
                supabase.from('reference_decks').select('*'),
                supabase.from('deck_archetypes').select('*')
            ])
            if (decksData) setDecks(decksData)
            if (archetypesData) setArchetypes(archetypesData)
        } catch (e) {
            console.error('Error fetching chart data:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!initialDecks || !initialArchetypes) {
            fetchData()
        }

        // Real-time subscription for automatic updates
        const channel = supabase
            .channel('deck-distribution-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'reference_decks' },
                () => fetchData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'deck_archetypes' },
                () => fetchData()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [initialDecks, initialArchetypes])

    const data = useMemo(() => {
        // 1. Create a map of Archetype ID -> Name
        const archetypeMap = new Map<string, string>()
        archetypes.forEach(a => archetypeMap.set(a.id, a.name))

        // 2. Aggregate counts
        const counts: Record<string, number> = {}
        let total = 0

        decks.forEach(deck => {
            // Priority: Archetype Name -> Deck Name -> "Unknown"
            let name = 'その他'
            if (deck.archetype_id && archetypeMap.has(deck.archetype_id)) {
                name = archetypeMap.get(deck.archetype_id)!
            } else if (deck.deck_name) {
                name = 'その他 (未分類)'
            }

            counts[name] = (counts[name] || 0) + 1
            total++
        })

        if (total === 0) return []

        // 3. Convert to array, sort, and add rank
        return Object.entries(counts)
            .map(([name, value]) => ({
                name,
                value,
                percentage: ((value / total) * 100).toFixed(1)
            }))
            .sort((a, b) => b.value - a.value)
    }, [decks, archetypes])

    // Custom Label Render
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const RADIAN = Math.PI / 180
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        // Only show label if percentage is significant (> 5%)
        if (percent < 0.05) return null

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] md:text-xs font-bold pointer-events-none drop-shadow-md">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    if (data.length === 0) return null

    return (
        <div className="w-full h-auto min-h-[450px] md:h-[400px] flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="w-full md:w-2/3 h-[300px] md:h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={isMobile ? 100 : 120}
                            innerRadius={isMobile ? 50 : 60}
                            startAngle={90}
                            endAngle={-270}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number, name: string, props: any) => [
                                `${value}デッキ (${props.payload.percentage}%)`,
                                name
                            ]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Legend Layout: Sorted Descending, Icons Right-Aligned */}
            <div className={`w-full md:w-1/3 px-4 ${isMobile ? 'order-last' : ''}`}>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between group hover:bg-gray-50 p-1.5 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-black text-pink-500 w-7 flex-shrink-0">No.{index + 1}</span>
                                <span className="text-xs font-bold text-gray-700 truncate">{item.name}</span>
                                <span className="text-[10px] text-gray-400 font-normal">({item.percentage}%)</span>
                            </div>
                            <div
                                className="w-3 h-3 rounded-sm flex-shrink-0 ml-4 shadow-sm"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
