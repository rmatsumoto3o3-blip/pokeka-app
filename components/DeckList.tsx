'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Deck, Match } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import AddMatchForm from './AddMatchForm'
import DeckDetailMock from './DeckDetailMock'

interface DeckListProps {
    userId: string
    matchCount?: number
    maxMatches?: number
    isMatchLimitReached?: boolean
    onMatchAdded?: () => void
}

interface DeckWithStats extends Deck {
    matches: Match[]
    total_matches: number
    wins: number
    losses: number
    draws: number
    win_rate: number
}

export default function DeckList({
    userId,
    matchCount = 0,
    maxMatches = 100,
    isMatchLimitReached = false,
    onMatchAdded
}: DeckListProps) {
    const [decks, setDecks] = useState<DeckWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [showMockDetail, setShowMockDetail] = useState(false)

    // Local Temp Deck State
    const [tempDeckCode, setTempDeckCode] = useState<string>('')
    const [isTempDeckSaved, setIsTempDeckSaved] = useState(false)

    useEffect(() => {
        // Load temp deck from localStorage on mount
        const saved = localStorage.getItem('pokeka_temp_deck')
        if (saved) {
            setTempDeckCode(saved)
            setIsTempDeckSaved(true)
        }
        fetchDecks()
    }, [userId])

    const saveTempDeck = () => {
        if (!tempDeckCode) return
        localStorage.setItem('pokeka_temp_deck', tempDeckCode)
        setIsTempDeckSaved(true)
    }

    const deleteTempDeck = () => {
        if (!confirm('作業机のデッキを削除しますか？')) return
        localStorage.removeItem('pokeka_temp_deck')
        setTempDeckCode('')
        setIsTempDeckSaved(false)
    }

    const fetchDecks = async () => {
        try {
            // Fetch decks
            const { data: decksData, error: decksError } = await supabase
                .from('decks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (decksError) throw decksError

            // Fetch matches for each deck
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .eq('user_id', userId)

            if (matchesError) throw matchesError

            // Calculate stats
            const decksWithStats: DeckWithStats[] = (decksData || []).map((deck) => {
                const deckMatches = (matchesData || []).filter((m) => m.deck_id === deck.id)
                const wins = deckMatches.filter((m) => m.result === 'win').length
                const losses = deckMatches.filter((m) => m.result === 'loss').length
                const draws = deckMatches.filter((m) => m.result === 'draw').length
                const total = deckMatches.length

                return {
                    ...deck,
                    matches: deckMatches,
                    total_matches: total,
                    wins,
                    losses,
                    draws,
                    win_rate: total > 0 ? (wins / total) * 100 : 0,
                }
            })

            setDecks(decksWithStats)
        } catch (err) {
            console.error('Error fetching decks:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (deckId: string) => {
        if (!confirm('このデッキを削除しますか?')) return

        try {
            const { error } = await supabase
                .from('decks')
                .delete()
                .eq('id', deckId)

            if (error) throw error
            fetchDecks()
        } catch (err) {
            console.error('Error deleting deck:', err)
        }
    }

    // Color Change: White base
    if (loading) {
        return <div className="text-gray-600 text-center">読み込み中...</div>
    }

    return (
        <>
            {/* Mock Detail Modal */}
            {showMockDetail && <DeckDetailMock onClose={() => setShowMockDetail(false)} />}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2.5"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                            onClick={() => setSelectedImage(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Deck Preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Work Table (Temp Slot) */}
                    <div className="bg-blue-50/50 rounded-xl overflow-hidden border-2 border-blue-200 border-dashed hover:border-blue-400 transition shadow-sm hover:shadow-md flex flex-col">
                        <div className="p-2.5 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <span>🛠️</span>
                                作業机 (一時保存)
                            </h3>
                            <p className="text-sm text-blue-600 mb-4 opacity-80">
                                DBに保存されない、あなただけの検証スロットです。<br />
                                ブラウザに保存されます。
                            </p>

                            <div className="flex-1 flex flex-col justify-center">
                                {!isTempDeckSaved ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="デッキコードを入力"
                                            value={tempDeckCode}
                                            onChange={(e) => setTempDeckCode(e.target.value)}
                                            className="w-full px-2.5 py-2 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                        <button
                                            onClick={saveTempDeck}
                                            disabled={!tempDeckCode}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            作業机に置く
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-white rounded p-2.5 border border-blue-100">
                                            <div className="text-xs text-gray-500 mb-1">登録中のデッキコード</div>
                                            <div className="text-lg font-mono font-bold text-gray-800 tracking-wider text-center">{tempDeckCode}</div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                href={`/practice?code1=${tempDeckCode}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-sm text-center text-sm font-bold flex items-center justify-center gap-2"
                                            >
                                                <Image
                                                    src="/Lucario.png"
                                                    alt="Practice"
                                                    width={24}
                                                    height={24}
                                                    className="w-5 h-5"
                                                />
                                                一人回し
                                            </Link>
                                            <button
                                                onClick={deleteTempDeck}
                                                className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition text-sm font-bold"
                                            >
                                                片付ける
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Regular Decks */}
                    {decks.map((deck) => (
                        <div
                            key={deck.id}
                            className="bg-white rounded-xl overflow-hidden border-2 border-pink-100 hover:border-pink-400 transition shadow-sm hover:shadow-md"
                        >
                            {/* ... image ... */}

                            <div className="p-2.5">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{deck.deck_name}</h3>
                                {/* ... code ... */}
                                {/* ... stats ... */}

                                {/* ... buttons ... */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedDeck(selectedDeck === deck.id ? null : deck.id)}
                                        className="flex-1 py-1.5 px-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition shadow-sm text-sm"
                                    >
                                        {selectedDeck === deck.id ? '閉じる' : '記録'}
                                    </button>
                                    <Link
                                        href={`/practice?code1=${deck.deck_code}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-1.5 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-sm text-center text-sm flex items-center justify-center"
                                    >
                                        一人回し
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(deck.id)}
                                        className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition text-sm"
                                    >
                                        削除
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowMockDetail(true)}
                                    className="w-full mt-2 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 border border-gray-200"
                                >
                                    ✨ 詳細・編集 (Mock)
                                </button>

                                {selectedDeck === deck.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <AddMatchForm
                                            deckId={deck.id}
                                            userId={userId}
                                            onSuccess={() => {
                                                setSelectedDeck(null)
                                                fetchDecks()
                                                if (onMatchAdded) onMatchAdded()
                                            }}
                                            isLimitReached={isMatchLimitReached}
                                            matchCount={matchCount}
                                            maxMatches={maxMatches}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
