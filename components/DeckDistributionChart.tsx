'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase'
import type { ReferenceDeck, DeckArchetype } from '@/lib/supabase'
import { getAllReferenceDecksAction } from '@/app/actions'
import { POKEMON_ICONS } from '@/lib/constants'

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
                res,
                { data: archetypesData }
            ] = await Promise.all([
                getAllReferenceDecksAction(),
                supabase.from('deck_archetypes').select('*')
            ])
            if (res.success && res.data) setDecks(res.data)
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
        // 1. Create a map of Archetype ID -> Info (Name, Icons)
        const archetypeInfoMap = new Map<string, { name: string, icon_1: string | null }>()
        archetypes.forEach(a => archetypeInfoMap.set(a.id, { name: a.name, icon_1: a.icon_1 || null }))

        // 2. Aggregate counts
        const counts: Record<string, { value: number, icon: string | null }> = {}
        let total = 0

        decks.forEach(deck => {
            let name = 'その他'
            let icon = null
            if (deck.archetype_id && archetypeInfoMap.has(deck.archetype_id)) {
                const info = archetypeInfoMap.get(deck.archetype_id)!
                name = info.name
                icon = info.icon_1
            } else if (deck.deck_name) {
                name = 'その他 (未分類)'
            }

            // Automatic Icon Matching: if no manual icon, check if name contains a pokemon name
            if (!icon && name !== 'その他' && name !== 'その他 (未分類)') {
                const matchedIcon = POKEMON_ICONS.find(p => name.includes(p))
                if (matchedIcon) icon = matchedIcon
            }

            if (!counts[name]) counts[name] = { value: 0, icon }
            counts[name].value++
            total++
        })

        if (total === 0) return []

        // 3. Convert to array, sort
        return Object.entries(counts)
            .map(([name, info]) => ({
                name,
                value: info.value,
                icon: info.icon,
                percentage: ((info.value / total) * 100).toFixed(1)
            }))
            .sort((a, b) => b.value - a.value)
    }, [decks, archetypes])

    // Custom Label Render with Line and Icon
    const renderCustomizedLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill, icon } = props
        const RADIAN = Math.PI / 180
        const sin = Math.sin(-RADIAN * midAngle)
        const cos = Math.cos(-RADIAN * midAngle)
        const sx = cx + (outerRadius + 5) * cos
        const sy = cy + (outerRadius + 5) * sin
        const mx = cx + (outerRadius + 20) * cos
        const my = cy + (outerRadius + 20) * sin
        const ex = mx + (cos >= 0 ? 1 : -1) * 22
        const ey = my
        const textAnchor = cos >= 0 ? 'start' : 'end'

        if (percent <= 0.03) return null // Hide 3% or less to reduce clutter

        return (
            <g>
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * 26}
                    y={ey}
                    dy={4}
                    textAnchor={textAnchor}
                    fill="#374151"
                    className="text-[10px] font-bold"
                >
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                </text>
                {icon && (
                    <image
                        x={cos >= 0 ? ex + 2 : ex - 22}
                        y={ey - 10}
                        width={20}
                        height={20}
                        href={`/pokemon-icons/${icon}.png`}
                    />
                )}
            </g>
        )
    }

    if (data.length === 0) return null

    return (
        <div className="w-full h-auto min-h-[450px] flex flex-col items-center justify-center gap-6">
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={renderCustomizedLabel}
                            outerRadius={isMobile ? 100 : 120}
                            innerRadius={isMobile ? 60 : 70}
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
                        {/* Center Label for Total Count */}
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-900">
                            <tspan x="50%" dy="-0.5em" className="text-xs font-bold fill-gray-500">Total</tspan>
                            <tspan x="50%" dy="1.2em" className="text-2xl font-black fill-gray-900">{data.reduce((acc, curr) => acc + curr.value, 0)}</tspan>
                            <tspan x="50%" dy="1.2em" className="text-[10px] font-medium fill-gray-400">decks</tspan>
                        </text>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Legend Layout: Sorted Descending, Icons Right-Aligned */}
            <div className="w-full px-4">
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between group hover:bg-gray-50 p-1.5 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-black text-pink-500 w-7 flex-shrink-0">No.{index + 1}</span>
                                {item.icon && (
                                    <div className="w-5 h-5 flex-shrink-0 relative">
                                        <img
                                            src={`/pokemon-icons/${item.icon}.png`}
                                            alt={item.icon}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
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
