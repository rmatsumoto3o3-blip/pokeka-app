'use client'

import { useState, useEffect } from 'react'
import { getGlobalDeckAnalyticsAction } from '@/app/actions'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import Image from 'next/image'
import type { DeckArchetype } from '@/lib/supabase'

interface CardStat {
    id: string
    card_name: string
    image_url: string | null
    adoption_rate: string
    adoption_quantity: string
}

interface CardSearchAnalysisProps {
    initialArchetypes: DeckArchetype[]
}

export default function CardSearchAnalysis({ initialArchetypes }: CardSearchAnalysisProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedArchetypeId, setSelectedArchetypeId] = useState('')
    const [loading, setLoading] = useState(true)
    const [globalData, setGlobalData] = useState<CardStat[]>([])
    const [archetypeData, setArchetypeData] = useState<Record<string, CardStat[]>>({})

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await getGlobalDeckAnalyticsAction()
            if (res.success) {
                setGlobalData(res.globalAnalytics || [])
                setArchetypeData(res.analyticsByArchetype || {})
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Filter cards by search term
    const filteredGlobal = globalData.filter(c =>
        c.card_name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5) // Show only top 5 matches to avoid clutter

    // Get stats for a specific card
    const getStatsForCard = (cardName: string) => {
        const global = globalData.find(c => c.card_name === cardName)
        const archCards = selectedArchetypeId ? (archetypeData[selectedArchetypeId] || []) : []
        const arch = archCards.find(c => c.card_name === cardName)

        return {
            rate: [
                { name: '全体', value: parseFloat(global?.adoption_rate || '0') },
                { name: 'アーキタイプ', value: parseFloat(arch?.adoption_rate || '0') }
            ],
            qty: [
                { name: '全体', value: parseFloat(global?.adoption_quantity || '0') },
                { name: 'アーキタイプ', value: parseFloat(arch?.adoption_quantity || '0') }
            ]
        }
    }

    return (
        <div className="bg-white rounded-2xl border-2 border-orange-100 shadow-sm p-4 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🔍 カード検索
                </h3>
                <p className="text-xs text-gray-500 mt-1">分析済みデッキ内の採用率と平均枚数を比較</p>
            </div>

            <div className="space-y-3 mb-6">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">カード名</label>
                    <input
                        type="text"
                        placeholder="デカヌチャン、ナンジャモ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm focus:border-orange-200 outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">比較対象アーキタイプ</label>
                    <select
                        value={selectedArchetypeId}
                        onChange={(e) => setSelectedArchetypeId(e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm focus:border-orange-200 outline-none transition-colors bg-white"
                    >
                        <option value="">選択しない（全体のみ）</option>
                        {initialArchetypes.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : searchTerm.length > 0 ? (
                    <div className="space-y-6">
                        {filteredGlobal.length > 0 ? (
                            filteredGlobal.map((card) => {
                                const stats = getStatsForCard(card.card_name)
                                return (
                                    <div key={card.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-16 relative rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-white">
                                                {card.image_url ? (
                                                    <Image src={card.image_url} alt={card.card_name} fill className="object-cover" unoptimized />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">Img</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{card.card_name}</div>
                                                <div className="text-[10px] text-gray-500">
                                                    全体採用率: <span className="text-orange-600 font-bold">{card.adoption_rate}%</span> / 平均: <span className="text-orange-600 font-bold">{card.adoption_quantity}枚</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 h-32 w-full">
                                            {/* Rate Chart */}
                                            <div className="flex flex-col">
                                                <div className="text-[10px] font-bold text-gray-400 text-center mb-1">採用率 (%)</div>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={stats.rate} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
                                                        <XAxis
                                                            dataKey="name"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 9, fill: '#9CA3AF' }}
                                                        />
                                                        <YAxis hide domain={[0, 100]} />
                                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                                                            {stats.rate.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#F97316' : '#8B5CF6'} />
                                                            ))}
                                                            <LabelList
                                                                dataKey="value"
                                                                position="top"
                                                                formatter={(v: any) => `${v}%`}
                                                                style={{ fontSize: 9, fontWeight: 'bold', fill: '#4B5563' }}
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Quantity Chart */}
                                            <div className="flex flex-col">
                                                <div className="text-[10px] font-bold text-gray-400 text-center mb-1">平均枚数 (枚)</div>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={stats.qty} margin={{ top: 15, right: 5, left: 5, bottom: 5 }}>
                                                        <XAxis
                                                            dataKey="name"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fontSize: 9, fill: '#9CA3AF' }}
                                                        />
                                                        <YAxis hide domain={[0, 4]} />
                                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                                                            {stats.qty.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#F97316' : '#8B5CF6'} />
                                                            ))}
                                                            <LabelList
                                                                dataKey="value"
                                                                position="top"
                                                                formatter={(v: any) => `${v}枚`}
                                                                style={{ fontSize: 9, fontWeight: 'bold', fill: '#4B5563' }}
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                カードが見つかりません
                            </div>
                        )
                        }
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        カード名を入力して分析を開始
                    </div>
                )}
            </div>
        </div>
    )
}
