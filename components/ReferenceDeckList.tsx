'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { ReferenceDeck, DeckArchetype } from '@/lib/supabase'
import Image from 'next/image'
import DeckViewerModal from './DeckViewerModal'
import DeckPreview from './DeckPreview'
import KeyCardAdoptionDrawer from './KeyCardAdoptionDrawer' // [NEW]
import { getAllReferenceDecksAction } from '@/app/actions'

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
    gridClassName?: string
}


export default function ReferenceDeckList({
    // userId removed as unused per lint
    userEmail,
    initialDecks = [],
    initialArchetypes = [],
    gridClassName = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3 md:gap-4"
}: ReferenceDeckListProps) {
    const [decks, setDecks] = useState<ReferenceDeck[]>(initialDecks)
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>(initialArchetypes)
    const [selectedEvent, setSelectedEvent] = useState('All')
    const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(null) // Use ID for navigation
    const [loading, setLoading] = useState(initialDecks.length === 0)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 50

    // View State
    const [viewerDeckCode, setViewerDeckCode] = useState<string | null>(null)
    const [viewerDeckName, setViewerDeckName] = useState<string>('')
    const [selectedDeckImage, setSelectedDeckImage] = useState<string | null>(null) // Legacy Image Modal
    const [expandedDeckIds, setExpandedDeckIds] = useState<string[]>([])

    // Edit State
    const [editingDeck, setEditingDeck] = useState<ReferenceDeck | null>(null)
    const [editName, setEditName] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Key Card Drawer State [NEW]
    const [adoptionDrawerData, setAdoptionDrawerData] = useState<{ id: string, name: string } | null>(null)

    // Admin Check (Safe for guest)
    const isAdmin = userEmail === 'player1@pokeka.local' ||
        userEmail === 'r.matsumoto.3o3@gmail.com' ||
        userEmail === 'nexpure.event@gmail.com' ||
        userEmail === 'admin@pokeka.local'

    useEffect(() => {
        if (initialDecks.length > 0) return

        const loadData = async () => {
            await Promise.all([fetchDecks(), fetchArchetypes()])
            setLoading(false)
        }
        loadData()
    }, [initialDecks.length])

    const fetchDecks = async () => {
        const res = await getAllReferenceDecksAction()
        if (res.success && res.data) {
            setDecks(res.data)
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
    }

    const handleSaveEdit = async () => {
        if (!editingDeck) return
        setIsSaving(true)

        try {
            const { error } = await supabase
                .from('reference_decks')
                .update({
                    deck_name: editName
                })
                .eq('id', editingDeck.id)

            if (error) throw error

            // Update local state
            setDecks(decks.map(d =>
                d.id === editingDeck.id
                    ? { ...d, deck_name: editName }
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
            // Toggle expand if clicking the row
            setExpandedDeckIds(prev =>
                prev.includes(deck.id)
                    ? prev.filter(id => id !== deck.id)
                    : [...prev, deck.id]
            )
        } else if (deck.image_url) {
            // Fallback to image modal if no code
            setSelectedDeckImage(deck.image_url)
        }
    }

    const handleToggleExpand = (e: React.MouseEvent, deckId: string) => {
        e.stopPropagation()
        setExpandedDeckIds(prev =>
            prev.includes(deckId)
                ? prev.filter(id => id !== deckId)
                : [...prev, deckId]
        )
    }

    // Filter Logic
    const filteredDecks = decks

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

    // Sort decks within each archetype group by created_at (fallback for safety)
    Object.keys(groupedDecks).forEach(key => {
        groupedDecks[key].sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
            return dateB - dateA
        })
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2.5" onClick={() => setSelectedDeckImage(null)}>
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2.5" onClick={() => setEditingDeck(null)}>
                <div className="bg-white rounded-xl shadow-xl p-2.5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
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

                {/* Key Card Adoption Drawer [MOVED HERE] */}
                <KeyCardAdoptionDrawer
                    isOpen={!!adoptionDrawerData}
                    onClose={() => setAdoptionDrawerData(null)}
                    archetypeId={adoptionDrawerData?.id || ''}
                    archetypeName={adoptionDrawerData?.name || ''}
                />

                {/* Header / Back Button */}
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => {
                            setSelectedArchetypeId(null)
                            setCurrentPage(1)
                        }}
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
                        {/* Adoption Rate Button [MOVED] */}
                        {selectedArchetypeId !== 'others' && (
                            <button
                                onClick={() => setAdoptionDrawerData({ id: selectedArchetypeId!, name: displayName })}
                                className="ml-4 text-sm bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-100 transition flex items-center gap-1 shadow-sm"
                            >
                                採用率を見る
                            </button>
                        )}
                    </h3>
                </div>

                {/* New List View */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Header Row */}
                    <div className="bg-gray-50 px-2.5 py-2 border-b border-gray-100 flex text-xs font-bold text-gray-500">
                        <div className="flex-1">デッキ名</div>
                        <div className="w-24 hidden md:block text-center">日付</div>
                        <div className="w-24 hidden md:block text-center">CODE</div>
                        {isAdmin && <div className="w-20 text-right">管理</div>}
                    </div>

                    <div className="divide-y divide-gray-100">
                        {(() => {
                            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
                            const paginatedDecks = archetypeDecks.slice(startIndex, startIndex + ITEMS_PER_PAGE)
                            const totalPages = Math.ceil(archetypeDecks.length / ITEMS_PER_PAGE)

                            return (
                                <>
                                    {paginatedDecks.map((deck) => (
                                        <div key={deck.id} className="group transition overflow-hidden">
                                            <div
                                                onClick={() => handleDeckClick(deck)}
                                                className={`px-2.5 py-2.5 cursor-pointer flex items-center gap-3 transition-colors ${expandedDeckIds.includes(deck.id) ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                                            >
                                                {/* Expand Toggle Icon */}
                                                <div className="flex-shrink-0 text-gray-400">
                                                    {deck.deck_code ? (
                                                        <button
                                                            onClick={(e) => handleToggleExpand(e, deck.id)}
                                                            className={`p-1 rounded-full hover:bg-black/5 transition ${expandedDeckIds.includes(deck.id) ? 'text-purple-600 rotate-90 transform' : ''}`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                                        </button>
                                                    ) : (
                                                        <div className="w-6 h-6"></div> // Spacer
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="font-bold text-gray-900 text-sm h-5 flex items-center">
                                                            <AutoFitText text={deck.deck_name} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">

                                                        {deck.deck_code && (
                                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 flex items-center border border-gray-200">
                                                                <span className="text-[10px] mr-1 opacity-50">CODE:</span>
                                                                {deck.deck_code}
                                                            </span>
                                                        )}
                                                        {/* Mobile Date Badge */}
                                                        <span className="md:hidden text-[10px] opacity-70">
                                                            {deck.created_at && new Date(deck.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                                                        </span>
                                                        {/* Fallback indicator if image only */}
                                                        {!deck.deck_code && deck.image_url && (
                                                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                                                                画像あり
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Desktop Date Display */}
                                                <div className="w-24 hidden md:flex items-center justify-center text-[10px] text-gray-500 font-medium">
                                                    {deck.created_at && new Date(deck.created_at).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })}
                                                </div>

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

                                                {/* Mobile Chevron (Replaced with expansion indicator if code exists) */}
                                                <div className="md:hidden text-gray-300">
                                                    {deck.deck_code && (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                            className={`transition-transform duration-200 ${expandedDeckIds.includes(deck.id) ? 'rotate-90 text-purple-500' : ''}`}
                                                        >
                                                            <polyline points="9 18 15 12 9 6"></polyline>
                                                        </svg>
                                                    )}
                                                    {!deck.deck_code && deck.image_url && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expanded Content */}
                                            {expandedDeckIds.includes(deck.id) && deck.deck_code && (
                                                <div className="border-t border-gray-100 bg-gray-50/50 p-2 md:p-2.5">
                                                    <DeckPreview deckCode={deck.deck_code} />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="p-4 flex flex-col sm:flex-row justify-between items-center bg-gray-50 border-t border-gray-100 gap-4">
                                            <div className="text-sm text-gray-500">
                                                {archetypeDecks.length}件中 {startIndex + 1}〜{Math.min(startIndex + ITEMS_PER_PAGE, archetypeDecks.length)}件を表示
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    前へ
                                                </button>
                                                <span className="font-medium text-gray-700 px-2">
                                                    ページ {currentPage} / {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    次へ
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )
                        })()}
                    </div>
                    {
                        archetypeDecks.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                登録されたデッキはありません
                            </div>
                        )
                    }
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


            {/* Archetype Grid */}
            {(filteredDecks.length === 0) ? (
                <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">該当する参考デッキはありません</p>
                </div>
            ) : (
                <div className={gridClassName}>
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
                                onClick={() => {
                                    setSelectedArchetypeId(archetypeId)
                                    setCurrentPage(1)
                                }}
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
                                    <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-2.5 text-white">
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


