'use client'

import { useState, useEffect } from 'react'
import { getArchetypeWinStatsAction } from '@/app/actions'
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    Cell
} from 'recharts'
import Image from 'next/image'

interface ArchetypeWinStat {
    id: string
    name: string
    total: number
    wins: number
}

export default function ArchetypeWinChart() {
    const [stats, setStats] = useState<ArchetypeWinStat[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const res = await getArchetypeWinStatsAction()
            if (res.success && res.data) {
                setStats(res.data)
            }
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-2xl mb-8"></div>
    if (stats.length === 0) return null

    // Sort by wins for the chart display (if needed, already sorted in action)
    const chartData = stats.slice(0, 20) // Show top 20 for better environmental overview

    return (
        <div className="bg-white rounded-2xl border-2 border-pink-100 shadow-sm p-4 md:p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg shadow-sm">
                        <Image
                            src="/victory.png"
                            alt="Victory"
                            width={28}
                            height={28}
                            className="w-7 h-7"
                        />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">デッキ別 優勝数集計</h2>
                        <p className="text-xs text-gray-500 font-medium">分析済みデッキ全 {stats[0]?.total || 0} 件の統計結果</p>
                    </div>
                </div>
                
                <div className="hidden md:flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-gray-600">優勝数</span>
                    </div>
                </div>
            </div>

            <div className="h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F4F6" />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={160}
                            tick={{ fontSize: 13, fontWeight: 'bold', fill: '#374151' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip 
                            cursor={{ fill: '#F9FAFB' }}
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: number) => [value, '優勝数']}
                        />
                        <Bar 
                            dataKey="wins" 
                            fill="#F59E0B" 
                            radius={[0, 6, 6, 0]} 
                            barSize={32}
                            name="wins"
                            label={{ position: 'right', fill: '#D97706', fontSize: 13, fontWeight: 'bold', offset: 10 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Mobile Legend */}
            <div className="md:hidden flex flex-wrap gap-4 mt-4 px-2 text-[10px] font-bold text-gray-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                    <span>優勝数</span>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {stats.slice(0, 5).map((s, i) => (
                    <div key={s.id} className="text-center p-3 rounded-xl bg-gray-50/50 border border-gray-100/50">
                        <div className="text-[10px] font-black text-orange-500 uppercase tracking-wider mb-1">Tier {i+1}</div>
                        <div className="text-xs font-bold text-gray-900 truncate px-1">{s.name}</div>
                        <div className="flex items-center justify-center gap-1.5 mt-1">
                            <span className="text-lg font-black text-gray-900">{s.wins}</span>
                            <span className="text-[10px] text-gray-400 font-bold">WINS</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
