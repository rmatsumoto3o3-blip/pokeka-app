'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { ReferenceDeck, DeckArchetype } from '@/lib/supabase'
import Image from 'next/image'
import DeckViewerModal from './DeckViewerModal'
import DeckPreview from './DeckPreview'
import KeyCardAdoptionDrawer from './KeyCardAdoptionDrawer' // [NEW]
import { getArchetypeDistributionStatsAction, getDeckRecordsByArchetypeAction } from '@/app/actions'

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
    gridClassName = "grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3 md:gap-4"
}: ReferenceDeckListProps) {
    const supabase = createClient()
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>(initialArchetypes)
    const [selectedEvent, setSelectedEvent] = useState('All')
    const [selectedArchetypeId, setSelectedArchetypeId] = useState<string | null>(null) // Use ID for navigation
    const [selectedRank, setSelectedRank] = useState<string>('All')
    const [loading, setLoading] = useState(true)
    // GAS 集計データ（archetype_card_stats から取得）
    const [gasDeckCounts, setGasDeckCounts] = useState<Record<string, number>>({})
    const [gasRankCounts, setGasRankCounts] = useState<Record<string, Record<string, number>>>({})
    // deck_records（スプレッドシート由来の個別デッキ一覧）
    const [deckRecords, setDeckRecords] = useState<any[]>([])
    const [deckRecordsLoading, setDeckRecordsLoading] = useState(false)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 50

    // View State
    const [viewerDeckCode, setViewerDeckCode] = useState<string | null>(null)
    const [viewerDeckName, setViewerDeckName] = useState<string>('')
    const [selectedDeckImage, setSelectedDeckImage] = useState<string | null>(null) // Legacy Image Modal
    const [expandedDeckIds, setExpandedDeckIds] = useState<string[]>([])

    // Key Card Drawer State [NEW]
    const [adoptionDrawerData, setAdoptionDrawerData] = useState<{ id: string, name: string } | null>(null)

    // Admin Check (Safe for guest)
    const isAdmin = userEmail === 'player1@pokeka.local' ||
        userEmail === 'r.matsumoto.3o3@gmail.com' ||
        userEmail === 'nexpure.event@gmail.com' ||
        userEmail === 'admin@pokeka.local'

    useEffect(() => {
        // GAS 集計データは常に取得
        getArchetypeDistributionStatsAction().then(res => {
            if (res.success) {
                setGasDeckCounts(res.deckCounts)
                setGasRankCounts(res.rankCounts)
            }
        })

        const loadData = async () => {
            await fetchArchetypes()
            setLoading(false)
        }
        loadData()
    }, [])

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

    if (selectedArchetypeId) {
        const currentArchetype = selectedArchetypeId === 'others'
            ? { name: 'その他' }
            : archetypes.find(a => a.id === selectedArchetypeId)

        const displayName = currentArchetype?.name || 'その他'
        const totalDeckCount = gasDeckCounts[selectedArchetypeId] || deckRecords.length

        // ランクフィルタ
        const filteredByRank = selectedRank === 'All'
            ? deckRecords
            : deckRecords.filter(d => d.event_rank === selectedRank)

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const paginatedDecks = filteredByRank.slice(startIndex, startIndex + ITEMS_PER_PAGE)
        const totalPages = Math.ceil(filteredByRank.length / ITEMS_PER_PAGE)

        return (
            <div className="space-y-6">
                <DeckViewerModal
                    isOpen={!!viewerDeckCode}
                    onClose={() => setViewerDeckCode(null)}
                    deckCode={viewerDeckCode || ''}
                    deckName={viewerDeckName}
                />
                {renderLegacyModal()}

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
                            {totalDeckCount}
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

                {/* Rank Filter Tabs */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 mb-4 pb-1">
                    {['All', '優勝', '準優勝', 'TOP4', 'TOP8'].map((rank) => (
                        <button
                            key={rank}
                            onClick={() => {
                                setSelectedRank(rank)
                                setCurrentPage(1)
                            }}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                selectedRank === rank
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {rank === 'All' ? 'すべて' : rank}
                            {rank !== 'All' && (
                                <span className="ml-1.5 text-[10px] opacity-70">
                                    {gasRankCounts[selectedArchetypeId!]?.[rank] ?? 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* New List View */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Header Row */}
                    <div className="bg-gray-50 px-2.5 py-2 border-b border-gray-100 flex text-xs font-bold text-gray-500">
                        <div className="flex-1">デッキ</div>
                        <div className="w-24 hidden md:block text-center">日付</div>
                        <div className="w-24 hidden md:block text-center">CODE</div>
                    </div>

                    {deckRecordsLoading ? (
                        <div className="p-10 flex items-center justify-center gap-3 text-gray-400">
                            <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            <span className="text-sm font-medium">読み込み中...</span>
                        </div>
                    ) : (
                    <div className="divide-y divide-gray-100">
                        {paginatedDecks.map((deck) => {
                            const displayName = deck.event_date && deck.event_location
                                ? `${deck.event_date} ${deck.event_location}`
                                : deck.event_date || deck.event_location || deck.deck_code
                            const dateLabel = deck.event_date || (deck.created_at
                                ? new Date(deck.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
                                : '')
                            const isExpanded = expandedDeckIds.includes(deck.id)
                            return (
                            <div key={deck.id} className="group transition overflow-hidden">
                                <div
                                    onClick={() => {
                                        if (deck.deck_code) {
                                            setExpandedDeckIds(prev =>
                                                prev.includes(deck.id)
                                                    ? prev.filter(id => id !== deck.id)
                                                    : [...prev, deck.id]
                                            )
                                        }
                                    }}
                                    className={`px-2.5 py-2.5 cursor-pointer flex items-center gap-3 transition-colors ${isExpanded ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Expand Toggle Icon */}
                                    <div className="flex-shrink-0 text-gray-400">
                                        {deck.deck_code ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setExpandedDeckIds(prev =>
                                                        prev.includes(deck.id)
                                                            ? prev.filter(id => id !== deck.id)
                                                            : [...prev, deck.id]
                                                    )
                                                }}
                                                className={`p-1 rounded-full hover:bg-black/5 transition ${isExpanded ? 'text-purple-600 rotate-90 transform' : ''}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                            </button>
                                        ) : (
                                            <div className="w-6 h-6"></div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {deck.event_rank && (
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-tighter flex-shrink-0 ${
                                                    deck.event_rank === '優勝' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                    deck.event_rank === '準優勝' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                    {deck.event_rank === '優勝' ? '🥇' : deck.event_rank === '準優勝' ? '🥈' : '🎖️'}
                                                    {deck.event_rank}
                                                </span>
                                            )}
                                            <div className="font-bold text-gray-900 text-sm truncate">
                                                {displayName}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            {deck.deck_code && (
                                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 flex items-center border border-gray-200">
                                                    <span className="text-[10px] mr-1 opacity-50">CODE:</span>
                                                    {deck.deck_code}
                                                </span>
                                            )}
                                            {/* Mobile Date */}
                                            {dateLabel && (
                                                <span className="md:hidden text-[10px] opacity-70">{dateLabel}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Desktop Date */}
                                    <div className="w-24 hidden md:flex items-center justify-center text-[10px] text-gray-500 font-medium">
                                        {deck.created_at && new Date(deck.created_at).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })}
                                    </div>

                                    {/* Desktop Code Copy */}
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

                                    {/* Mobile Chevron */}
                                    <div className="md:hidden text-gray-300">
                                        {deck.deck_code && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-purple-500' : ''}`}
                                            >
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Deck Preview */}
                                {isExpanded && deck.deck_code && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-2 md:p-2.5">
                                        <DeckPreview deckCode={deck.deck_code} />
                                    </div>
                                )}
                            </div>
                            )
                        })}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="p-4 flex flex-col sm:flex-row justify-between items-center bg-gray-50 border-t border-gray-100 gap-4">
                                <div className="text-sm text-gray-500">
                                    {filteredByRank.length}件中 {startIndex + 1}〜{Math.min(startIndex + ITEMS_PER_PAGE, filteredByRank.length)}件を表示
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
                    </div>
                    )}
                    {!deckRecordsLoading && filteredByRank.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            該当するデッキはありません
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // gasDeckCounts のキーを deck_archetypes の display_order でソートして使う
    const gridArchetypeIds = Object.keys(gasDeckCounts).sort((aId, bId) => {
        const aArch = archetypes.find(a => a.id === aId)
        const bArch = archetypes.find(a => a.id === bId)
        const aOrder = aArch?.display_order ?? 9999
        const bOrder = bArch?.display_order ?? 9999
        if (aOrder !== bOrder) return aOrder - bOrder
        return (aArch?.name || '').localeCompare(bArch?.name || '')
    })

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

            {/* Archetype Grid */}
            {gridArchetypeIds.length === 0 ? (
                <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">該当する参考デッキはありません</p>
                </div>
            ) : (
                <div className={gridClassName}>
                    {gridArchetypeIds.map(archetypeId => {
                        const deckCount = gasDeckCounts[archetypeId] ?? 0

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

                        return (
                            <button
                                key={archetypeId}
                                onClick={() => {
                                    setSelectedArchetypeId(archetypeId)
                                    setCurrentPage(1)
                                    setSelectedRank('All')
                                    setDeckRecords([])
                                    setDeckRecordsLoading(true)
                                    getDeckRecordsByArchetypeAction(archetypeId).then(res => {
                                        if (res.success) setDeckRecords(res.data)
                                        setDeckRecordsLoading(false)
                                    })
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
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs mr-2">{deckCount} Decks</span>
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


