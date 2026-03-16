'use client'

import { useState, useEffect } from 'react'
import { getFeaturedCardsWithStatsAction } from '@/app/actions'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Image from 'next/image'
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FeaturedCardStat {
    id: string
    card_name: string
    current_adoption_rate: number
    trend_history: { date: string, dateLabel: string, rate: number }[]
    image_url: string | null
    top_archetype?: { name: string, rate: number }
}

export default function FeaturedCardTrends() {
    const [cards, setCards] = useState<FeaturedCardStat[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    const loadData = async (overrideStart?: string, overrideEnd?: string) => {
        setLoading(true)
        const sDate = overrideStart !== undefined ? overrideStart : (startDate || undefined)
        const eDate = overrideEnd !== undefined ? overrideEnd : (endDate || undefined)

        const res = await getFeaturedCardsWithStatsAction(sDate, eDate)
        if (res.success && res.data && res.data.length > 0) {
            setCards(res.data)
            // Keep selected card if it still exists in the new data, otherwise select first
            if (!selectedCardId || !res.data.find(c => c.id === selectedCardId)) {
                setSelectedCardId(res.data[0].id)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl mb-6"></div>
    if (cards.length === 0) return null

    const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0]

    const handleClearDates = () => {
        setStartDate('')
        setEndDate('')
        loadData('', '')
    }

    const handleApplyFilter = () => {
        loadData()
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2.5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <Image
                        src="/Eevee.png"
                        alt="Trending"
                        width={28}
                        height={28}
                        className="w-7 h-7 mr-2"
                    />
                    注目カード採用率{startDate || endDate ? `（${startDate || '*'} 〜 ${endDate || '*'}）` : '（全期間）'}
                </h2>

                {/* Filter Section */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase">
                        <CalendarIcon className="w-4 h-4 mr-1 text-orange-400" />
                        期間
                    </div>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="text"
                            placeholder="MM/DD"
                            className="w-16 px-2 py-1 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder:text-gray-300"
                            value={startDate}
                            maxLength={5}
                            onChange={(e) => setStartDate(e.target.value.replace(/[^0-9/]/g, ''))}
                        />
                        <span className="text-gray-400 text-xs">〜</span>
                        <input
                            type="text"
                            placeholder="MM/DD"
                            className="w-16 px-2 py-1 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder:text-gray-300"
                            value={endDate}
                            maxLength={5}
                            onChange={(e) => setEndDate(e.target.value.replace(/[^0-9/]/g, ''))}
                        />
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                        <button
                            onClick={handleApplyFilter}
                            className="px-3 py-1 bg-white border border-orange-200 hover:border-orange-500 text-orange-600 text-xs font-bold rounded shadow-sm transition-colors"
                        >
                            絞り込み
                        </button>
                        {(startDate || endDate) && (
                            <button
                                onClick={handleClearDates}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="期間をクリア"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

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
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl animate-in fade-in zoom-in-95 duration-200">
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
                            {selectedCard.top_archetype && (
                                <div className="text-[10px] text-gray-400 mt-1">
                                    <span className="bg-gray-100 px-1 rounded mr-1">Top</span>
                                    {selectedCard.top_archetype.name} ({selectedCard.top_archetype.rate}%)
                                </div>
                            )}
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
