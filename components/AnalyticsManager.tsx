'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, TouchSensor } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import FeaturedCardsManager from './FeaturedCardsManager'

import { getDeckAnalyticsAction, deleteArchetypeAction } from '@/app/actions'

import Image from 'next/image'

// Sortable Item Component
function SortableArchetypeItem({ id, name, displayOrder, hasCoverImage, isStorageImage }: { id: string, name: string, displayOrder: number, hasCoverImage?: boolean, isStorageImage?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-sm mb-1 cursor-move hover:shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-gray-400">☰</span>
                <span className="font-medium text-gray-700">{name}</span>
            </div>
            <div className="flex items-center gap-2">
                {hasCoverImage === false && (
                    <span className="text-[10px] text-amber-500 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">画像なし</span>
                )}
                {hasCoverImage && !isStorageImage && (
                    <span className="text-[10px] text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">外部URL</span>
                )}
                {hasCoverImage && isStorageImage && (
                    <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">✓ Storage</span>
                )}
                <span className="text-xs text-gray-400">#{displayOrder}</span>
            </div>
        </div>
    )
}

type Archetype = {
    id: string
    name: string
    cover_image_url?: string | null
    display_order?: number | null
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
    const supabase = createClient()
    const [selectedArchetype, setSelectedArchetype] = useState<string>(archetypes.length > 0 ? archetypes[0].id : '')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<AnalyticsResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [isSaving, setIsSaving] = useState(false)

    // Archetype Management State
    const [localArchetypes, setLocalArchetypes] = useState<Archetype[]>([])
    const [isManageMode, setIsManageMode] = useState(false)
    const [rankFilter, setRankFilter] = useState<'優勝' | '準優勝' | 'TOP4' | 'TOP8' | undefined>(undefined)
    const [newArchetypeName, setNewArchetypeName] = useState('')
    const [manageArchetypeId, setManageArchetypeId] = useState('')
    const [archetypeImageFile, setArchetypeImageFile] = useState<File | null>(null)
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
        const currentIds = localArchetypes.map(a => a.id).sort().join(',')
        const newIds = archetypes.map(a => a.id).sort().join(',')

        if (archetypes.length > 0 && currentIds !== newIds) {
            setLocalArchetypes(archetypes)
        } else if (localArchetypes.length === 0 && archetypes.length === 0) {
            fetchArchetypes()
        }
    }, [archetypes])

    const fetchArchetypes = async () => {
        const { data } = await supabase.from('deck_archetypes').select('*').order('display_order', { ascending: true })
        if (data) {
            setLocalArchetypes(data)
            if (!selectedArchetype && data.length > 0) {
                setSelectedArchetype(data[0].id)
            }
        }
    }

    // Initial load
    useEffect(() => {
        if (selectedArchetype) {
            refreshAnalytics(selectedArchetype, rankFilter)
        }
    }, [selectedArchetype, rankFilter])

    const refreshAnalytics = async (id: string, rank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8') => {
        setLoading(true)
        setError(null)
        try {
            const res = await getDeckAnalyticsAction(id, rank)
            if (res.success && res.analytics) {
                setData({
                    decks: (res.decks || []).sort((a: any, b: any) => {
                        const extractDate = (name: string) => {
                            const match = name.match(/^(\d{1,2})\/(\d{1,2})/)
                            if (match) return parseInt(match[1]) * 100 + parseInt(match[2])
                            return null
                        }

                        const smartDateA = extractDate(a.deck_name || '')
                        const smartDateB = extractDate(b.deck_name || '')

                        if (smartDateA !== null && smartDateB !== null) {
                            if (smartDateB !== smartDateA) return smartDateB - smartDateA
                        } else if (smartDateA !== null) {
                            return -1
                        } else if (smartDateB !== null) {
                            return 1
                        }

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
            setError((e as Error).message)
        } finally {
            setLoading(false)
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

        if (!confirm(`「${arch.name}」を完全に削除してもよろしいですか？\n※紐づいている全てのデッキレコードも同時に削除されます。この操作は取り消せません。`)) return

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

            if (archetypeImageFile) {
                const fileExt = archetypeImageFile.name.split('.').pop()
                const fileName = `archetype-covers/${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage.from('archetype-images').upload(fileName, archetypeImageFile)
                if (uploadError) throw uploadError

                const { data } = supabase.storage.from('archetype-images').getPublicUrl(fileName)
                coverImageUrl = data.publicUrl
            }

            const updateData: any = {}
            if (coverImageUrl) updateData.cover_image_url = coverImageUrl

            const { error: updateError } = await supabase
                .from('deck_archetypes')
                .update(updateData)
                .eq('id', manageArchetypeId)

            if (updateError) throw updateError

            alert('設定を更新しました')
            setManageArchetypeId('')
            setArchetypeImageFile(null)
            fetchArchetypes()
        } catch (e: any) {
            alert('エラー: ' + e.message)
        } finally {
            setArchetypeLoading(false)
        }
    }

    // Categorize for display
    const categorizedCards = {
        pokemon: data?.analytics.filter(c => c.supertype === 'Pokémon') || [],
        goods: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Item')) || [],
        tool: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Pokémon Tool')) || [],
        supporter: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Supporter')) || [],
        stadium: data?.analytics.filter(c => c.supertype === 'Trainer' && c.subtypes?.includes('Stadium')) || [],
        energy: data?.analytics.filter(c => c.supertype === 'Energy') || [],
    }

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
                                    {/* Current Image Preview */}
                                    {manageArchetypeId && (() => {
                                        const arch = localArchetypes.find(a => a.id === manageArchetypeId)
                                        return arch?.cover_image_url ? (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">現在の表紙画像</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                                        <Image src={arch.cover_image_url} alt={arch.name} fill className="object-cover" unoptimized />
                                                    </div>
                                                    <p className="text-xs text-gray-400 break-all">{arch.cover_image_url.includes('supabase') ? '✅ Storage済み' : '⚠️ 外部URL（要更新）'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                                <span>⚠️</span>
                                                <span>表紙画像が未設定です</span>
                                            </div>
                                        )
                                    })()}
                                    <div className="pt-2">
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
                                                    hasCoverImage={!!archetype.cover_image_url}
                                                    isStorageImage={!!archetype.cover_image_url?.includes('supabase')}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>
                        </div>

                        {/* 3. Featured Cards Management */}
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
                                    ここで設定したカード（最大5枚推奨）がトップページの「注目カード採用率」に表示されます。
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        分析対象のデッキタイプ
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

                {/* Deck List (Read-Only) */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex justify-between items-center">
                        <span>登録済みデッキ一覧</span>
                        <span className="text-gray-500 font-normal text-xs">Total: {data?.totalDecks || 0}</span>
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">※ デッキの追加・削除はGASスクレイパーで自動管理されます</p>
                    <div className="max-h-60 overflow-y-auto space-y-2 bg-gray-50 p-2 rounded">
                        {data?.decks.map((deck) => (
                            <div key={deck.id} className="p-2 bg-white rounded shadow-sm border border-gray-100">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-bold text-gray-800 text-sm truncate">{deck.deck_name}</div>
                                            {deck.event_rank && (
                                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded flex-shrink-0 ml-1">
                                                    {deck.event_rank}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-400 font-medium ml-1">
                                                {deck.created_at && new Date(deck.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="bg-gray-100 px-1 rounded font-mono text-xs text-gray-600 truncate">{deck.deck_code}</div>
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

            {/* Results Area */}
            {
                loading && !data ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-medium">データを集計中...</p>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-black border-l-4 border-indigo-500 pl-3">集計結果</h2>
                                <div className="flex items-center gap-1.5 mt-3">
                                    {[
                                        { label: 'すべて', value: undefined },
                                        { label: '優勝', value: '優勝' },
                                        { label: '準優勝', value: '準優勝' },
                                        { label: 'TOP4', value: 'TOP4' },
                                        { label: 'TOP8', value: 'TOP8' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.label}
                                            onClick={() => setRankFilter(tab.value as any)}
                                            className={`
                                                px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border
                                                ${rankFilter === tab.value
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}
                                            `}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {data && (
                                <div className="flex flex-col items-end">
                                    <div className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
                                        <span className="text-xs text-indigo-400 font-bold uppercase block mb-0.5">集計母数</span>
                                        <span className="font-black text-xl text-indigo-900">{data.totalDecks}</span> <span className="text-xs font-bold text-indigo-500">デッキ</span>
                                    </div>
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
                )
            }
        </div>
    )
}
