'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { DeckArchetype } from '@/lib/supabase'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import AnalyticsManager from '@/components/AnalyticsManager'

interface ReferenceDeckManagerProps {
    userEmail: string
    userId: string
}

interface SortableItemProps {
    id: string
    name: string
    displayOrder: number
}

function SortableArchetypeItem({ id, name, displayOrder }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm mb-2 cursor-move hover:shadow-md">
            <div className="flex items-center">
                <span className="text-gray-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </span>
                <span className="font-medium text-gray-700">{name}</span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Order: {displayOrder}</span>
        </div>
    )
}

const EVENT_TYPES = [
    'Gym Battle',
    'City League',
    'Championship',
    'Worldwide'
] as const

const EVENT_TYPE_LABELS: Record<string, string> = {
    'Gym Battle': 'ジムバトル',
    'City League': 'シティリーグ',
    'Championship': 'チャンピオンシップ',
    'Worldwide': 'Worldwide'
}

export default function ReferenceDeckManager({ userEmail, userId }: ReferenceDeckManagerProps) {
    const [deckName, setDeckName] = useState('')
    const [deckCode, setDeckCode] = useState('')
    const [deckUrl, setDeckUrl] = useState('')
    // New Fields
    const [eventType, setEventType] = useState('')
    const [archetypeId, setArchetypeId] = useState('')
    const [newArchetypeName, setNewArchetypeName] = useState('')

    // Data
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>([])

    const [imageFile, setImageFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // 管理者チェック（3名対応）
    const isAdmin = userEmail === 'player1@pokeka.local' ||
        userEmail === 'player2@pokeka.local' ||
        userEmail === 'player3@pokeka.local'

    useEffect(() => {
        if (isAdmin) {
            fetchArchetypes()
        }
    }, [isAdmin])

    const fetchArchetypes = async () => {
        const { data, error } = await supabase
            .from('deck_archetypes')
            .select('*')
            .order('display_order', { ascending: true }) // Sort by display_order
        if (!error && data) {
            setArchetypes(data)
        }
    }

    // Sort Logic
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setArchetypes((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const saveOrder = async () => {
        setLoading(true)
        const updates = archetypes.map((arch, index) => ({
            id: arch.id,
            new_order: index
        }))

        const { error } = await supabase.rpc('update_archetype_order', { orders: updates })

        if (error) {
            alert('並び順の保存に失敗しました: ' + error.message)
        } else {
            alert('並び順を保存しました！')
            // Refresh to confirm
            fetchArchetypes()
        }
        setLoading(false)
    }

    const handleCreateArchetype = async () => {
        if (!newArchetypeName) return

        const { data, error } = await supabase
            .from('deck_archetypes')
            .insert({ name: newArchetypeName })
            .select() // return inserted row
            .single()

        if (error) {
            alert('アーキタイプの登録に失敗: ' + error.message)
        } else if (data) {
            setArchetypes([...archetypes, data])
            setArchetypeId(data.id) // auto-select
            setNewArchetypeName('')
        }
    }

    // 管理者でない場合は何も表示しない
    if (!isAdmin) {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            let imageUrl: string | null = null

            // Upload image if provided
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `reference/${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('deck-images')
                    .upload(fileName, imageFile)

                if (uploadError) throw uploadError

                // Get public URL
                const { data } = supabase.storage
                    .from('deck-images')
                    .getPublicUrl(fileName)

                imageUrl = data.publicUrl
            }

            // Insert reference deck
            const { error: insertError } = await supabase
                .from('reference_decks')
                .insert({
                    deck_name: deckName,
                    deck_code: deckCode || null,
                    deck_url: deckUrl || null,
                    image_url: imageUrl,
                    event_type: eventType || null,
                    archetype_id: archetypeId || null
                })

            if (insertError) throw insertError

            // Reset form
            setDeckName('')
            setDeckCode('')
            setDeckUrl('')
            setEventType('')
            setArchetypeId('')
            setImageFile(null)
            setSuccess(true)

            // Reload page to show new deck
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        } catch (err: any) {
            setError(err.message || '参考デッキの登録に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    // Archetype Management State
    const [manageArchetypeId, setManageArchetypeId] = useState('')
    const [archetypeImageFile, setArchetypeImageFile] = useState<File | null>(null)
    const [archetypeLoading, setArchetypeLoading] = useState(false)

    const handleUpdateArchetypeImage = async () => {
        if (!manageArchetypeId || !archetypeImageFile) return
        setArchetypeLoading(true)

        try {
            const fileExt = archetypeImageFile.name.split('.').pop()
            const fileName = `archetype-covers/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('deck-images')
                .upload(fileName, archetypeImageFile)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('deck-images')
                .getPublicUrl(fileName)

            const { error: updateError } = await supabase
                .from('deck_archetypes')
                .update({ cover_image_url: data.publicUrl })
                .eq('id', manageArchetypeId)

            if (updateError) throw updateError

            alert('アーキタイプ画像を更新しました！')
            setManageArchetypeId('')
            setArchetypeImageFile(null)
            fetchArchetypes() // Refresh list
        } catch (err: any) {
            alert('更新失敗: ' + err.message)
        } finally {
            setArchetypeLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Archetype Management Section */}
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-purple-100 p-2 rounded-lg mr-2">📁</span>
                    デッキタイプ設定（画像管理）
                </h2>
                <div className="flex flex-col md:flex-row gap-4 md:items-end">
                    <div className="w-full md:flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            デッキタイプを選択
                        </label>
                        <select
                            value={manageArchetypeId}
                            onChange={(e) => setManageArchetypeId(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">選択してください</option>
                            {archetypes.map(arch => (
                                <option key={arch.id} value={arch.id}>{arch.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            表紙画像
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setArchetypeImageFile(e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition"
                        />
                    </div>
                    <button
                        onClick={handleUpdateArchetypeImage}
                        disabled={!manageArchetypeId || !archetypeImageFile || archetypeLoading}
                        className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow disabled:opacity-50 transition"
                    >
                        {archetypeLoading ? '更新中...' : '画像を設定'}
                    </button>
                </div>
            </div>

            {/* Deck Registration Section */}
            <div className="bg-white rounded-2xl p-6 border-2 border-pink-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">参考デッキを追加（管理者専用）</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-700 rounded-lg border border-red-500/30">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-500/20 text-green-700 rounded-lg border border-green-500/30">
                        参考デッキを登録しました!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... (Existing form content unchanged) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Event Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                イベントタイプ
                            </label>
                            <select
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">選択してください</option>
                                {EVENT_TYPES.map(type => (
                                    <option key={type} value={type}>
                                        {EVENT_TYPE_LABELS[type]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Deck Archetype Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                デッキタイプ（アーキタイプ）
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={archetypeId}
                                    onChange={(e) => setArchetypeId(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">選択してください</option>
                                    {archetypes.map(arch => (
                                        <option key={arch.id} value={arch.id}>{arch.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Quick Add Archetype */}
                            <div className="mt-2 flex gap-2">
                                <input
                                    type="text"
                                    value={newArchetypeName}
                                    onChange={(e) => setNewArchetypeName(e.target.value)}
                                    placeholder="新しいタイプを追加..."
                                    className="flex-1 px-3 py-1 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateArchetype}
                                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded-md transition"
                                >
                                    追加
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            デッキ名 (詳細) *
                        </label>
                        <input
                            type="text"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="例: ピカチュウex (シティリーグ優勝)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            デッキコード
                        </label>
                        <input
                            type="text"
                            value={deckCode}
                            onChange={(e) => setDeckCode(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="例: ggnnLg-abc123...（任意）"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            参考URL
                        </label>
                        <input
                            type="url"
                            value={deckUrl}
                            onChange={(e) => setDeckUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="例: https://example.com/deck（任意）"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            デッキ画像
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? '登録中...' : '参考デッキを登録'}
                    </button>
                </form>
            </div>

            {/* --- Archetype Sorting Section --- */}
            <div className="bg-white p-6 rounded-xl border-2 border-purple-100 shadow-sm mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <span className="mr-2">⇅</span> デッキタイプの並び替え
                    </h3>
                    <button
                        onClick={saveOrder}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                        {loading ? '保存中...' : '順序を保存'}
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">ドラッグ＆ドロップで表示順を変更し、「順序を保存」を押してください。</p>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-[400px] overflow-y-auto">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={archetypes.map(a => a.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {archetypes.map((archetype, index) => (
                                <SortableArchetypeItem
                                    key={archetype.id}
                                    id={archetype.id}
                                    name={archetype.name}
                                    displayOrder={index} // Just for display, actual update happens on save
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* --- Deck Analytics / Key Card Manager (Automated) --- */}
            <div className="bg-white rounded-2xl p-6 border-2 border-orange-100 shadow-sm mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-orange-100 p-2 rounded-lg mr-2">📊</span>
                    デッキ分析・自動集計 (キーカード)
                </h2>
                <div className="text-sm text-gray-600 mb-4">
                    <p>公式デッキコードを登録すると、自動的に採用率と平均枚数が集計され、ユーザー画面に表示されます。</p>
                </div>
                <AnalyticsManager archetypes={archetypes} userId={userId} />
            </div>
        </div>
    )
}


