'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ReferenceDeck } from '@/lib/supabase'

interface ReferenceDeckListProps {
    userId: string
    userEmail: string
}

export default function ReferenceDeckList({ userId, userEmail }: ReferenceDeckListProps) {
    const [decks, setDecks] = useState<ReferenceDeck[]>([])
    const [loading, setLoading] = useState(true)

    const isAdmin = userEmail === 'player1@pokeka.local' ||
        userEmail === 'player2@pokeka.local' ||
        userEmail === 'player3@pokeka.local'

    useEffect(() => {
        fetchDecks()
    }, [userId])

    const fetchDecks = async () => {
        try {
            // 参考デッキを取得
            const { data, error } = await supabase
                .from('reference_decks')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setDecks(data || [])
        } catch (err) {
            console.error('Error fetching reference decks:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (deckId: string, deckName: string) => {
        if (!confirm(`「${deckName}」を削除しますか？`)) return

        try {
            const { error } = await supabase
                .from('reference_decks')
                .delete()
                .eq('id', deckId)

            if (error) throw error

            // リストを再取得
            fetchDecks()
        } catch (err: any) {
            console.error('Error deleting deck:', err)
            alert('削除に失敗しました')
        }
    }

    if (loading) {
        return <div className="text-white text-center">読み込み中...</div>
    }

    if (decks.length === 0) {
        return (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
                <p className="text-gray-300 text-lg">まだ参考デッキがありません</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">参考デッキ一覧</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck) => (
                    <div
                        key={deck.id}
                        className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500/50 transition"
                    >
                        {deck.image_url && (
                            <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                                <img
                                    src={deck.image_url}
                                    alt={deck.deck_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-white mb-2">{deck.deck_name}</h3>

                        {deck.deck_code && (
                            <div className="mb-2">
                                <span className="text-xs text-gray-400">デッキコード:</span>
                                <p className="text-sm text-gray-200 font-mono break-all">{deck.deck_code}</p>
                            </div>
                        )}

                        <div className="flex gap-2 mt-3">
                            {deck.deck_url && (
                                <a
                                    href={deck.deck_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition text-center"
                                >
                                    詳細を見る →
                                </a>
                            )}

                            {/* 管理者のみ削除ボタン */}
                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(deck.id, deck.deck_name)}
                                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg border border-red-500/30 transition text-sm"
                                >
                                    削除
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
