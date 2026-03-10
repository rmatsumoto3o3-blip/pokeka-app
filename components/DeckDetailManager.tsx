'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Deck, DeckArchetype } from '@/lib/supabase'
import { getDeckDataAction, saveDeckVersionAction } from '@/app/actions'
import Image from 'next/image'
import PokemonIconSelector from './PokemonIconSelector'
import type { CardData } from '@/lib/deckParser'

// Extended Types for Component State
interface DeckVariant extends Deck {
    is_current: boolean
    version_label: string | null
    memo: string | null
    custom_cards: CardData[] | null // JSONB
    icon_1: string | null
    icon_2: string | null
}

interface DeckDetailManagerProps {
    onClose: () => void
    archetypeId?: string | null     // If managing a folder
    initialDeckId?: string | null   // If managing a specific deck (start point)
    userId: string
    onUpdate?: () => void           // Callback to refresh parent list
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
    const [deckCards, setDeckCards] = useState<CardData[]>([]) // Parsed cards for display
    const [cardsLoading, setCardsLoading] = useState(false)

    // Forms
    const [editTitle, setEditTitle] = useState('')

    // Initialize
    useEffect(() => {
        loadData()
    }, [archetypeId, initialDeckId])

    // Fetch Cards when variant changes
    useEffect(() => {
        const loadCards = async () => {
            const variant = variants.find(v => v.id === currentVariantId)

            // PRIORITIZE CUSTOM CARDS
            if (variant?.custom_cards && Array.isArray(variant.custom_cards) && variant.custom_cards.length > 0) {
                setDeckCards(variant.custom_cards)
                return
            }

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
                const parsedVariants = deckData as DeckVariant[]
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

    const handleSaveVersion = async () => {
        const variant = variants.find(v => v.id === currentVariantId)

        // 1. Check if Loose Deck (No Folder)
        if (!archetype && (!variant?.archetype_id)) {
            alert('バージョン管理機能を使用するには、まずこのデッキを「フォルダ」に移動してください。\n(左上のプルダウンからフォルダを選択・移動できます)')
            return
        }

        // 2. Prompt for Name
        const defaultLabel = variant?.version_label ? `${variant.version_label}.1` : `v${variants.length + 1}.0`
        const label = prompt('新しいバージョンの名前 (例: v1.1)', defaultLabel)
        if (!label) return

        const memo = prompt('変更内容のメモ (任意)', '') || ''

        try {
            // 3. Call Server Action
            const parentId = archetype?.id || variant?.archetype_id || null
            if (!parentId) {
                alert('フォルダIDの取得に失敗しました')
                return
            }

            const res = await saveDeckVersionAction(
                userId,
                parentId,
                deckCards, // Current State (Custom)
                label,
                memo,
                variant?.id // Original Code/Image source
            )

            if (!res.success) {
                alert(res.error || '保存に失敗しました')
                return
            }

            // Success
            alert('新しいバージョンとして保存しました！')
            if (onUpdate) onUpdate()
            loadData() // Refresh list

        } catch (e) {
            console.error(e)
            alert('エラーが発生しました')
        }
    }

    const currentVariant = variants.find(v => v.id === currentVariantId)
    const totalDeckCards = deckCards.reduce((acc, c) => acc + c.quantity, 0)
    const isDeckValid = totalDeckCards === 60

    if (loading) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex justify-between items-start">
                    <div>
                        <div className="text-xs font-bold opacity-80 mb-1 flex items-center gap-2">
                            デッキタイプ
                            <select
                                className="bg-blue-700 text-white border border-blue-500 rounded text-xs px-1 py-0.5 cursor-pointer hover:bg-blue-800 transition focus:outline-none"
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
                    <div className="flex items-center gap-4">
                        {currentVariant && (
                            <PokemonIconSelector
                                selectedIcons={[currentVariant.icon_1, currentVariant.icon_2]}
                                onSelect={async (newIcons) => {
                                    const icon1 = newIcons[0]
                                    const icon2 = newIcons[1]
                                    setVariants(prev => prev.map(v => v.id === currentVariant.id ? { ...v, icon_1: icon1, icon_2: icon2 } : v))
                                    try {
                                        const { error } = await supabase
                                            .from('decks')
                                            .update({ icon_1: icon1, icon_2: icon2 })
                                            .eq('id', currentVariant.id)
                                        if (error) throw error
                                        if (onUpdate) onUpdate()
                                    } catch (e) {
                                        console.error('Failed to save icon:', e)
                                    }
                                }}
                                label=""
                            />
                        )}
                        <button onClick={onClose} className="text-white/80 hover:text-white text-3xl">×</button>
                    </div>
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
                                        onClick={handleSaveVersion}
                                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold flex items-center gap-2 shadow-sm transition"
                                        title={!archetype ? "フォルダ未所属のため保存できません" : "現在の構成を保存"}
                                    >
                                        <span>💾</span> 変更を保存
                                    </button>
                                </div>
                            </div>

                            {/* Deck Content */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <span>デッキ内容</span>
                                            {currentVariant?.custom_cards && (
                                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">構成変更済</span>
                                            )}
                                        </h3>
                                        {currentVariant?.memo && <div className="text-xs text-gray-500">{currentVariant.memo}</div>}
                                    </div>
                                    <div className={`text-sm font-bold px-3 py-1 rounded-full border ${isDeckValid ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-red-50 text-red-600 border-red-200 animate-pulse'}`}>
                                        {totalDeckCards} / 60 枚
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-6">
                                    <button
                                        onClick={() => {
                                            if (deckCards.length === 0) return
                                            localStorage.setItem('pokeka_practice_custom_deck', JSON.stringify(deckCards))
                                            window.open('/practice?mode=custom', '_blank')
                                        }}
                                        disabled={loading || cardsLoading || deckCards.length === 0}
                                        className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-md transition"
                                    >
                                        <Image
                                            src="/Lucario.png"
                                            alt="Practice"
                                            width={20}
                                            height={20}
                                            className="w-5 h-5 filter brightness-0 invert"
                                        />
                                        一人回し
                                    </button>
                                    <button
                                        onClick={() => {
                                            const text = deckCards.map(c => `${c.name} ${c.quantity}`).join('\n')
                                            navigator.clipboard.writeText(text)
                                            alert('コピーしました')
                                        }}
                                        className="text-sm bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 border border-gray-300 transition"
                                    >
                                        📋 テキストコピー
                                    </button>
                                </div>

                                {cardsLoading ? (
                                    <div className="h-64 flex items-center justify-center text-gray-400 font-medium">読み込み中...</div>
                                ) : (
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                        {deckCards.map((card, i) => (
                                            <div
                                                key={`${card.name}-${i}`}
                                                className="aspect-[2/3] bg-gray-100 rounded-lg flex items-center justify-center relative group overflow-hidden border border-gray-200"
                                            >
                                                {card.imageUrl ? (
                                                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-[10px] text-center p-2 text-gray-400">{card.name}</div>
                                                )}
                                                <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-0.5 rounded-tl-lg font-bold">
                                                    {card.quantity}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* History / Info Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>📜</span> 更新履歴
                                </h3>
                                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {variants.map((v) => (
                                        <div
                                            key={v.id}
                                            className={`relative pl-4 py-1 border-l-4 transition-colors ${currentVariantId === v.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                                            onClick={() => setCurrentVariantId(v.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-sm text-gray-900">{v.version_label || 'v1.0'}</div>
                                                <div className="text-[10px] text-gray-400">{new Date(v.created_at).toLocaleDateString()}</div>
                                            </div>
                                            {v.memo && <div className="text-xs text-gray-600 mt-1 line-clamp-2">{v.memo}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="text-xs font-bold text-blue-800 mb-2">💡 Tips</h4>
                                <ul className="text-[11px] text-blue-700 space-y-2 leading-relaxed">
                                    <li>• 一人回し後の「今の山札を登録」で調整内容を保存できます。</li>
                                    <li>• フォルダ（デッキタイプ）ごとにバージョンを管理できます。</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
