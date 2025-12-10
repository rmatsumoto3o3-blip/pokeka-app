'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ReferenceDeck, DeckArchetype } from '@/lib/supabase'

interface ReferenceDeckListProps {
    userId?: string | null
    userEmail?: string | null
    initialDecks?: ReferenceDeck[]
    initialArchetypes?: DeckArchetype[]
}

const EVENT_TYPES = [
    'All',
    'Gym Battle',
    'City League',
    'Championship',
    'Worldwide'
] as const

const EVENT_TYPE_LABELS: Record<string, string> = {
    'All': 'すべて',
    'Gym Battle': 'ジムバトル',
    'City League': 'シティリーグ',
    'Championship': 'チャンピオンシップ',
    'Worldwide': 'Worldwide'
}



export default function ReferenceDeckList({
    userId,
    userEmail,
    initialDecks = [],
    initialArchetypes = []
}: ReferenceDeckListProps) {
    const [decks, setDecks] = useState<ReferenceDeck[]>(initialDecks)
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>(initialArchetypes)
    const [selectedEvent, setSelectedEvent] = useState('All')
    const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(null) // Use ID for navigation
    const [loading, setLoading] = useState(initialDecks.length === 0)
    const [selectedDeckImage, setSelectedDeckImage] = useState<string | null>(null) // Modal State

    // Admin Check (Safe for guest)
    const isAdmin = userEmail === 'player1@pokeka.local' ||
        userEmail === 'player2@pokeka.local' ||
        userEmail === 'player3@pokeka.local'

    useEffect(() => {
        // If we have initial data, don't fetch (unless we want to refresh, but for now ISR is the goal)
        if (initialDecks.length > 0) return

        const loadData = async () => {
            await Promise.all([fetchDecks(), fetchArchetypes()])
            setLoading(false)
        }
        loadData()
    }, [initialDecks.length])

    const fetchDecks = async () => {
        const { data, error } = await supabase
            .from('reference_decks')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setDecks(data)
        }
    }

    const fetchArchetypes = async () => {
        const { data, error } = await supabase
            .from('deck_archetypes')
            .select('*')
            .order('name')

        if (!error && data) {
            setArchetypes(data)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent folder click if distinct
        if (!confirm('本当に削除しますか？')) return

        const { error } = await supabase
            .from('reference_decks')
            .delete()
            .eq('id', id)

        if (!error) {
            setDecks(decks.filter(d => d.id !== id))
        }
    }

    // Filter Logic (Event)
    const filteredDecks = decks.filter(deck => {
        if (selectedEvent === 'All') return true
        return deck.event_type === selectedEvent
    })

    // Helper to get archetype for a deck
    const getArchetypeForDeck = (archetypeId: string | null) => {
        if (!archetypeId) return null
        return archetypes.find(a => a.id === archetypeId)
    }

    // Grouping Logic
    const groupedDecks: { [key: string]: ReferenceDeck[] } = {}

    // Initialize groups for all known archetypes (so empty ones could theoretically exist, but we filter to used ones usually)
    // Actually better to just group by what decks we have.

    filteredDecks.forEach(deck => {
        const archetype = getArchetypeForDeck(deck.archetype_id)
        const key = archetype ? archetype.id : 'others' // Use ID as key
        if (!groupedDecks[key]) {
            groupedDecks[key] = []
        }
        groupedDecks[key].push(deck)
    })

    // Sort Archetype IDs for display
    const sortedArchetypeIds = Object.keys(groupedDecks).sort((aId, bId) => {
        if (aId === 'others') return 1
        if (bId === 'others') return -1

        const aName = archetypes.find(a => a.id === aId)?.name || ''
        const bName = archetypes.find(a => a.id === bId)?.name || ''
        return aName.localeCompare(bName)
    })

    if (loading) return <div className="text-gray-500 text-center py-8">読み込み中...</div>

    // Modal
    const renderModal = () => {
        if (!selectedDeckImage) return null
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedDeckImage(null)}>
                <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
                    <button
                        className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                        onClick={() => setSelectedDeckImage(null)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <img
                        src={selectedDeckImage}
                        alt="Deck Preview"
                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        )
    }

    // VIEW: Detail View (Inside a Folder)
    if (selectedArchetypeId) {
        const archetypeDecks = groupedDecks[selectedArchetypeId] || []
        const currentArchetype = selectedArchetypeId === 'others'
            ? { name: 'その他' }
            : archetypes.find(a => a.id === selectedArchetypeId)

        const displayName = currentArchetype?.name || 'その他'

        return (
            <div className="space-y-6">
                {renderModal()}

                {/* Header / Back Button */}
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => setSelectedArchetypeId(null)}
                        className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <span className="bg-gradient-to-r from-pink-500 to-purple-500 w-1 h-6 rounded-full mr-3"></span>
                        {displayName}
                        <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {archetypeDecks.length}
                        </span>
                    </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:grid-cols-3">
                    {archetypeDecks.map((deck) => (
                        <div
                            key={deck.id}
                            onClick={() => setSelectedDeckImage(deck.image_url || null)}
                            className="bg-white rounded-lg md:rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition group cursor-pointer"
                        >
                            <div className="aspect-[3/4] md:aspect-video bg-gray-100 relative overflow-hidden">
                                {deck.image_url ? (
                                    <img
                                        src={deck.image_url}
                                        alt={deck.deck_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <span className="text-4xl">⚡️</span>
                                    </div>
                                )}
                                {/* Event Badge */}
                                {deck.event_type && (
                                    <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                                        {EVENT_TYPE_LABELS[deck.event_type] || deck.event_type}
                                    </div>
                                )}
                            </div>

                            <div className="p-2 md:p-3">
                                <h4 className="font-bold text-gray-900 mb-1 truncate text-xs md:text-sm lg:text-base">{deck.deck_name}</h4>

                                {deck.deck_code && (
                                    <div className="flex items-center text-[10px] md:text-xs text-gray-500 mb-2 bg-gray-50 p-1 rounded">
                                        <span className="hidden md:inline mr-2 px-1 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">CODE</span>
                                        <span className="font-mono select-all truncate">{deck.deck_code}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-1 pt-1 md:mt-2 md:pt-2 border-t border-gray-50">
                                    {deck.deck_url ? (
                                        <a
                                            href={deck.deck_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()} // Prevent modal open
                                            className="text-[10px] md:text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center bg-pink-50 px-2 py-1 rounded-full"
                                        >
                                            <span className="truncate">詳細を見る</span>
                                            <span className="ml-1">→</span>
                                        </a>
                                    ) : (
                                        <span className="text-[10px] md:text-sm text-gray-400">詳細なし</span>
                                    )}

                                    {isAdmin && (
                                        <button
                                            onClick={(e) => handleDelete(deck.id, e)}
                                            className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                                        >
                                            削除
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // VIEW: Top Level (Folders)
    return (
        <div className="space-y-6">
            {renderModal()}

            {/* Event Filter Tabs */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
                {EVENT_TYPES.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedEvent(type)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedEvent === type
                            ? 'bg-pink-500 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
                            }`}
                    >
                        {EVENT_TYPE_LABELS[type]}
                    </button>
                ))}
            </div>

            {/* Archetype Grid */}
            {(filteredDecks.length === 0) ? (
                <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">該当する参考デッキはありません</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {sortedArchetypeIds.map(archetypeId => {
                        const decks = groupedDecks[archetypeId]

                        let displayName = 'その他'
                        let coverImage = decks[0]?.image_url

                        if (archetypeId !== 'others') {
                            const archetypeData = archetypes.find(a => a.id === archetypeId)
                            if (archetypeData) {
                                displayName = archetypeData.name
                                // Priority: 1. Manual Cover, 2. First Deck Image
                                if (archetypeData.cover_image_url) {
                                    coverImage = archetypeData.cover_image_url
                                }
                            }
                        }

                        return (
                            <button
                                key={archetypeId}
                                onClick={() => setSelectedArchetypeId(archetypeId)}
                                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 group text-left"
                            >
                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                    {coverImage ? (
                                        <img
                                            src={coverImage}
                                            alt={displayName}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                            <span className="text-4xl">⚡️</span>
                                        </div>
                                    )}
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                                    {/* Content Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                                        <h3 className="text-lg md:text-xl font-bold truncate leading-tight mb-1">{displayName}</h3>
                                        <p className="text-xs md:text-sm text-gray-200 font-medium flex items-center">
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs mr-2">{decks.length} Decks</span>
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
