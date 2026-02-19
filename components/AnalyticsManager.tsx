'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, TouchSensor, closestCorners } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import FeaturedCardsManager from './FeaturedCardsManager'
import PokemonIconSelector from './PokemonIconSelector'

import { addDeckToAnalyticsAction, getDeckAnalyticsAction, removeDeckFromAnalyticsAction, updateAnalyzedDeckAction, scrapePokecabookAction, deleteArchetypeAction } from '@/app/actions'

import Image from 'next/image'

// Sortable Item Component
function SortableArchetypeItem({ id, name, displayOrder }: { id: string, name: string, displayOrder: number }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-sm mb-1 cursor-move hover:shadow-sm">
            <div className="flex items-center">
                <span className="text-gray-400 mr-2">☰</span>
                <span className="font-medium text-gray-700">{name}</span>
            </div>
            <span className="text-xs text-gray-400">#{displayOrder}</span>
        </div>
    )
}

type Archetype = {
    id: string
    name: string
}

type AnalyticsResult = {
    decks: any[]
    analytics: {
        name: string
        imageUrl: string
        supertype: string
        subtypes?: string[]
        adoptionRate: number
        avgQuantity: number
    }[]
    totalDecks: number
}

export default function AnalyticsManager({ archetypes = [], userId }: { archetypes?: Archetype[], userId: string }) {
    const [selectedArchetype, setSelectedArchetype] = useState<string>(archetypes.length > 0 ? archetypes[0].id : '')
    const [inputCode, setInputCode] = useState('')
    const [inputDeckName, setInputDeckName] = useState('')

    const [inputEventType, setInputEventType] = useState('Gym Battle')
    const [syncReference, setSyncReference] = useState(true) // Default to "Both"
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [data, setData] = useState<AnalyticsResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Edit State
    const [editingDeck, setEditingDeck] = useState<any | null>(null)
    const [editName, setEditName] = useState('')
    const [editEventType, setEditEventType] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Image Upload State (Deck) - DEPRECATED for individual deck, logic moved to archetype
    const [deckImageFile, setDeckImageFile] = useState<File | null>(null)

    // Phase 44: Scraper State
    const [importMode, setImportMode] = useState<'manual' | 'url'>('manual')
    const [importUrl, setImportUrl] = useState('')
    const [scrapedDecks, setScrapedDecks] = useState<{ name: string, code: string, selected: boolean }[]>([])
    const [isScraping, setIsScraping] = useState(false)

    // Phase 45: Bulk Delete State
    const [selectedDeleteDecks, setSelectedDeleteDecks] = useState<Set<string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)

    // Archetype Management State
    const [localArchetypes, setLocalArchetypes] = useState<Archetype[]>([])
    const [isManageMode, setIsManageMode] = useState(false) // Toggle for Archetype Manager
    const [newArchetypeName, setNewArchetypeName] = useState('')
    const [manageArchetypeId, setManageArchetypeId] = useState('')
    const [archetypeImageFile, setArchetypeImageFile] = useState<File | null>(null)
    const [archetypeIcons, setArchetypeIcons] = useState<(string | null)[]>([null, null])
    const [archetypeLoading, setArchetypeLoading] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    useEffect(() => {
        // ... existing implementation ...
        const currentIds = localArchetypes.map(a => a.id).sort().join(',')
        const newIds = archetypes.map(a => a.id).sort().join(',')

        if (archetypes.length > 0 && currentIds !== newIds) {
            setLocalArchetypes(archetypes)
        } else if (localArchetypes.length === 0 && archetypes.length === 0) {
            fetchArchetypes()
        }
    }, [archetypes])

    // Load initial icons when selecting archetype to manage
    useEffect(() => {
        if (manageArchetypeId) {
            const arch = localArchetypes.find(a => a.id === manageArchetypeId) as any
            if (arch) {
                setArchetypeIcons([arch.icon_1 || null, arch.icon_2 || null])
            }
        } else {
            setArchetypeIcons([null, null])
        }
    }, [manageArchetypeId, localArchetypes])

    const fetchArchetypes = async () => {
        const { data } = await supabase.from('deck_archetypes').select('*').order('display_order', { ascending: true })
        if (data) {
            setLocalArchetypes(data)
            // If no archetype selected, select first
            if (!selectedArchetype && data.length > 0) {
                setSelectedArchetype(data[0].id)
            }
        }
    }

    // Initial load
    useEffect(() => {
        if (selectedArchetype) {
            refreshAnalytics(selectedArchetype)
        }
    }, [selectedArchetype])

    const refreshAnalytics = async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await getDeckAnalyticsAction(id)
            if (res.success && res.analytics) {
                setData({
                    decks: (res.decks || []).sort((a: any, b: any) => {
                        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
                        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
                        return dateB - dateA
                    }),
                    analytics: res.analytics,
                    totalDecks: res.totalDecks || 0
                })
            } else {
                setError(res.error || 'データの取得に失敗しました')
            }
        } catch (e) {
            setError('エラーが発生しました')
        } finally {
            setIsLoading(false)
        }
    }



    const handleEdit = (deck: any) => {
        setEditingDeck(deck)
        setEditName(deck.deck_name || '')
        setEditEventType(deck.event_type || '')
    }

    const handleSaveEdit = async () => {
        if (!editingDeck) return
        setIsSaving(true)
        try {
            const res = await updateAnalyzedDeckAction(
                editingDeck.deck_code,
                editingDeck.archetype_id,
                userId,
                { name: editName, eventType: editEventType }
            )
            if (res.success) {
                await refreshAnalytics(selectedArchetype)
                setEditingDeck(null)
            } else {
                alert(res.error || '更新失敗')
            }
        } catch (e) {
            alert('エラーが発生しました')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            setLocalArchetypes((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const saveOrder = async () => {
        setIsSaving(true)
        const updates = localArchetypes.map((arch, index) => ({
            id: arch.id,
            new_order: index
        }))
        const { error } = await supabase.rpc('update_archetype_order', { orders: updates })
        setIsSaving(false)
        if (error) {
            alert('並び順の保存に失敗しました: ' + error.message)
        } else {
            alert('並び順を保存しました！')
        }
    }

    const handleDeleteArchetype = async () => {
        if (!manageArchetypeId) return
        const arch = localArchetypes.find(a => a.id === manageArchetypeId)
        if (!arch) return

        if (!confirm(`「${arch.name}」を完全に削除してもよろしいですか？\n※紐づいている全ての分析データと参考デッキも同時に削除されます。この操作は取り消せません。`)) return

        setArchetypeLoading(true)
        try {
            const res = await deleteArchetypeAction(manageArchetypeId, userId)
            if (res.success) {
                alert('削除が完了しました')
                setManageArchetypeId('')
                fetchArchetypes()
            } else {
                alert(res.error || '削除に失敗しました')
            }
        } catch (e) {
            console.error(e)
            alert('エラーが発生しました')
        } finally {
            setArchetypeLoading(false)
        }
    }

    const handleCreateArchetype = async () => {
        if (!newArchetypeName) return
        const { data, error } = await supabase
            .from('deck_archetypes')
            .insert({ name: newArchetypeName })
            .select().single()

        if (error) {
            alert('作成失敗: ' + error.message)
        } else if (data) {
            setLocalArchetypes([...localArchetypes, data])
            setSelectedArchetype(data.id)
            setNewArchetypeName('')
            alert('新しいデッキタイプを作成しました')
        }
    }

    const handleUpdateArchetypeSettings = async () => {
        if (!manageArchetypeId) return
        setArchetypeLoading(true)
        try {
            let coverImageUrl: string | undefined = undefined

            // Upload image if provided
            if (archetypeImageFile) {
                const fileExt = archetypeImageFile.name.split('.').pop()
                const fileName = `archetype-covers/${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage.from('deck-images').upload(fileName, archetypeImageFile)
                if (uploadError) throw uploadError

                const { data } = supabase.storage.from('deck-images').getPublicUrl(fileName)
                coverImageUrl = data.publicUrl
            }

            // Update Archetype data
            const updateData: any = {
                icon_1: archetypeIcons[0] || null,
                icon_2: archetypeIcons[1] || null
            }
            if (coverImageUrl) updateData.cover_image_url = coverImageUrl

            const { error: updateError } = await supabase
                .from('deck_archetypes')
                .update(updateData)
                .eq('id', manageArchetypeId)

            if (updateError) throw updateError

            alert('設定を更新しました')
            setManageArchetypeId('')
            setArchetypeIcons([null, null])
            setArchetypeImageFile(null)
            fetchArchetypes()
        } catch (e: any) {
            alert('エラー: ' + e.message)
        } finally {
            setArchetypeLoading(false)
        }
    }

    const handleAddDeck = async () => {
        if (!inputCode.trim() || !selectedArchetype) return

        // Extract code if URL is pasted
        let code = inputCode.trim()
        if (code.includes('pokemon-card.com')) {
            const match = code.match(/deckID\/([a-zA-Z0-9-]+)/)
            if (match && match[1]) {
                code = match[1]
            }
        }

        setIsAdding(true)
        setError(null)
        console.log('Adding deck:', code)

        try {
            // Updated: No Image Upload for individual decks anymore
            // Pass custom name/event if provided
            const res = await addDeckToAnalyticsAction(
                code,
                selectedArchetype,
                userId,
                inputDeckName.trim() || undefined,
                inputEventType || undefined,
                undefined, // imageUrl is now undefined
                syncReference
            )

            if (res.success) {
                console.log('Deck added successfully')
                setInputCode('')
                setInputDeckName('') // Reset
                // Keep event type logic? Maybe reset or keep. Let's keep for batch entry.
                await refreshAnalytics(selectedArchetype)
                alert('デッキを追加しました！')
            } else {
                console.error('Add failed:', res.error)
                const msg = res.error || '追加に失敗しました'
                setError(msg)
                alert(msg) // Ensure user sees it
            }
        } catch (e) {
            console.error('Submit error:', e)
            setError('送信エラー')
            alert('送信中にエラーが発生しました')
        } finally {
            setIsAdding(false)
        }
    }

    // --- Phase 44: Scraper Logic ---
    const handleScrape = async () => {
        if (!importUrl) return
        setIsScraping(true)
        setScrapedDecks([])
        try {
            const res = await scrapePokecabookAction(importUrl)
            if (res.success && res.decks) {
                setScrapedDecks(res.decks.map(d => ({ ...d, selected: true }))) // Default select all
                alert(`${res.decks.length}件のデッキが見つかりました`)
            } else {
                alert(res.error || 'デッキが見つかりませんでした')
            }
        } catch (e) {
            alert('スクレイピングエラー')
        } finally {
            setIsScraping(false)
        }
    }

    const handleBulkAdd = async () => {
        const selectedDecks = scrapedDecks.filter(d => d.selected)
        if (selectedDecks.length === 0) return

        if (!confirm(`${selectedDecks.length}件のデッキを一括登録しますか？\n（イベントタイプ: ${inputEventType}）`)) return

        setIsAdding(true)
        let successCount = 0

        // Loop sequentially to avoid DB overload and race conditions
        for (const deck of selectedDecks) {
            try {
                const res = await addDeckToAnalyticsAction(
                    deck.code,
                    selectedArchetype,
                    userId,
                    deck.name || undefined,
                    inputEventType || undefined,
                    undefined,
                    syncReference
                )
                if (res.success) successCount++
            } catch (e) {
                console.error(`Failed to add ${deck.code}`, e)
            }
        }

        setIsAdding(false)
        alert(`${selectedDecks.length}件中 ${successCount}件 を登録しました`)
        await refreshAnalytics(selectedArchetype)
        setImportUrl('')
        setScrapedDecks([])
        setImportMode('manual') // Back to manual or stay? Maybe stay to import more.
    }

    const toggleDeckSelection = (index: number) => {
        const newDecks = [...scrapedDecks]
        newDecks[index].selected = !newDecks[index].selected
        setScrapedDecks(newDecks)
    }

    const handleRemoveDeck = async (id: string) => {
        if (!confirm('このデッキデータを分析から除外しますか？')) return
        try {
            const res = await removeDeckFromAnalyticsAction(id, userId)
            if (res.success) {
                await refreshAnalytics(selectedArchetype)
            } else {
                alert(res.error || '削除失敗')
            }
        } catch (e) {
            alert('エラーが発生しました')
        }
    }

    // --- Phase 45: Bulk Delete Logic ---
    const toggleDeleteSelection = (id: string) => {
        const newSet = new Set(selectedDeleteDecks)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedDeleteDecks(newSet)
    }

    const handleBulkRemove = async () => {
        if (selectedDeleteDecks.size === 0) return
        if (!confirm(`${selectedDeleteDecks.size}件のデッキを削除しますか？\nこの操作は取り消せません。`)) return

        setIsDeleting(true)
        let successCount = 0

        const ids = Array.from(selectedDeleteDecks)
        for (const id of ids) {
            try {
                const res = await removeDeckFromAnalyticsAction(id, userId)
                if (res.success) successCount++
            } catch (e) {
                console.error(`Failed to delete ${id}`, e)
            }
        }

        setIsDeleting(false)
        setSelectedDeleteDecks(new Set()) // Clear selection
        alert(`${successCount}件削除しました`)
        await refreshAnalytics(selectedArchetype)
    }

    // Categorize for display
    const categorizedCards = {
        pokemon: data?.analytics.filter(c => c.supertype === 'Pokémon') || [],
        goods: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Item')) || [], // Goods = Item
        tool: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Pokémon Tool')) || [],
        supporter: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Supporter')) || [],
        stadium: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Stadium')) || [],
        energy: data?.analytics.filter(c => c.supertype === 'Energy') || [],
    }

    // Helper render
    const renderCardGrid = (cards: typeof categorizedCards.pokemon, categoryName: string) => {
        if (cards.length === 0) return null
        return (
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 border-b pb-2 text-black">{categoryName}</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {cards.map((card, i) => (
                        <div key={i} className="relative group">
                            <div className="aspect-[2/3] relative">
                                <Image
                                    src={card.imageUrl}
                                    alt={card.name}
                                    fill
                                    className="object-contain"
                                    loading="lazy"
                                    unoptimized
                                />
                            </div>
                            <div className="mt-2 text-center text-xs space-y-1">
                                <div className="font-bold text-black">{card.name}</div>
                                <div className="inline-block bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    採用率 {card.adoptionRate.toFixed(1)}%
                                </div>
                                <div className="text-gray-700 font-medium">
                                    平均 {card.avgQuantity.toFixed(2)}枚
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Edit Modal */}
            {editingDeck && (
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
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">イベントタイプ</label>
                                <select
                                    value={editEventType}
                                    onChange={(e) => setEditEventType(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    {['Gym Battle', 'City League', 'Championship', 'Worldwide'].map(t => (
                                        <option key={t} value={t}>{t}</option>
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
                                    {isSaving ? '保存中...' : '保存'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Archetype Management Section (Collapsible) */}
            <div className="bg-white rounded-lg shadow border-2 border-purple-100 overflow-hidden">
                <button
                    onClick={() => setIsManageMode(!isManageMode)}
                    className="w-full flex justify-between items-center p-2.5 bg-purple-50 hover:bg-purple-100 transition"
                >
                    <span className="font-bold text-gray-800 flex items-center">
                        <span className="bg-white p-1 rounded mr-2 text-sm shadow-sm">📁</span>
                        デッキタイプ設定（画像管理・並び替え）
                    </span>
                    <span className="text-purple-600">{isManageMode ? '▲ 閉じる' : '▼ 開く'}</span>
                </button>

                {isManageMode && (
                    <div className="p-2.5 space-y-8 animate-in slide-in-from-top-2">
                        {/* Tab Switcher inside Manage Mode */}
                        <div className="flex gap-4 border-b border-gray-200 pb-2 mb-4">
                            <button className="text-sm font-bold text-purple-600 border-b-2 border-purple-600 pb-2">デッキタイプ設定</button>
                            <button
                                className="text-sm font-bold text-gray-500 hover:text-purple-600 pb-2"
                                onClick={() => alert('実装中: 画面が長くなるのでタブ切り替えにした方がいいかも')}
                            >
                                注目カード設定
                            </button>
                        </div>

                        {/* 1. Deck Type Creation & Cover Image */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">新規作成 & 画像設定</h4>
                                {/* ... existing implementation ... */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        設定するデッキタイプ
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <select
                                            value={manageArchetypeId}
                                            onChange={(e) => setManageArchetypeId(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                                        >
                                            <option value="">選択してください</option>
                                            {localArchetypes.map(arch => (
                                                <option key={arch.id} value={arch.id}>{arch.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleDeleteArchetype}
                                            disabled={!manageArchetypeId || archetypeLoading}
                                            className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm hover:bg-red-100 disabled:opacity-50"
                                            title="このタイプを完全に削除"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newArchetypeName}
                                            onChange={(e) => setNewArchetypeName(e.target.value)}
                                            placeholder="新しいタイプ名..."
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                                        />
                                        <button
                                            onClick={handleCreateArchetype}
                                            disabled={!newArchetypeName}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            新規作成
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                                    <PokemonIconSelector
                                        selectedIcons={archetypeIcons}
                                        onSelect={setArchetypeIcons}
                                        label="アーキタイプアイコン"
                                    />
                                    <div className="border-t pt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            表紙画像を変更
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setArchetypeImageFile(e.target.files?.[0] || null)}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdateArchetypeSettings}
                                        disabled={!manageArchetypeId || archetypeLoading}
                                        className="w-full py-2 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 disabled:opacity-50 shadow-sm"
                                    >
                                        {archetypeLoading ? '保存中...' : '設定を保存'}
                                    </button>
                                </div>
                            </div>

                            {/* 2. Sorting */}
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h4 className="font-bold text-gray-900">並び替え</h4>
                                    <button
                                        onClick={saveOrder}
                                        disabled={isSaving}
                                        className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {isSaving ? '保存中...' : '順序を保存'}
                                    </button>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 max-h-[300px] overflow-y-auto">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={localArchetypes.map(a => a.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {localArchetypes.map((archetype, index) => (
                                                <SortableArchetypeItem
                                                    key={archetype.id}
                                                    id={archetype.id}
                                                    name={archetype.name}
                                                    displayOrder={index}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>
                        </div>

                        {/* 3. Featured Cards Management (Phase 47) */}
                        <div className="border-t pt-6 mt-6">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                    <Image
                                        src="/victory.png"
                                        alt="victory"
                                        width={24}
                                        height={24}
                                        className="w-6 h-6"
                                    />
                                    注目カード設定（採用率グラフ用）
                                </span>
                                <span className="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Topページ表示</span>
                            </h4>

                            <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm text-gray-700 mb-4">
                                    ここで設定したカード（最大5枚推奨）がトップページの「注目カード採用率」に表示されます。<br />
                                    <strong>※データの更新が必要な場合は、下の更新ボタンを押してください。</strong>
                                </p>

                                <div className="flex gap-4">
                                    <FeaturedCardsManager userId={userId} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-2.5 rounded-lg shadow space-y-6">
                <div className="space-y-6">
                    {/* Controls (Full Width) */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                分析対象のデッキタイプ (アーキタイプ)
                            </label>
                            <select
                                value={selectedArchetype}
                                onChange={(e) => setSelectedArchetype(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white text-gray-900"
                            >
                                {localArchetypes.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* New Fields for Sync */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    イベントタイプ (参考デッキ用)
                                </label>
                                <select
                                    value={inputEventType}
                                    onChange={(e) => setInputEventType(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white text-gray-900"
                                >
                                    {['Gym Battle', 'City League', 'Championship', 'Worldwide'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>

                                <div className="mt-4 p-2 bg-gray-50 rounded border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">追加オプション</label>
                                    <div className="flex flex-col gap-1">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="syncOption"
                                                checked={!syncReference}
                                                onChange={() => setSyncReference(false)}
                                                className="text-blue-600"
                                            />
                                            <span className="text-xs text-gray-700">分析のみに追加</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="syncOption"
                                                checked={syncReference}
                                                onChange={() => setSyncReference(true)}
                                                className="text-blue-600"
                                            />
                                            <span className="text-xs text-gray-700">分析一覧と参考デッキ(Top)両方に追加</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    デッキ名 <span className="text-pink-500 font-bold">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={inputDeckName}
                                    onChange={(e) => setInputDeckName(e.target.value)}
                                    placeholder="例: 優勝デッキ"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white text-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            {/* Import Mode Toggle */}
                            <div className="flex gap-4 border-b mb-4">
                                <button
                                    onClick={() => setImportMode('manual')}
                                    className={`pb-2 px-2 text-sm font-bold ${importMode === 'manual' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                                >
                                    個別入力
                                </button>
                                <button
                                    onClick={() => setImportMode('url')}
                                    className={`pb-2 px-2 text-sm font-bold ${importMode === 'url' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-gray-500'}`}
                                >
                                    URLから一括(Pokecabook)
                                </button>
                            </div>

                            {importMode === 'manual' ? (
                                <>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        デッキコードを追加
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inputCode}
                                            onChange={(e) => setInputCode(e.target.value)}
                                            placeholder="ここへ公式デッキコードを入力"
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white text-gray-900"
                                        />
                                        <button
                                            onClick={handleAddDeck}
                                            disabled={isAdding || !inputCode}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {isAdding ? '解析中...' : '追加'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">※1つずつ追加してください</p>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {/* URL Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            記事URL (pokecabook_archives用)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={importUrl}
                                                onChange={(e) => setImportUrl(e.target.value)}
                                                placeholder="https://pokecabook.com/archives/..."
                                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2 border bg-white text-gray-900"
                                            />
                                            <button
                                                onClick={handleScrape}
                                                disabled={isScraping || !importUrl}
                                                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50"
                                            >
                                                {isScraping ? '取得中...' : '取得'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scraped Results */}
                                    {scrapedDecks.length > 0 && (
                                        <div className="bg-white border rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                                <span className="font-bold text-sm">{scrapedDecks.length}件検出</span>
                                                <button
                                                    onClick={handleBulkAdd}
                                                    disabled={isAdding}
                                                    className="bg-indigo-600 text-white text-xs px-3 py-1 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
                                                >
                                                    {isAdding ? '登録中...' : 'まとめて登録'}
                                                </button>
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto space-y-1">
                                                {scrapedDecks.map((deck, idx) => (
                                                    <label key={idx} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer border-b border-gray-100 last:border-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={deck.selected}
                                                            onChange={() => toggleDeckSelection(idx)}
                                                            className="text-indigo-600 rounded"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-bold truncate text-gray-800">{deck.name}</div>
                                                            <div className="text-[10px] text-gray-500 font-mono">{deck.code}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex justify-between items-center">
                                <span>登録済みデッキ一覧</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 font-normal text-xs">Total: {data?.totalDecks || 0}</span>
                                    {selectedDeleteDecks.size > 0 && (
                                        <button
                                            onClick={handleBulkRemove}
                                            disabled={isDeleting}
                                            className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {isDeleting ? '削除中...' : `選択削除 (${selectedDeleteDecks.size})`}
                                        </button>
                                    )}
                                </div>
                            </h4>
                            <div className="max-h-60 overflow-y-auto space-y-2 bg-gray-50 p-2 rounded">
                                {data?.decks.map((deck) => (
                                    <div key={deck.id} className={`p-2 bg-white rounded shadow-sm border ${selectedDeleteDecks.has(deck.id) ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}>
                                        <div className="flex items-start gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedDeleteDecks.has(deck.id)}
                                                onChange={() => toggleDeleteSelection(deck.id)}
                                                className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="font-bold text-gray-800 text-sm truncate">{deck.deck_name}</div>
                                                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded flex-shrink-0 ml-1">
                                                        {deck.event_type}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium ml-1">
                                                        {deck.created_at && new Date(deck.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <div className="bg-gray-100 px-1 rounded font-mono text-gray-600 truncate mr-2">{deck.deck_code}</div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleEdit(deck)}
                                                            className="text-blue-500 hover:text-blue-700 p-1"
                                                        >
                                                            編集
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveDeck(deck.id)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            削除
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!data?.decks || data.decks.length === 0) && (
                                    <p className="text-gray-400 text-center text-sm">データがありません</p>
                                )}
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Results Area */}
            {isLoading && !data ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">データを集計中...</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-black border-l-4 border-indigo-500 pl-3">集計結果</h2>
                        {data && (
                            <div className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                                母数: <span className="font-bold text-black">{data.totalDecks}</span> デッキ
                            </div>
                        )}
                    </div>

                    {renderCardGrid(categorizedCards.pokemon, 'ポケモン')}
                    {renderCardGrid(categorizedCards.goods, 'グッズ')}
                    {renderCardGrid(categorizedCards.tool, 'ポケモンのどうぐ')}
                    {renderCardGrid(categorizedCards.supporter, 'サポート')}
                    {renderCardGrid(categorizedCards.stadium, 'スタジアム')}
                    {renderCardGrid(categorizedCards.energy, 'エネルギー')}
                </div>
            )}
        </div>
    )
}
