'use client'

import { useState, useEffect } from 'react'
import { getFeaturedCardsWithStatsAction } from '@/app/actions'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Image from 'next/image'

interface FeaturedCardStat {
    id: string
    card_name: string
    current_adoption_rate: number
    trend_history: { date: string, dateLabel: string, rate: number }[]
    image_url: string | null
}

export default function FeaturedCardTrends() {
    const [cards, setCards] = useState<FeaturedCardStat[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            const res = await getFeaturedCardsWithStatsAction()
            if (res.success && res.data && res.data.length > 0) {
                setCards(res.data)
                setSelectedCardId(res.data[0].id) // Default to first
            }
            setLoading(false)
        }
        loadData()
    }, [])

    if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl mb-6"></div>
    if (cards.length === 0) return null

    const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0]

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-xl mr-2">📈</span>
                注目カード採用率（全期間）
            </h2>

            {/* Master: Card Grid */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
                {cards.map((card) => {
                    const isSelected = selectedCardId === card.id
                    return (
                        <div
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`
                                cursor-pointer rounded-lg overflow-hidden border transition-all duration-200 relative group
                                ${isSelected ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-1 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                            `}
                        >
                            {/* Adoption Rate Badge */}
                            <div className={`
                                absolute top-1 right-1 z-10 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm
                                ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-white'}
                            `}>
                                {card.current_adoption_rate.toFixed(1)}%
                            </div>

                            {/* Image */}
                            <div className="aspect-[2/3] relative bg-gray-200">
                                {card.image_url ? (
                                    <Image
                                        src={card.image_url}
                                        alt={card.card_name}
                                        fill
                                        className={`object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}`}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                )}
                            </div>

                            {/* Name Footer (Mobile Friendly) */}
                            <div className={`
                                p-1.5 text-center text-xs font-bold truncate transition-colors
                                ${isSelected ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-700'}
                            `}>
                                {card.card_name}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Detail: Chart Area */}
            {selectedCard && (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-14 relative rounded overflow-hidden border border-gray-200 shadow-sm hidden md:block">
                                {selectedCard.image_url && <Image src={selectedCard.image_url} alt={selectedCard.card_name} fill className="object-cover" />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">{selectedCard.card_name}</h3>
                                <p className="text-xs text-gray-500">全期間の採用率推移</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-blue-600 tracking-tight">
                                {selectedCard.current_adoption_rate.toFixed(1)}
                                <span className="text-sm text-gray-500 font-normal ml-1">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedCard.trend_history} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="dateLabel"
                                    tick={{ fontSize: 11, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    minTickGap={20}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit="%"
                                    width={35}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    labelStyle={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}
                                    itemStyle={{ color: '#2563EB', fontWeight: 'bold' }}
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, '採用率']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                    animationDuration={1000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}
