'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AddDeckFormProps {
    userId: string
    onSuccess?: () => void
    onClose?: () => void
    isLimitReached?: boolean
    deckCount?: number
    maxDecks?: number
}

export default function AddDeckForm({
    userId,
    onSuccess,
    onClose,
    isLimitReached = false,
    deckCount = 0,
    maxDecks = 5
}: AddDeckFormProps) {
    const [deckCode, setDeckCode] = useState('')
    const [deckName, setDeckName] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isLimitReached) return

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            let imageUrl: string | null = null

            // Upload image if provided
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${userId}/${Date.now()}.${fileExt}`

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

            // Insert deck into database
            const { error: insertError } = await supabase
                .from('decks')
                .insert({
                    user_id: userId,
                    deck_code: deckCode,
                    deck_name: deckName,
                    image_url: imageUrl,
                })

            if (insertError) throw insertError

            // Reset form
            setDeckCode('')
            setDeckName('')
            setImageFile(null)
            setSuccess(true)

            if (onSuccess) {
                setTimeout(() => {
                    onSuccess()
                    if (onClose) onClose()
                }, 1000)
            } else {
                // If no onSuccess provided, maybe just close
                setTimeout(() => {
                    if (onClose) onClose()
                    else window.location.reload()
                }, 1000)
            }
        } catch (err: any) {
            setError(err.message || 'デッキの登録に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">新しいデッキを登録</h2>
                <div className="flex items-center gap-3">
                    {isLimitReached && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-full text-sm">
                            上限到達 ({deckCount}/{maxDecks})
                        </span>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {isLimitReached ? (
                <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                    <p className="font-bold">⚠️ ベータ版の上限に達しました</p>
                    <p className="text-sm mt-1">
                        ベータ期間中は1ユーザーにつき{maxDecks}個までしかデッキを作成できません。
                        既存のデッキを削除するか、正式リリースをお待ちください。
                    </p>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="mt-4 w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-bold"
                        >
                            閉じる
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                            デッキを登録しました!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                デッキコード
                            </label>
                            <input
                                type="text"
                                value={deckCode}
                                onChange={(e) => setDeckCode(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                                placeholder="例: ggnnLg-abc123...（任意）"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                デッキ名 *
                            </label>
                            <input
                                type="text"
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                                placeholder="例: ピカチュウex"
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
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-500 file:text-white hover:file:bg-pink-600 file:cursor-pointer transition"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                公式サイトのデッキ画像をアップロードできます
                            </p>
                        </div>

                        <div className="pt-2 flex gap-3">
                            {onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                                >
                                    キャンセル
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`${onClose ? 'flex-[2]' : 'w-full'} py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                            >
                                {loading ? '登録中...' : 'デッキを登録'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    )
}
