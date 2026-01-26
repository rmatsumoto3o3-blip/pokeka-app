'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { addDeckToAnalyticsAction, getDeckAnalyticsAction, removeDeckFromAnalyticsAction, updateAnalyzedDeckAction } from '@/app/actions'
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
    const [isLoading, setIsLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [data, setData] = useState<AnalyticsResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Edit State
    const [editingDeck, setEditingDeck] = useState<any | null>(null)
    const [editName, setEditName] = useState('')
    const [editEventType, setEditEventType] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Image Upload State (Deck)
    const [deckImageFile, setDeckImageFile] = useState<File | null>(null)

    // Archetype Management State
    const [localArchetypes, setLocalArchetypes] = useState<Archetype[]>([])
    const [isManageMode, setIsManageMode] = useState(false) // Toggle for Archetype Manager
    const [newArchetypeName, setNewArchetypeName] = useState('')
    const [manageArchetypeId, setManageArchetypeId] = useState('')
    const [archetypeImageFile, setArchetypeImageFile] = useState<File | null>(null)
    const [archetypeLoading, setArchetypeLoading] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    useEffect(() => {
        if (archetypes.length > 0) {
            setLocalArchetypes(archetypes)
        } else {
            fetchArchetypes()
        }
    }, [archetypes])

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
                    decks: res.decks || [],
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

    const handleUpdateArchetypeImage = async () => {
        if (!manageArchetypeId || !archetypeImageFile) return
        setArchetypeLoading(true)
        try {
            const fileExt = archetypeImageFile.name.split('.').pop()
            const fileName = `archetype-covers/${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage.from('deck-images').upload(fileName, archetypeImageFile)
            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('deck-images').getPublicUrl(fileName)
            const { error: updateError } = await supabase.from('deck_archetypes').update({ cover_image_url: data.publicUrl }).eq('id', manageArchetypeId)
            if (updateError) throw updateError

            alert('画像を更新しました')
            setManageArchetypeId('')
            setArchetypeImageFile(null)
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
                undefined // imageUrl is now undefined
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
                    className="w-full flex justify-between items-center p-4 bg-purple-50 hover:bg-purple-100 transition"
                >
                    <span className="font-bold text-gray-800 flex items-center">
                        <span className="bg-white p-1 rounded mr-2 text-sm shadow-sm">📁</span>
                        デッキタイプ設定（画像管理・並び替え）
                    </span>
                    <span className="text-purple-600">{isManageMode ? '▲ 閉じる' : '▼ 開く'}</span>
                </button>

                {isManageMode && (
                    <div className="p-6 space-y-8 animate-in slide-in-from-top-2">
                        {/* 1. Deck Type Creation & Cover Image */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">新規作成 & 画像設定</h4>
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
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        表紙画像を変更 (選択中のタイプ)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setArchetypeImageFile(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-2"
                                    />
                                    <button
                                        onClick={handleUpdateArchetypeImage}
                                        disabled={!manageArchetypeId || !archetypeImageFile || archetypeLoading}
                                        className="w-full py-2 bg-white border border-purple-300 text-purple-700 font-bold rounded-md hover:bg-purple-50 disabled:opacity-50"
                                    >
                                        {archetypeLoading ? '更新中...' : '画像を更新'}
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
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow space-y-6">
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
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex justify-between">
                                <span>登録済みデッキ一覧</span>
                                <span className="text-gray-500 font-normal">Total: {data?.totalDecks || 0}</span>
                            </h4>
                            <div className="max-h-60 overflow-y-auto space-y-2 bg-gray-50 p-2 rounded">
                                {data?.decks.map((deck) => (
                                    <div key={deck.id} className="p-2 bg-white rounded shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-bold text-gray-800 text-sm truncate">{deck.deck_name}</div>
                                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                                {deck.event_type}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="bg-gray-100 px-1 rounded font-mono text-gray-600">{deck.deck_code}</div>
                                            <div className="flex items-center gap-1">
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
