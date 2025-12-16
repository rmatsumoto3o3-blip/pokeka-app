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
function KeyCardManager({ archetypes }: { archetypes: DeckArchetype[] }) {
    const [selectedArchetypeId, setSelectedArchetypeId] = useState('')
    const [cardName, setCardName] = useState('')
    const [adoptionRate, setAdoptionRate] = useState(100)
    const [category, setCategory] = useState('Pokemon')
    const [cardImage, setCardImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedArchetypeId) return
        setLoading(true)

        try {
            let imageUrl: string | null = null

            if (cardImage) {
                const fileExt = cardImage.name.split('.').pop()
                const fileName = `cards/${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage.from('deck-images').upload(fileName, cardImage)
                if (uploadError) throw uploadError
                const { data } = supabase.storage.from('deck-images').getPublicUrl(fileName)
                imageUrl = data.publicUrl
            }

            const { error: insertError } = await supabase
                .from('key_card_adoptions')
                .insert({
                    archetype_id: selectedArchetypeId,
                    card_name: cardName,
                    adoption_rate: adoptionRate,
                    category: category,
                    image_url: imageUrl
                })

            if (insertError) throw insertError

            alert('キーカードを登録しました')
            setCardName('')
            setCardImage(null)
            // Leave Archetype and Category selected for ease of use
        } catch (err: any) {
            alert('エラー: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl p-6 border-2 border-orange-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-orange-100 p-2 rounded-lg mr-2">🔑</span>
                キーカード採用率 管理
            </h2>

            <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">デッキタイプ</label>
                    <select
                        value={selectedArchetypeId}
                        onChange={(e) => setSelectedArchetypeId(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">選択してください</option>
                        {archetypes.map(arch => (
                            <option key={arch.id} value={arch.id}>{arch.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">カード名</label>
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
                            <option value="Supporter">Supporter</option>
                            <option value="Stadium">Stadium</option>
                            <option value="Energy">Energy</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">採用率 (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={adoptionRate}
                            onChange={(e) => setAdoptionRate(Number(e.target.value))}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">カード画像</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCardImage(e.target.files?.[0] || null)}
                            className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !selectedArchetypeId}
                    className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow disabled:opacity-50 transition"
                >
                    {loading ? '登録中...' : 'キーカードを追加'}
                </button>
            </form>
        </div>
    )
}
