'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getDeckAnalyticsAction } from '@/app/actions'

interface KeyCardAdoption {
    card_name: string
    image_url: string | null
    adoption_quantity: string
    adoption_rate: string
    category: string
}

interface KeyCardAdoptionDrawerProps {
    isOpen: boolean
    onClose: () => void
    archetypeId: string
    archetypeName: string
}

const CATEGORIES = ['Pokemon', 'Goods', 'Tool', 'Supporter', 'Stadium', 'Energy'] as const

function mapCategory(supertype: string, subtypes?: string[]): string {
    if (supertype === 'Pokémon') return 'Pokemon'
    if (supertype === 'Energy') return 'Energy'
    if (supertype === 'Trainer') {
        if (subtypes?.includes('Item')) return 'Goods'
        if (subtypes?.includes('Pokémon Tool')) return 'Tool'
        if (subtypes?.includes('Supporter')) return 'Supporter'
        if (subtypes?.includes('Stadium')) return 'Stadium'
        return 'Goods'
    }
    return 'Goods'
}

export default function KeyCardAdoptionDrawer({ isOpen, onClose, archetypeId, archetypeName }: KeyCardAdoptionDrawerProps) {
    const [loading, setLoading] = useState(true)
    const [adoptionData, setAdoptionData] = useState<KeyCardAdoption[]>([])
    const [totalDecks, setTotalDecks] = useState(0)
    const [period, setPeriod] = useState<'all' | 'recent'>('all')

    useEffect(() => {
        if (isOpen && archetypeId) {
            fetchData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, archetypeId, period])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await getDeckAnalyticsAction(archetypeId, undefined, period)
            if (result.success && result.analytics) {
                setTotalDecks(result.totalDecks || 0)
                const mapped: KeyCardAdoption[] = result.analytics.map((stat: any) => ({
                    card_name: stat.name,
                    image_url: stat.imageUrl || null,
                    adoption_rate: stat.adoptionRate.toFixed(1),
                    adoption_quantity: stat.avgQuantity.toFixed(1),
                    category: mapCategory(stat.supertype, stat.subtypes),
                }))
                setAdoptionData(mapped)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[150] flex justify-end pointer-events-none">
            <div
                className="absolute inset-0 bg-black/40 pointer-events-auto backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out flex flex-col">
                <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <div className="text-xs font-bold text-gray-500">キーカード採用率</div>
                        <h2 className="text-lg font-bold text-gray-900">{archetypeName}</h2>
                        {totalDecks > 0 && (
                            <div className="text-xs text-gray-400">{totalDecks}デッキ集計</div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition text-black"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* 期間タブ */}
                <div className="flex border-b bg-white">
                    <button
                        onClick={() => setPeriod('all')}
                        className={`flex-1 py-2.5 text-sm font-bold transition-colors ${period === 'all'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        全期間
                    </button>
                    <button
                        onClick={() => setPeriod('recent')}
                        className={`flex-1 py-2.5 text-sm font-bold transition-colors ${period === 'recent'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        直近2ヶ月
                    </button>
                </div>

                {/* 詳細ページへの導線 */}
                <Link
                    href={`/archetypes/${encodeURIComponent(archetypeName)}`}
                    className="block mx-4 mt-3 text-center text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-2.5 transition-colors"
                >
                    {archetypeName}デッキの採用カード詳細ページへ →
                </Link>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
                            <p className="text-gray-500 text-sm">データを分析中...</p>
                        </div>
                    ) : adoptionData.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p>データがありません</p>
                        </div>
                    ) : (
                        CATEGORIES.map((category) => {
                            const categoryCards = adoptionData.filter(c => c.category === category)
                            if (categoryCards.length === 0) return null

                            return (
                                <div key={category}>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {categoryCards.map((card, i) => (
                                            <div key={i} className="group relative">
                                                <div className="relative aspect-[3/4] mb-1.5 rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                                                    {card.image_url ? (
                                                        <Image
                                                            src={card.image_url}
                                                            alt={card.card_name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Img</div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-[1px] text-white text-[10px] font-bold py-0.5 text-center">
                                                        平均 {card.adoption_quantity}枚
                                                    </div>
                                                    <div className="absolute top-0 right-0 bg-blue-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                                                        {card.adoption_rate}%
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-700 font-medium truncate text-center">
                                                    {card.card_name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
