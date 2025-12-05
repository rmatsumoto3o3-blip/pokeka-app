'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ReferenceDeckManagerProps {
    userEmail: string
}

export default function ReferenceDeckManager({ userEmail }: ReferenceDeckManagerProps) {
    const [deckName, setDeckName] = useState('')
    const [deckCode, setDeckCode] = useState('')
    const [deckUrl, setDeckUrl] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // 管理者チェック（3名対応）
    const isAdmin = userEmail === 'player1@pokeka.local' ||
        userEmail === 'player2@pokeka.local' ||
        userEmail === 'player3@pokeka.local'

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
                })

            if (insertError) throw insertError

            // Reset form
            setDeckName('')
            setDeckCode('')
            setDeckUrl('')
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

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">参考デッキを追加（管理者専用）</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg border border-red-500/30">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-500/20 text-green-200 rounded-lg border border-green-500/30">
                    参考デッキを登録しました!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        デッキ名 *
                    </label>
                    <input
                        type="text"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="例: ピカチュウex"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        デッキコード
                    </label>
                    <input
                        type="text"
                        value={deckCode}
                        onChange={(e) => setDeckCode(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="例: ggnnLg-abc123...（任意）"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        参考URL
                    </label>
                    <input
                        type="url"
                        value={deckUrl}
                        onChange={(e) => setDeckUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="例: https://example.com/deck（任意）"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        デッキ画像
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer transition"
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
    )
}
