'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getGlobalDeckAnalyticsAction } from '@/app/actions'
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface KeyCardAdoption {
    id: string
    card_name: string
    image_url: string | null
    adoption_quantity: string // string because of toFixed
    adoption_rate: string // string because of toFixed
    category: string
}

interface Archetype {
    id: string
    name: string
}

const CATEGORIES = ['Pokemon', 'Goods', 'Tool', 'Supporter', 'Stadium', 'Energy'] as const

interface KeyCardAdoptionListProps {
    initialArchetypes?: Archetype[]
}

export default function KeyCardAdoptionList({ initialArchetypes = [] }: KeyCardAdoptionListProps) {
    const [archetypes, setArchetypes] = useState<Archetype[]>(initialArchetypes)
    const [analyticsData, setAnalyticsData] = useState<Record<string, KeyCardAdoption[]>>({})
    const [expandedArchetypeId, setExpandedArchetypeId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    useEffect(() => {
        fetchKeyCards()
    }, [])

    const fetchKeyCards = async (overrideStart?: string, overrideEnd?: string) => {
        try {
            setLoading(true)
            // Fetch Archetypes
            const { data: archetypesData, error: archError } = await supabase
                .from('deck_archetypes')
                .select('*')
                .order('name')

            if (archError) throw archError
            setArchetypes(archetypesData || [])

            // Fetch Global Analytics (Automated, with optional date filters)
            const result = await getGlobalDeckAnalyticsAction(
                overrideStart !== undefined ? overrideStart : (startDate || undefined),
                overrideEnd !== undefined ? overrideEnd : (endDate || undefined)
            )
            if (result.success && result.analyticsByArchetype) {
                setAnalyticsData(result.analyticsByArchetype)
            }

        } catch (err) {
            console.error('Error fetching key cards:', err)
        } finally {
            setLoading(false)
        }
    }

    const toggleArchetype = (id: string) => {
        if (expandedArchetypeId === id) {
            setExpandedArchetypeId(null)
        } else {
            setExpandedArchetypeId(id)
        }
    }

    if (loading) return <div className="text-center py-4 text-gray-500">読み込み中...</div>

    if (loading) return <div className="text-center py-4 text-gray-500">読み込み中...</div>

    const handleClearDates = () => {
        setStartDate('')
        setEndDate('')
        fetchKeyCards('', '') // Pass empty strings to override current state during fetch
    }

    const handleApplyFilter = () => {
        fetchKeyCards()
    }

    return (
        <div className="space-y-4">
            {/* Filter Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
                <div className="flex items-center text-sm font-medium text-gray-700">
                    <CalendarIcon className="w-5 h-5 mr-1.5 text-orange-400" />
                    集計期間:
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="MM/DD"
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder:text-gray-300"
                        value={startDate}
                        maxLength={5}
                        onChange={(e) => setStartDate(e.target.value.replace(/[^0-9/]/g, ''))}
                    />
                    <span className="text-gray-500">〜</span>
                    <input
                        type="text"
                        placeholder="MM/DD"
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder:text-gray-300"
                        value={endDate}
                        maxLength={5}
                        onChange={(e) => setEndDate(e.target.value.replace(/[^0-9/]/g, ''))}
                    />
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    <button
                        onClick={handleApplyFilter}
                        className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-md shadow-sm transition-colors"
                    >
                        絞り込み
                    </button>
                    {(startDate || endDate) && (
                        <button
                            onClick={handleClearDates}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="期間をクリア"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <p className="w-full text-xs text-gray-400 mt-1">※例: 3/1 や 03/14 のように入力してください</p>
            </div>

            {archetypes.map((archetype) => {
                const archetypeCards = analyticsData[archetype.id] || []
                if (archetypeCards.length === 0) return null // Skip empty archetypes

                const isExpanded = expandedArchetypeId === archetype.id

                return (
                    <div key={archetype.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Header */}
                        <button
                            onClick={() => toggleArchetype(archetype.id)}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center text-left"
                        >
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
                                {archetype.name}
                            </h3>
                            <span className="text-gray-400">
                                {isExpanded ? '▼' : '▶'}
                            </span>
                        </button>

                        {/* Content */}
                        {isExpanded && (
                            <div className="p-4 space-y-6">
                                {CATEGORIES.map((category) => {
                                    const categoryCards = archetypeCards.filter(c => c.category === category)
                                    if (categoryCards.length === 0) return null

                                    return (
                                        <div key={category}>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                                                {category}
                                            </h4>

                                            {/* Horizontal Scroll Container */}
                                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                                {categoryCards.map((card, i) => (
                                                    <div key={i} className="flex-shrink-0 w-24 md:w-28 text-center group">
                                                        {/* Card Image */}
                                                        <div className="relative aspect-[3/4] mb-1.5 rounded-lg overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition bg-gray-100">
                                                            {card.image_url ? (
                                                                <Image
                                                                    src={card.image_url}
                                                                    alt={card.card_name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                                                    Img
                                                                </div>
                                                            )}
                                                            {/* Adoption Quantity Badge */}
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm text-white text-xs font-bold py-0.5">
                                                                {card.adoption_quantity}枚
                                                            </div>
                                                            {/* Adoption Rate Badge (Top Right) */}
                                                            <div className="absolute top-0 right-0 bg-blue-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                                                                {card.adoption_rate}%
                                                            </div>
                                                        </div>
                                                        {/* Card Name */}
                                                        <p className="text-xs text-gray-700 font-medium truncate px-1">
                                                            {card.card_name}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}

            {Object.keys(analyticsData).length === 0 && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    自動分析データがありません。<br />
                    <span className="text-xs">管理者画面からデッキコードを登録してください。</span>
                </div>
            )}
        </div>
    )
}

