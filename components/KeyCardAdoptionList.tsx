'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface KeyCardAdoption {
    id: string
    archetype_id: string
    card_name: string
    image_url: string | null
    adoption_quantity: number
    category: 'Pokemon' | 'Goods' | 'Tool' | 'Supporter' | 'Stadium' | 'Energy'
    description: string | null
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
    const [keyCards, setKeyCards] = useState<KeyCardAdoption[]>([])
    const [expandedArchetypeId, setExpandedArchetypeId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchKeyCards()

        // Supabaseのリアルタイム購読を設定
        const channel = supabase
            .channel('key_card_changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE全て
                    schema: 'public',
                    table: 'key_card_adoptions'
                },
                (payload) => {
                    console.log('Key card changed:', payload)
                    // データが変更されたら再取得
                    fetchKeyCards()
                }
            )
            .subscribe()

        // クリーンアップ
        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchKeyCards = async () => {
        try {
            const { data: archetypesData, error: archError } = await supabase
                .from('deck_archetypes')
                .select('*')
                .order('name')

            if (archError) throw archError
            setArchetypes(archetypesData || [])

            const { data: cardsData, error: cardsError } = await supabase
                .from('key_card_adoptions')
                .select('*')
                .order('adoption_quantity', { ascending: false })

            if (cardsError) throw cardsError
            setKeyCards(cardsData || [])

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

    return (
        <div className="space-y-4">
            {archetypes.map((archetype) => {
                const archetypeCards = keyCards.filter(c => c.archetype_id === archetype.id)
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
                                                {categoryCards.map((card) => (
                                                    <div key={card.id} className="flex-shrink-0 w-24 md:w-28 text-center group">
                                                        {/* Card Image */}
                                                        <div className="relative aspect-[3/4] mb-1.5 rounded-lg overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition bg-gray-100">
                                                            {card.image_url ? (
                                                                <img
                                                                    src={card.image_url}
                                                                    alt={card.card_name}
                                                                    className="w-full h-full object-cover"
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

            {keyCards.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    データがありません
                </div>
            )}
        </div>
    )
}
