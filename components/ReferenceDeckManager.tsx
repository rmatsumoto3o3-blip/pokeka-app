'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { DeckArchetype } from '@/lib/supabase'

interface ReferenceDeckManagerProps {
    userEmail: string
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

export default function ReferenceDeckManager({ userEmail }: ReferenceDeckManagerProps) {
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
            .order('name')
        if (!error && data) {
            setArchetypes(data)
        }
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

            <KeyCardManager archetypes={archetypes} />
        </div>
    )
}

// --- Sub Component: Key Card Manager ---
interface KeyCard {
    id: string
    card_name: string
    adoption_quantity: number
    image_url: string | null
    category: string
}

function KeyCardManager({ archetypes }: { archetypes: DeckArchetype[] }) {
    const [selectedArchetypeId, setSelectedArchetypeId] = useState('')
    const [cardName, setCardName] = useState('')
    const [adoptionQuantity, setAdoptionQuantity] = useState(0) // Default 0
    const [category, setCategory] = useState('Pokemon')
    const [cardImage, setCardImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    // Auto-fill State
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
    const [isAutoFilled, setIsAutoFilled] = useState(false)

    // Edit/Delete State
    const [registeredCards, setRegisteredCards] = useState<KeyCard[]>([])
    const [editingCardId, setEditingCardId] = useState<string | null>(null)

    useEffect(() => {
        if (selectedArchetypeId) {
            fetchRegisteredCards(selectedArchetypeId)
        } else {
            setRegisteredCards([])
        }
    }, [selectedArchetypeId])

    const fetchRegisteredCards = async (archetypeId: string) => {
        const { data, error } = await supabase
            .from('key_card_adoptions')
            .select('*')
            .eq('archetype_id', archetypeId)
            .order('adoption_quantity', { ascending: false })

        if (!error && data) {
            setRegisteredCards(data)
        }
    }

    // Debounce Logic for Auto-fill (Only when NOT editing)
    useEffect(() => {
        if (editingCardId) return // Skip auto-fill when editing

        const timer = setTimeout(async () => {
            if (!cardName || cardName.length < 2) {
                if (cardName === '') {
                    setExistingImageUrl(null)
                    setIsAutoFilled(false)
                }
                return
            }

            try {
                const { data } = await supabase
                    .from('key_card_adoptions')
                    .select('*')
                    .eq('card_name', cardName.trim())
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                if (data) {
                    setCategory(data.category)
                    if (data.image_url) {
                        setExistingImageUrl(data.image_url)
                        setIsAutoFilled(true)
                    }
                } else {
                    setExistingImageUrl(null)
                    setIsAutoFilled(false)
                }
            } catch (err) {
                console.error('Auto-fill error', err)
            }
        }, 800)

        return () => clearTimeout(timer)
    }, [cardName, editingCardId])

    const handleAddOrUpdateCard = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedArchetypeId) return
        setLoading(true)

        try {
            let imageUrl: string | null = existingImageUrl

            if (cardImage) {
                const fileExt = cardImage.name.split('.').pop()
                const fileName = `cards/${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage.from('deck-images').upload(fileName, cardImage)
                if (uploadError) throw uploadError
                const { data } = supabase.storage.from('deck-images').getPublicUrl(fileName)
                imageUrl = data.publicUrl
            }

            if (editingCardId) {
                // Update
                const { error } = await supabase
                    .from('key_card_adoptions')
                    .update({
                        card_name: cardName,
                        adoption_quantity: adoptionQuantity,
                        category: category,
                        image_url: imageUrl // Update image if new one provided or auto-filled logic used (though auto-fill mostly for new)
                    })
                    .eq('id', editingCardId)

                if (error) throw error
                alert('更新しました')
            } else {
                // Insert
                const { error } = await supabase
                    .from('key_card_adoptions')
                    .insert({
                        archetype_id: selectedArchetypeId,
                        card_name: cardName,
                        adoption_quantity: adoptionQuantity,
                        category: category,
                        image_url: imageUrl
                    })

                if (error) throw error
                alert('登録しました')
            }

            // Reset Form and Refresh List
            cancelEdit()
            fetchRegisteredCards(selectedArchetypeId)
        } catch (err: any) {
            alert('エラー: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const startEdit = (card: KeyCard) => {
        setEditingCardId(card.id)
        setCardName(card.card_name)
        setAdoptionQuantity(card.adoption_quantity)
        setCategory(card.category)
        setExistingImageUrl(card.image_url) // Show current image as "existing"
        setIsAutoFilled(false)
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setEditingCardId(null)
        setCardName('')
        setAdoptionQuantity(0)
        setCategory('Pokemon')
        setCardImage(null)
        setExistingImageUrl(null)
        setIsAutoFilled(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('本当に削除しますか？')) return

        try {
            const { error } = await supabase
                .from('key_card_adoptions')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchRegisteredCards(selectedArchetypeId)
        } catch (err: any) {
            alert('削除エラー: ' + err.message)
        }
    }

    return (
        <div className="bg-white rounded-2xl p-6 border-2 border-orange-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span className="flex items-center">
                    <span className="bg-orange-100 p-2 rounded-lg mr-2">🔑</span>
                    キーカード採用枚数 管理
                </span>
                {editingCardId && (
                    <button
                        onClick={cancelEdit}
                        className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded"
                    >
                        編集をキャンセル
                    </button>
                )}
            </h2>

            <form onSubmit={handleAddOrUpdateCard} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">デッキタイプ</label>
                    <select
                        value={selectedArchetypeId}
                        onChange={(e) => setSelectedArchetypeId(e.target.value)}
                        required
                        disabled={!!editingCardId} // Disable changing archetype while editing a card
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                    >
                        <option value="">選択してください</option>
                        {archetypes.map(arch => (
                            <option key={arch.id} value={arch.id}>{arch.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            カード名
                            {isAutoFilled && <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">✨ 履歴から自動入力</span>}
                        </label>
                        <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="例: ピジョットex"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="Pokemon">Pokemon</option>
                            <option value="Goods">Goods</option>
                            <option value="Tool">Tool</option>
                            <option value="Supporter">Supporter</option>
                            <option value="Stadium">Stadium</option>
                            <option value="Energy">Energy</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">採用枚数 (枚)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={adoptionQuantity}
                            onChange={(e) => setAdoptionQuantity(Number(e.target.value))}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="例: 2.5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            カード画像
                            {existingImageUrl && !cardImage && <span className="text-xs text-gray-500 ml-2">（{editingCardId ? '現在の画像' : '履歴画像で使用中'}）</span>}
                        </label>

                        <div className="flex gap-4 items-center">
                            {existingImageUrl && !cardImage && (
                                <div className="w-12 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                    <img src={existingImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCardImage(e.target.files?.[0] || null)}
                                className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !selectedArchetypeId}
                    className={`w-full py-3 px-4 text-white font-semibold rounded-lg shadow disabled:opacity-50 transition ${editingCardId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                    {loading ? '処理中...' : (editingCardId ? '変更を保存（更新）' : 'キーカードを追加')}
                </button>
            </form>

            {/* Registered Cards List */}
            {selectedArchetypeId && registeredCards.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <h3 className="font-bold text-gray-700 mb-4">登録済みカード一覧</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {registeredCards.map(card => (
                            <div key={card.id} className={`flex items-center gap-3 p-3 rounded-lg border ${editingCardId === card.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="w-10 h-14 bg-white rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                    {card.image_url ? (
                                        <img src={card.image_url} alt={card.card_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No img</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-gray-900 text-sm truncate">{card.card_name}</p>
                                        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{card.category}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">採用: <span className="font-bold text-orange-600">{card.adoption_quantity}枚</span></p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => startEdit(card)}
                                        disabled={!!editingCardId}
                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded font-medium disabled:opacity-50"
                                    >
                                        編集
                                    </button>
                                    <button
                                        onClick={() => handleDelete(card.id)}
                                        disabled={!!editingCardId}
                                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded font-medium disabled:opacity-50"
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
