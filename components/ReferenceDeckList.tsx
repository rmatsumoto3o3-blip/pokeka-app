'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { ReferenceDeck, DeckArchetype } from '@/lib/supabase'
import Image from 'next/image'
import DeckViewerModal from './DeckViewerModal' // Import the new modal

// Helper Component for Auto-Scaling Text
function AutoFitText({ text, className = "" }: { text: string, className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLSpanElement>(null)
    const [scale, setScale] = useState(1)

    useEffect(() => {
        const container = containerRef.current
        const content = textRef.current
        if (!container || !content) return

        const resize = () => {
            const containerWidth = container.clientWidth
            const contentWidth = content.scrollWidth

            if (contentWidth > containerWidth) {
                setScale(containerWidth / contentWidth)
            } else {
                setScale(1)
            }
        }

        resize()
        // Simple scaling, no debounce needed for simple use case
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [text])

    return (
        <div ref={containerRef} className={`w-full overflow-hidden ${className}`}>
            <span
                ref={textRef}
                className="inline-block whitespace-nowrap origin-left"
                style={{ transform: `scale(${scale})` }}
            >
                {text}
            </span>
        </div>
    )
}

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
    // userId removed as unused per lint
    userEmail,
    initialDecks = [],
    initialArchetypes = []
}: ReferenceDeckListProps) {
    const [decks, setDecks] = useState<ReferenceDeck[]>(initialDecks)
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>(initialArchetypes)
    const [selectedEvent, setSelectedEvent] = useState('All')
    const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(null) // Use ID for navigation
    const [loading, setLoading] = useState(initialDecks.length === 0)

    // View State
    const [viewerDeckCode, setViewerDeckCode] = useState<string | null>(null)
    const [viewerDeckName, setViewerDeckName] = useState<string>('')
    const [selectedDeckImage, setSelectedDeckImage] = useState<string | null>(null) // Legacy Image Modal

    // Edit State
    const [editingDeck, setEditingDeck] = useState<ReferenceDeck | null>(null)
    const [editName, setEditName] = useState('')
    const [editEventType, setEditEventType] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Admin Check (Safe for guest)
    const isAdmin = userEmail === 'player1@pokeka.local' ||
        userEmail === 'player2@pokeka.local' ||
        userEmail === 'player3@pokeka.local'

    useEffect(() => {
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
            .order('display_order', { ascending: true })
            .order('name', { ascending: true })

        if (!error && data) {
            setArchetypes(data)
        }
    }

    const handleEdit = (deck: ReferenceDeck, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingDeck(deck)
        setEditName(deck.deck_name)
        setEditEventType(deck.event_type || '')
    }

    const handleSaveEdit = async () => {
        if (!editingDeck) return
        setIsSaving(true)

        try {
            const { error } = await supabase
                .from('reference_decks')
                .update({
                    deck_name: editName,
                    event_type: editEventType || null
                })
                .eq('id', editingDeck.id)

            if (error) throw error

            // Update local state
            setDecks(decks.map(d =>
                d.id === editingDeck.id
                    ? { ...d, deck_name: editName, event_type: (editEventType || null) as ReferenceDeck['event_type'] }
                    : d
            ))
            setEditingDeck(null)
            alert('変更を保存しました')
        } catch (e) {
            console.error(e)
            alert('保存に失敗しました')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('本当に削除しますか？')) return

        const { error } = await supabase
            .from('reference_decks')
            .delete()
            .eq('id', id)

        if (!error) {
            setDecks(decks.filter(d => d.id !== id))
        }
    }

    const handleDeckClick = (deck: ReferenceDeck) => {
        if (deck.deck_code) {
            setViewerDeckCode(deck.deck_code)
            setViewerDeckName(deck.deck_name)
        } else if (deck.image_url) {
            // Fallback to image modal if no code
            setSelectedDeckImage(deck.image_url)
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

    filteredDecks.forEach(deck => {
        const archetype = getArchetypeForDeck(deck.archetype_id)
        const key = archetype ? archetype.id : 'others'
        if (!groupedDecks[key]) {
            groupedDecks[key] = []
        }
        groupedDecks[key].push(deck)
    })

    // Sort Archetype IDs for display
    const sortedArchetypeIds = Object.keys(groupedDecks).sort((aId, bId) => {
        if (aId === 'others') return 1
        if (bId === 'others') return -1

        const aArch = archetypes.find(a => a.id === aId)
        const bArch = archetypes.find(a => a.id === bId)

        const aOrder = aArch?.display_order ?? 9999
        const bOrder = bArch?.display_order ?? 9999

        if (aOrder !== bOrder) {
            return aOrder - bOrder
        }
        const aName = aArch?.name || ''
        const bName = bArch?.name || ''
        return aName.localeCompare(bName)
    })

    if (loading) return <div className="text-gray-500 text-center py-8">読み込み中...</div>

    // Render Legacy Image Modal
    const renderLegacyModal = () => {
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
                    <div className="relative max-w-full max-h-[85vh] w-[800px] aspect-[16/11]">
                        <Image
                            src={selectedDeckImage}
                            alt="Deck Preview"
                            fill
                            className="object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        )
    }

    // Render Edit Modal
    const renderEditModal = () => {
        if (!editingDeck) return null
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setEditingDeck(null)}>
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">デッキ情報を編集</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">デッキ名</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">イベントタイプ</label>
                            <select
                                value={editEventType}
                                onChange={(e) => setEditEventType(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                <option value="">選択してください</option>
                                {EVENT_TYPES.filter(t => t !== 'All').map(type => (
                                    <option key={type} value={type}>{EVENT_TYPE_LABELS[type]}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={() => setEditingDeck(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSaving ? '保存中...' : '保存する'}
                            </button>
                        </div>
                    </div>
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
                <DeckViewerModal
                    isOpen={!!viewerDeckCode}
                    onClose={() => setViewerDeckCode(null)}
                    deckCode={viewerDeckCode || ''}
                    deckName={viewerDeckName}
                />
                {renderLegacyModal()}
                {renderEditModal()}

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

                {/* New List View */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Header Row */}
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex text-xs font-bold text-gray-500">
                        <div className="flex-1">デッキ名</div>
                        <div className="w-24 hidden md:block text-center">CODE</div>
                        {isAdmin && <div className="w-20 text-right">管理</div>}
                    </div>

                    <div className="divide-y divide-gray-100">
                        {archetypeDecks.map((deck) => (
                            <div
                                key={deck.id}
                                onClick={() => handleDeckClick(deck)}
                                className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition flex items-center gap-3 group"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="font-bold text-gray-900 text-sm h-5 flex items-center">
                                            <AutoFitText text={deck.deck_name} />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        {/* Event Type Badge (Moved here) */}
                                        {deck.event_type && (
                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                                {EVENT_TYPE_LABELS[deck.event_type] || deck.event_type}
                                            </span>
                                        )}

                                        {deck.deck_code && (
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 flex items-center border border-gray-200">
                                                <span className="text-[10px] mr-1 opacity-50">CODE:</span>
                                                {deck.deck_code}
                                            </span>
                                        )}
                                        {/* Fallback indicator if image only */}
                                        {!deck.deck_code && deck.image_url && (
                                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                                                画像あり
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Removed standalone Event Type column */}

                                {/* Desktop Code Copy Button (Quick Action) - Keep alignment */}

                                {/* Desktop Code Copy Button (Quick Action) */}
                                <div className="w-24 hidden md:flex items-center justify-center">
                                    {deck.deck_code && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigator.clipboard.writeText(deck.deck_code || '')
                                                alert('コピーしました')
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition"
                                            title="コードをコピー"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        </button>
                                    )}
                                </div>

                                {isAdmin && (
                                    <div className="w-20 flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => handleEdit(deck, e)}
                                            className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(deck.id, e)}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                )}

                                <div className="md:hidden text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </div>
                            </div>
                        ))}
                    </div>

                    {archetypeDecks.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            登録されたデッキはありません
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // VIEW: Top Level (Folders) - Remains mostly Grid for Archetypes
    return (
        <div className="space-y-6">
            <DeckViewerModal
                isOpen={!!viewerDeckCode}
                onClose={() => setViewerDeckCode(null)}
                deckCode={viewerDeckCode || ''}
                deckName={viewerDeckName}
            />
            {renderLegacyModal()}
            {renderEditModal()}

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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {sortedArchetypeIds.map(archetypeId => {
                        const decks = groupedDecks[archetypeId]

                        let displayName = 'その他'
                        let coverImage = null

                        if (archetypeId !== 'others') {
                            const archetypeData = archetypes.find(a => a.id === archetypeId)
                            if (archetypeData) {
                                displayName = archetypeData.name
                                if (archetypeData.cover_image_url) {
                                    coverImage = archetypeData.cover_image_url
                                }
                            }
                        }

                        // Fallback cover image logic: if no archetype cover, use first deck's image if available (Legacy support)
                        if (!coverImage && decks.length > 0) {
                            // Try to find a deck with an image
                            const deckWithImage = decks.find(d => d.image_url)
                            if (deckWithImage) {
                                coverImage = deckWithImage.image_url
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
                                        <Image
                                            src={coverImage}
                                            alt={displayName}
                                            fill
                                            className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                                            unoptimized
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


