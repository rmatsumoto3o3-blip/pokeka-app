'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { createClient } from '@/utils/supabase/client'
import type { DeckArchetype } from '@/lib/supabase'
import { getArchetypeDistributionStatsAction } from '@/app/actions'
import { POKEMON_ICONS } from '@/lib/constants'

interface DeckDistributionChartProps {
    decks?: any[]
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
    const supabase = createClient()
    const [deckCounts, setDeckCounts] = useState<Record<string, number>>({})
    const [globalTotal, setGlobalTotal] = useState(0)
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>(initialArchetypes || [])
    const [loading, setLoading] = useState(true)
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
            const [res, { data: archetypesData }] = await Promise.all([
                getArchetypeDistributionStatsAction(),
                supabase.from('deck_archetypes').select('*')
            ])
            if (res.success) {
                setDeckCounts(res.deckCounts)
                setGlobalTotal(res.globalTotal)
            }
            if (archetypesData) setArchetypes(archetypesData)
        } catch (e) {
            console.error('Error fetching chart data:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()

        // Real-time subscription for automatic updates (deck_archetypes の変更時だけ再取得)
        const channel = supabase
            .channel('deck-distribution-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'deck_archetypes' },
                () => fetchData()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const data = useMemo(() => {
        if (Object.keys(deckCounts).length === 0 || archetypes.length === 0) return []

        const total = globalTotal || Object.values(deckCounts).reduce((a, b) => a + b, 0)
        if (total === 0) return []

        return archetypes
            .filter(arch => deckCounts[arch.id] && deckCounts[arch.id] > 0)
            .map(arch => {
                const count = deckCounts[arch.id]
                const name = arch.name
                let icon = arch.icon_1 || null

                // Automatic Icon Matching
                if (!icon) {
                    const matchedIcon = POKEMON_ICONS.find(p => name.includes(p))
                    if (matchedIcon) icon = matchedIcon
                }

                return {
                    name,
                    value: count,
                    icon,
                    percentage: ((count / total) * 100).toFixed(1)
                }
            })
            .sort((a, b) => b.value - a.value)
    }, [deckCounts, globalTotal, archetypes])

    // Custom Label Render with Line and Icon
    const renderCustomizedLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill, icon } = props
        const RADIAN = Math.PI / 180
        const sin = Math.sin(-RADIAN * midAngle)
        const cos = Math.cos(-RADIAN * midAngle)

        // Mobile optimizations for label lines - significantly shortened to prevent clipping
        const labelLineOffset = isMobile ? 4 : 20
        const labelHorizontalOffset = isMobile ? 6 : 22

        const sx = cx + (outerRadius + 5) * cos
        const sy = cy + (outerRadius + 5) * sin
        const mx = cx + (outerRadius + labelLineOffset) * cos
        const my = cy + (outerRadius + labelLineOffset) * sin
        const ex = mx + (cos >= 0 ? 1 : -1) * labelHorizontalOffset
        const ey = my
        const textAnchor = cos >= 0 ? 'start' : 'end'

        if (percent < 0.045) return null // Hide less than 4.5% (rounds to <5%) to reduce clutter

        return (
            <g>
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * (isMobile ? 12 : 26)}
                    y={ey}
                    dy={4}
                    textAnchor={textAnchor}
                    fill="#374151"
                    className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} font-bold`}
                >
                    {`${(percent * 100).toFixed(0)}%`}
                </text>
                {icon && (
                    <image
                        x={cos >= 0 ? ex + 2 : ex - (isMobile ? 14 : 22)}
                        y={ey - (isMobile ? 8 : 10)}
                        width={isMobile ? 14 : 20}
                        height={isMobile ? 14 : 20}
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
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={isMobile ? 85 : 120}
                            innerRadius={isMobile ? 50 : 70}
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
                            <tspan x="50%" dy="1.2em" className="text-2xl font-black fill-gray-900">{globalTotal || data.reduce((acc, curr) => acc + curr.value, 0)}</tspan>
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
