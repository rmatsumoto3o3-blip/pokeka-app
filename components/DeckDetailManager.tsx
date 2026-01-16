'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Deck, DeckArchetype } from '@/lib/supabase'
import { getDeckDataAction } from '@/app/actions'
import type { CardData } from '@/lib/deckParser'
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragStartEvent,
    DragEndEvent,
    useDraggable,
    useDroppable,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// Extended Types for Component State
interface DeckVariant extends Deck {
    is_current: boolean
    version_label: string | null
    memo: string | null
    sideboard_cards: CardData[] // stored as JSONB but parsed to CardData[] in app
}

interface DeckDetailManagerProps {
    onClose: () => void
    archetypeId?: string | null     // If managing a folder
    initialDeckId?: string | null   // If managing a specific deck (start point)
    userId: string
    onUpdate?: () => void           // Callback to refresh parent list
}

// Draggable Wrapper for Sideboard Cards
function DraggableSideboardCard({ card, index, children }: { card: CardData, index: number, children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `sideboard-${index}-${card.name}`,
        data: {
            type: 'sideboard',
            card: card,
            index: index
        }
    })

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 1000,
    } : undefined

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`${isDragging ? 'opacity-50' : ''}`}>
            {children}
        </div>
    )
}

// Droppable Wrapper for Main Deck Cards
function DroppableMainCard({ card, index, children }: { card: CardData, index: number, children: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({
        id: `main-${index}-${card.name}`,
        data: {
            type: 'main',
            card: card,
            index: index
        }
    })

    return (
        <div ref={setNodeRef} className={`${isOver ? 'ring-2 ring-purple-500 scale-105 transition-transform' : ''}`}>
            {children}
        </div>
    )
}

export default function DeckDetailManager({
    onClose,
    archetypeId,
    initialDeckId,
    userId,
    onUpdate
}: DeckDetailManagerProps) {
    // Data State
    const [archetype, setArchetype] = useState<DeckArchetype | null>(null)
    const [allArchetypes, setAllArchetypes] = useState<DeckArchetype[]>([]) // For moving
    const [variants, setVariants] = useState<DeckVariant[]>([])
    const [currentVariantId, setCurrentVariantId] = useState<string | null>(null)

    // UI State
    const [loading, setLoading] = useState(true)
    const [importLoading, setImportLoading] = useState(false)
    const [deckCards, setDeckCards] = useState<CardData[]>([]) // Parsed cards for display
    const [cardsLoading, setCardsLoading] = useState(false)

    // Forms
    const [sideboardImportCode, setSideboardImportCode] = useState('')
    const [editTitle, setEditTitle] = useState('')

    // Drag State
    const [activeDragItem, setActiveDragItem] = useState<CardData | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    )

    // Initialize
    useEffect(() => {
        loadData()
    }, [archetypeId, initialDeckId])

    // Fetch Cards when variant changes
    useEffect(() => {
        const loadCards = async () => {
            const variant = variants.find(v => v.id === currentVariantId)
            if (!variant || !variant.deck_code) {
                setDeckCards([])
                return
            }

            setCardsLoading(true)
            try {
                const res = await getDeckDataAction(variant.deck_code)
                if (res.success && res.data) {
                    setDeckCards(res.data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setCardsLoading(false)
            }
        }

        if (currentVariantId) loadCards()
    }, [currentVariantId, variants])

    const loadData = async () => {
        setLoading(true)
        try {
            let archId = archetypeId
            let targetVariantId = initialDeckId

            // Case 1: Loose Deck passed -> Check if it has an archetype
            if (!archId && initialDeckId) {
                const { data: deck } = await supabase.from('decks').select('archetype_id').eq('id', initialDeckId).single()
                if (deck?.archetype_id) {
                    archId = deck.archetype_id
                }
            }

            // Load Archetype if exists
            if (archId) {
                const { data: arch } = await supabase.from('user_deck_archetypes').select('*').eq('id', archId).single()
                setArchetype(arch)
                setEditTitle(arch?.name || '')
            }

            // Fetch ALL Archetypes for the move dropdown
            const { data: allArch } = await supabase.from('user_deck_archetypes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
            setAllArchetypes(allArch || [])

            // Load Variants (If Archetype exists, load all. If not, load only the single deck)
            let query = supabase.from('decks').select('*').order('created_at', { ascending: false }) // Newest first

            if (archId) {
                query = query.eq('archetype_id', archId)
            } else if (initialDeckId) {
                query = query.eq('id', initialDeckId)
            }

            const { data: deckData } = await query

            if (deckData) {
                // Parse sideboard JSONB safely
                const parsedVariants = deckData.map(d => ({
                    ...d,
                    sideboard_cards: Array.isArray(d.sideboard_cards) ? d.sideboard_cards : []
                }))
                setVariants(parsedVariants)

                // Determine selection
                if (targetVariantId) {
                    setCurrentVariantId(targetVariantId)
                } else if (parsedVariants.length > 0) {
                    // Default to 'is_current' or newest
                    const current = parsedVariants.find(v => v.is_current) || parsedVariants[0]
                    setCurrentVariantId(current.id)
                }
            }

        } catch (e) {
            console.error('Error loading detail:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleMoveToArchetype = async (targetArchId: string) => {
        const destId = targetArchId === 'ROOT' ? null : targetArchId

        if (!variants.length) return
        const ids = variants.map(v => v.id)

        try {
            const { error } = await supabase.from('decks').update({ archetype_id: destId }).in('id', ids)
            if (error) throw error

            // Reload parent
            if (onUpdate) onUpdate()
            onClose() // Close modal because context changed significantly
        } catch (e) {
            console.error(e)
            alert('移動に失敗しました')
        }
    }

    const handleImportSideboard = async () => {
        if (!sideboardImportCode || !currentVariantId) return

        setImportLoading(true)
        try {
            const res = await getDeckDataAction(sideboardImportCode)
            if (!res.success || !res.data) throw new Error(res.error || 'Failed to parse')

            // Add to current sideboard (append)
            const variant = variants.find(v => v.id === currentVariantId)
            if (!variant) return

            const newSideboard = [...(variant.sideboard_cards || []), ...res.data]

            // Update DB
            const { error } = await supabase
                .from('decks')
                .update({ sideboard_cards: newSideboard })
                .eq('id', currentVariantId)

            if (error) throw error

            setSideboardImportCode('')
            loadData() // Reload
        } catch (e: any) {
            console.error(e)
            alert(`コードの読み込みに失敗しました: ${e.message || '不明なエラー'}`)
        } finally {
            setImportLoading(false)
        }
    }

    const handleDeleteSideboardCard = async (index: number) => {
        const variant = variants.find(v => v.id === currentVariantId)
        if (!variant) return

        const newSideboard = [...variant.sideboard_cards]
        newSideboard.splice(index, 1)

        const { error } = await supabase
            .from('decks')
            .update({ sideboard_cards: newSideboard })
            .eq('id', variant.id)

        if (error) {
            console.error(error)
            return
        }
        loadData()
    }

    // Create new variant (clone current)
    const handleCloneVariant = async () => {
        const variant = variants.find(v => v.id === currentVariantId)
        if (!variant) return

        const label = prompt('新しいバージョンの名前 (例: v1.1)', `v${variants.length + 1}.0`)
        if (!label) return

        try {
            // Clones DB entry
            const { data: newDeck, error } = await supabase.from('decks').insert([{
                user_id: userId,
                deck_code: variant.deck_code,
                deck_name: variant.deck_name, // Same name
                image_url: variant.image_url,
                archetype_id: archetype?.id || null, // Inherit parent
                version_label: label,
                sideboard_cards: variant.sideboard_cards, // Clone sideboard
                memo: 'Copied from ' + (variant.version_label || 'previous version')
            }]).select().single()

            if (error) throw error
            if (onUpdate) onUpdate()
            loadData() // Refresh
        } catch (e) {
            console.error(e)
            alert('エラーが発生しました')
        }
    }

    // Drag & Drop Handlers
    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.card) {
            setActiveDragItem(event.active.data.current.card)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveDragItem(null)

        if (!over) return

        const sourceData = active.data.current
        const targetData = over.data.current

        // Valid Swap: Sideboard -> Main
        if (sourceData?.type === 'sideboard' && targetData?.type === 'main') {
            const sourceCard: CardData = sourceData.card
            const targetIndex: number = targetData.index

            // 1-for-1 Swap Logic
            const newDeckCards = [...deckCards]

            // 1. Decrement Target (Main)
            if (newDeckCards[targetIndex].quantity > 1) {
                newDeckCards[targetIndex].quantity -= 1
            } else {
                newDeckCards.splice(targetIndex, 1)
            }

            // 2. Increment/Add Source (Sideboard Card)
            // Check if source card acts like an existing card in main deck (by name)
            const existingSourceIndex = newDeckCards.findIndex(c => c.name === sourceCard.name)

            if (existingSourceIndex !== -1) {
                newDeckCards[existingSourceIndex].quantity += 1
            } else {
                // Add as new entry
                newDeckCards.push({ ...sourceCard, quantity: 1 })
            }

            setDeckCards(newDeckCards)
        }
    }

    const currentVariant = variants.find(v => v.id === currentVariantId)

    if (loading) return null

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-start">
                        <div>
                            <div className="text-xs font-bold opacity-80 mb-1 flex items-center gap-2">
                                デッキアーキタイプ
                                <select
                                    className="bg-blue-700 text-white border border-blue-500 rounded text-xs px-1 py-0.5 cursor-pointer hover:bg-blue-800 transition"
                                    value={archetype?.id || 'ROOT'}
                                    onChange={(e) => handleMoveToArchetype(e.target.value)}
                                >
                                    <option value="ROOT">📂 未分類 (フォルダなし)</option>
                                    {allArchetypes.map(a => (
                                        <option key={a.id} value={a.id}>📁 {a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                🔥 {archetype ? archetype.name : (currentVariant?.deck_name || '未分類')}
                            </h2>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">×</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Main Deck Column */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Variant Selector */}
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <label className="block text-sm font-bold text-gray-500 mb-2">現在の構築パターン (バリエーション)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {variants.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => setCurrentVariantId(v.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition text-left flex items-center gap-2 ${currentVariantId === v.id
                                                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                                    }`}
                                            >
                                                {v.version_label || 'v1.0'}
                                                {currentVariantId === v.id && <span>✓</span>}
                                            </button>
                                        ))}
                                        <button
                                            onClick={handleCloneVariant}
                                            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 font-bold border-2 border-dashed border-gray-300"
                                        >
                                            + 複製
                                        </button>
                                    </div>
                                </div>

                                {/* Deck Content Parsed */}
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <span>メインデッキ</span>
                                            {currentVariant?.deck_code && <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded select-all">{currentVariant.deck_code}</span>}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {deckCards.reduce((acc, c) => acc + c.quantity, 0)}枚
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (deckCards.length === 0) return
                                                    localStorage.setItem('pokeka_practice_custom_deck', JSON.stringify(deckCards))
                                                    window.open('/practice?mode=custom', '_blank')
                                                }}
                                                disabled={loading || cardsLoading || deckCards.length === 0}
                                                className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1 shadow-sm"
                                            >
                                                <span>🎮</span> 現在の構成で一人回し
                                            </button>
                                        </div>
                                    </div>

                                    {cardsLoading ? (
                                        <div className="h-64 flex items-center justify-center text-gray-400">カード情報を読み込み中...</div>
                                    ) : (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                                            {deckCards.map((card, i) => (
                                                <DroppableMainCard key={`${i}-${card.name}`} card={card} index={i}>
                                                    <div className="aspect-[2/3] bg-gray-200 rounded flex items-center justify-center relative group cursor-pointer hover:ring-2 ring-blue-400 overflow-hidden">
                                                        {card.imageUrl ? (
                                                            <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-[10px] text-center p-1 leading-tight">{card.name}</div>
                                                        )}
                                                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1.5 rounded-tl font-bold">{card.quantity}</div>
                                                    </div>
                                                </DroppableMainCard>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sideboard & History Column */}
                            <div className="space-y-6">

                                {/* Sideboard */}
                                <div className="bg-orange-50 p-4 rounded-lg shadow-sm border-2 border-orange-100">
                                    <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                                        <span>🗂️</span> サイドボード (採用検討)
                                    </h3>

                                    <div className="mb-4">
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={sideboardImportCode}
                                                onChange={(e) => setSideboardImportCode(e.target.value)}
                                                placeholder="デッキコードから候補を追加"
                                                className="w-full text-xs px-2 py-1.5 rounded border border-orange-200 focus:outline-none focus:border-orange-400 text-gray-900 bg-white"
                                            />
                                            <button
                                                onClick={handleImportSideboard}
                                                disabled={importLoading || !sideboardImportCode}
                                                className="whitespace-nowrap px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded hover:bg-orange-600 disabled:opacity-50"
                                            >
                                                {importLoading ? '...' : '取込'}
                                            </button>
                                        </div>
                                        <div className="text-[10px] text-orange-400">
                                            ※公式プレイヤークラブで作った「候補カードリスト」のコードを入力
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {currentVariant?.sideboard_cards && currentVariant.sideboard_cards.length > 0 ? (
                                            currentVariant.sideboard_cards.map((card, i) => (
                                                <DraggableSideboardCard key={i} card={card} index={i}>
                                                    <div
                                                        className="aspect-[2/3] bg-white rounded flex items-center justify-center relative cursor-grab active:cursor-grabbing border border-orange-200 shadow-sm hover:scale-105 transition overflow-hidden group"
                                                    >
                                                        {card.imageUrl ? (
                                                            <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-[9px] text-center p-1 leading-tight">{card.name}</div>
                                                        )}
                                                        <div className="absolute bottom-0 right-0 bg-orange-500 text-white text-[10px] px-1 rounded-tl">{card.quantity}</div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDeleteSideboardCard(i)
                                                            }}
                                                            className="absolute inset-0 bg-red-500/50 hidden group-hover:flex items-center justify-center text-white font-bold text-xs"
                                                            style={{ zIndex: 100 }} // Ensure delete is clickable
                                                        >
                                                            削除
                                                        </button>
                                                    </div>
                                                </DraggableSideboardCard>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center text-xs text-orange-300 py-4">候補カードなし</div>
                                        )}
                                    </div>
                                    {/* Valid Drop Hint */}
                                    <div className="mt-2 text-[10px] text-orange-400 text-center bg-orange-100/50 p-1 rounded">
                                        👆 ドラッグしてメインデッキのカードと入れ替え
                                    </div>
                                </div>

                                {/* History (Simplified) */}
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <span>📜</span> バージョン一覧
                                    </h3>
                                    <div className="space-y-3 relative max-h-48 overflow-y-auto">
                                        {variants.map((v, i) => (
                                            <div key={v.id} className={`relative pl-3 text-sm border-l-2 ${currentVariantId === v.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'}`}>
                                                <div className="font-bold text-xs text-gray-900">{v.version_label || 'v1.0'}</div>
                                                <div className="text-[10px] text-gray-500">{new Date(v.created_at).toLocaleString()}</div>
                                                {v.memo && <div className="text-xs text-gray-600 mt-1">{v.memo}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drag Overlay for smooth visual */}
            <DragOverlay>
                {activeDragItem ? (
                    <div className="w-[80px] aspect-[2/3] bg-white rounded shadow-2xl overflow-hidden ring-2 ring-orange-500 opacity-90 rotate-3 cursor-grabbing">
                        {activeDragItem.imageUrl && <img src={activeDragItem.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                ) : null}
            </DragOverlay>

        </DndContext>
    )
}
