'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Deck, Match, DeckArchetype } from '@/lib/supabase'
import { createFolderAction, createDeckVariantAction } from '@/app/actions' // [NEW]

import Link from 'next/link'
import AddMatchForm from './AddMatchForm'
import DeckDetailManager from './DeckDetailManager'

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

export default function DeckManager({
    userId,
    matchCount = 0,
    maxMatches = 100,
    isMatchLimitReached = false,
    onMatchAdded
}: DeckListProps) {
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>([])
    const [decks, setDecks] = useState<DeckWithStats[]>([])
    const [loading, setLoading] = useState(true)

    // UI State
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    // The detail modal will now potentially need the real deck ID later, but for now it's a mock
    const [showMockDetail, setShowMockDetail] = useState(false)
    const [mockDetailTargetDeck, setMockDetailTargetDeck] = useState<DeckWithStats | null>(null)

    // Local Detail State (Work Table)
    const [showLocalDetail, setShowLocalDetail] = useState(false)

    // Folder Expansion State
    const [expandedArchetypeId, setExpandedArchetypeId] = useState<string | null>(null)

    // New Folder Creation State
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')

    // Inline "Add Variant" State
    const [addingVariationToArchId, setAddingVariationToArchId] = useState<string | null>(null)
    const [newDeckCode, setNewDeckCode] = useState('')
    const [newVersionLabel, setNewVersionLabel] = useState('')

    // Local Temp Deck State (Work Table)
    const [tempDeckCode, setTempDeckCode] = useState<string>('')
    const [isTempDeckSaved, setIsTempDeckSaved] = useState(false)

    useEffect(() => {
        // Load temp deck from localStorage on mount
        const saved = localStorage.getItem('pokeka_temp_deck')
        if (saved) {
            setTempDeckCode(saved)
            setIsTempDeckSaved(true)
        }
        fetchData()
    }, [userId])

    const saveTempDeck = () => {
        if (!tempDeckCode) return
        localStorage.setItem('pokeka_temp_deck', tempDeckCode)
        setIsTempDeckSaved(true)
    }

    const deleteTempDeck = () => {
        localStorage.removeItem('pokeka_temp_deck')
        setTempDeckCode('')
        setIsTempDeckSaved(false)
    }

    const fetchData = async () => {
        try {
            setLoading(true)

            // 1. Fetch Archetypes (Folders)
            const { data: archData, error: archError } = await supabase
                .from('user_deck_archetypes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (archError) throw archError
            setArchetypes(archData || [])

            // 2. Fetch Decks (Variants & Loose Decks)
            const { data: decksData, error: decksError } = await supabase
                .from('decks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (decksError) throw decksError

            // 3. Fetch Matches
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .eq('user_id', userId)

            if (matchesError) throw matchesError

            // 4. Calculate Stats
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
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return

        try {
            // [MODIFIED] Use Server Action
            const res = await createFolderAction(userId, newFolderName)

            if (!res.success) {
                alert(res.error || 'フォルダ作成に失敗しました')
                return
            }

            setNewFolderName('')
            setIsCreatingFolder(false)
            fetchData()
        } catch (err) {
            console.error('Error creating folder:', err)
            alert('エラーが発生しました')
        }
    }

    const handleAddVariant = async (archId: string) => {
        if (!newDeckCode.trim()) return

        try {
            // Find folder name to use as default deck name
            const arch = archetypes.find(a => a.id === archId)
            const defaultName = arch ? arch.name : '新規デッキ'

            // [MODIFIED] Use Server Action
            const res = await createDeckVariantAction(
                userId,
                archId,
                newDeckCode,
                newVersionLabel || 'v1.0',
                defaultName
            )

            if (!res.success) {
                alert(res.error || 'デッキ作成に失敗しました')
                return
            }

            setAddingVariationToArchId(null)
            setNewDeckCode('')
            setNewVersionLabel('')
            fetchData()
        } catch (err) {
            alert('エラーが発生しました')
            console.error(err)
        }
    }

    const handleDeleteDeck = async (deckId: string) => {
        if (!confirm('このデッキを削除しますか?')) return

        try {
            const { error } = await supabase
                .from('decks')
                .delete()
                .eq('id', deckId)

            if (error) throw error
            fetchData()
        } catch (err) {
            console.error('Error deleting deck:', err)
        }
    }

    const handleDeleteArchetype = async (archId: string) => {
        if (!confirm('このフォルダを削除しますか？\n(中のデッキは削除されず、未分類に戻ります)')) return
        // Note: constraint is ON DELETE SET NULL, so decks become loose.
        try {
            const { error } = await supabase
                .from('user_deck_archetypes')
                .delete()
                .eq('id', archId)

            if (error) throw error
            fetchData()
        } catch (err) {
            console.error('Error deleting folder:', err)
        }
    }

    // Helper to filter decks
    const looseDecks = decks.filter(d => !d.archetype_id)
    const getArchetypeDecks = (archId: string) => decks.filter(d => d.archetype_id === archId)

    if (loading) {
        return <div className="text-gray-600 text-center py-8">読み込み中...</div>
    }

    return (
        <>
            {/* Detail Manager Modal (Mock/DB) */}
            {showMockDetail && mockDetailTargetDeck && (
                <DeckDetailManager
                    onClose={() => setShowMockDetail(false)}
                    userId={userId}
                    initialDeckId={mockDetailTargetDeck.id}
                    archetypeId={mockDetailTargetDeck.archetype_id}
                    onUpdate={() => fetchData()}
                />
            )}

            {/* Detail Manager Modal (Local / Work Table) */}
            {showLocalDetail && tempDeckCode && (
                <DeckDetailManager
                    onClose={() => setShowLocalDetail(false)}
                    userId={userId}
                    initialDeckCode={tempDeckCode}
                    onUpdate={() => { }} // No parent update needed for local
                />
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
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

            <div className="space-y-8">

                {/* 1. Work Table & Folder Controls */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-700">ワークスペース</h3>
                        {!isCreatingFolder ? (
                            <button
                                onClick={() => setIsCreatingFolder(true)}
                                className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 font-bold flex items-center gap-1"
                            >
                                <span className="text-lg">+</span> フォルダ作成
                            </button>
                        ) : (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="フォルダ名 (例: リザードンex)"
                                    className="text-sm px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 w-48 bg-white text-gray-900"
                                    autoFocus
                                />
                                <button onClick={handleCreateFolder} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">作成</button>
                                <button onClick={() => setIsCreatingFolder(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2">キャンセル</button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Work Table */}
                        <div className="bg-blue-50/50 rounded-xl overflow-hidden border-2 border-blue-200 border-dashed hover:border-blue-400 transition shadow-sm hover:shadow-md flex flex-col">
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <span>🛠️</span>
                                    作業机 (一時保存)
                                </h3>
                                <p className="text-sm text-blue-600 mb-4 opacity-80">
                                    DBに保存されない、あなただけの検証スロットです。
                                </p>

                                <div className="flex-1 flex flex-col justify-center">
                                    {!isTempDeckSaved ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="デッキコードを入力"
                                                value={tempDeckCode}
                                                onChange={(e) => setTempDeckCode(e.target.value)}
                                                className="w-full px-4 py-2 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
                                            <div className="bg-white rounded p-3 border border-blue-100">
                                                <div className="text-xs text-gray-500 mb-1">登録中のデッキコード</div>
                                                <div className="text-lg font-mono font-bold text-gray-800 tracking-wider text-center">{tempDeckCode}</div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setShowLocalDetail(true)}
                                                    className="w-full py-2 px-3 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 rounded-lg transition shadow-sm text-sm font-bold flex items-center justify-center gap-2"
                                                >
                                                    <span>📝</span> 詳細・編集
                                                </button>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/practice?code1=${tempDeckCode}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-sm text-center text-sm font-bold flex items-center justify-center gap-2"
                                                >
                                                    <span>🎮</span>
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

                        {/* Simulator Portal Card */}
                        <div className="bg-orange-50/50 rounded-xl overflow-hidden border-2 border-orange-200 border-dashed hover:border-orange-400 transition shadow-sm hover:shadow-md flex flex-col">
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-orange-900 mb-2 flex items-center gap-2">
                                    <span>🧮</span>
                                    確率シミュレーター
                                </h3>
                                <p className="text-sm text-orange-800 mb-4 opacity-80">
                                    初手率・サイド落ち率などを計算して、デッキの安定性を分析します。
                                </p>

                                <div className="flex-1 flex flex-col justify-end">
                                    <Link
                                        href={tempDeckCode ? `/simulator?code=${tempDeckCode}` : '/simulator'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-[1.02] text-center font-bold flex items-center justify-center gap-2"
                                    >
                                        <span>🚀</span>
                                        {tempDeckCode ? '作業中のデッキを分析' : 'シミュレーターを開く'}
                                    </Link>
                                    {tempDeckCode && (
                                        <div className="mt-2 text-center text-xs text-orange-600 font-medium">
                                            ※ 作業机のコードを使用します
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Archetypes (Folders) */}
                {archetypes.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                            <span>📁</span> デッキフォルダ
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {archetypes.map(arch => {
                                const archDecks = getArchetypeDecks(arch.id)
                                const isExpanded = expandedArchetypeId === arch.id

                                // Calculate aggregate stats for folder
                                const totalMatches = archDecks.reduce((sum, d) => sum + d.total_matches, 0)
                                const totalWins = archDecks.reduce((sum, d) => sum + d.wins, 0)
                                const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0

                                return (
                                    <div key={arch.id} className="bg-white rounded-xl border-2 border-indigo-100 shadow-sm overflow-hidden">
                                        {/* Folder Header */}
                                        <div
                                            className="p-4 bg-indigo-50/50 flex justify-between items-center cursor-pointer hover:bg-indigo-50 transition"
                                            onClick={() => setExpandedArchetypeId(isExpanded ? null : arch.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-100 p-2.5 rounded-lg text-2xl">🔥</div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900">{arch.name}</h4>
                                                    <div className="text-xs text-gray-500 flex gap-3 mt-1">
                                                        <span>デッキ数: {archDecks.length}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span>総試合数: {totalMatches}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span className={`${winRate >= 50 ? 'text-green-600' : 'text-red-500'} font-bold`}>
                                                            勝率: {winRate.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={`transform transition duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </div>
                                            </div>
                                        </div>

                                        {/* Folder Content (Expanded) */}
                                        {isExpanded && (
                                            <div className="p-4 bg-indigo-50/20 border-t border-indigo-100">
                                                <div className="flex justify-between mb-4 items-start">
                                                    {/* Add Variant Form or Button */}
                                                    {addingVariationToArchId === arch.id ? (
                                                        <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-indigo-200 shadow-sm w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="text-xs font-bold text-gray-500">新規バリエーション追加</div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="デッキコード"
                                                                    value={newDeckCode}
                                                                    onChange={(e) => setNewDeckCode(e.target.value)}
                                                                    className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:border-indigo-500 outline-none bg-white text-gray-900"
                                                                    autoFocus
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="ver"
                                                                    value={newVersionLabel}
                                                                    onChange={(e) => setNewVersionLabel(e.target.value)}
                                                                    className="w-16 text-xs px-2 py-1 border border-gray-300 rounded focus:border-indigo-500 outline-none bg-white text-gray-900"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 justify-end">
                                                                <button
                                                                    onClick={() => setAddingVariationToArchId(null)}
                                                                    className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-1 rounded"
                                                                >
                                                                    キャンセル
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAddVariant(arch.id)}
                                                                    disabled={!newDeckCode}
                                                                    className="text-xs bg-indigo-600 text-white px-3 py-1 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
                                                                >
                                                                    追加
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setAddingVariationToArchId(arch.id)
                                                                setNewDeckCode('')
                                                                setNewVersionLabel(`v${archDecks.length + 1}.0`)
                                                            }}
                                                            className="text-xs bg-white text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-50 font-bold flex items-center gap-1"
                                                        >
                                                            <span>+</span> バリエーション追加
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteArchetype(arch.id);
                                                        }}
                                                        className="text-xs text-red-500 hover:text-red-700 underline ml-auto"
                                                    >
                                                        フォルダを削除
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {archDecks.map(deck => (
                                                        <DeckCard
                                                            key={deck.id}
                                                            deck={deck}
                                                            onSelectDeck={setSelectedDeck}
                                                            selectedDeck={selectedDeck}
                                                            onDelete={handleDeleteDeck}
                                                            onImageClick={setSelectedImage}
                                                            userId={userId}
                                                            onMatchAdded={() => {
                                                                fetchData()
                                                                if (onMatchAdded) onMatchAdded()
                                                            }}
                                                            matchCount={matchCount}
                                                            maxMatches={maxMatches}
                                                            isLimitReached={isMatchLimitReached}
                                                            onOpenMock={() => {
                                                                setMockDetailTargetDeck(deck)
                                                                setShowMockDetail(true)
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* 3. Loose Decks */}
                {looseDecks.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-700 border-t pt-8">未分類のデッキ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {looseDecks.map((deck) => (
                                <DeckCard
                                    key={deck.id}
                                    deck={deck}
                                    onSelectDeck={setSelectedDeck}
                                    selectedDeck={selectedDeck}
                                    onDelete={handleDeleteDeck}
                                    onImageClick={setSelectedImage}
                                    userId={userId}
                                    onMatchAdded={() => {
                                        fetchData()
                                        if (onMatchAdded) onMatchAdded()
                                    }}
                                    matchCount={matchCount}
                                    maxMatches={maxMatches}
                                    isLimitReached={isMatchLimitReached}
                                    onOpenMock={() => {
                                        setMockDetailTargetDeck(deck)
                                        setShowMockDetail(true)
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div >
        </>
    )
}

// Sub-component for individual deck card to reduce repetition
function DeckCard({
    deck,
    selectedDeck,
    onSelectDeck,
    onDelete,
    onImageClick,
    userId,
    onMatchAdded,
    matchCount,
    maxMatches,
    isLimitReached,
    onOpenMock
}: any) {
    return (
        <div
            className="bg-white rounded-xl overflow-hidden border-2 border-pink-100 hover:border-pink-400 transition shadow-sm hover:shadow-md"
        >
            {deck.image_url && (
                <div className="relative">
                    <img
                        src={deck.image_url}
                        alt={deck.deck_name}
                        className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={() => onImageClick(deck.image_url)}
                    />
                    {/* Custom Badge Overlay */}
                    {deck.custom_cards && (
                        <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border border-white/20">
                            CUSTOM
                        </div>
                    )}
                </div>
            )}

            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate" title={deck.deck_name}>{deck.deck_name}</h3>

                {/* Deck Code or Version/Memo */}
                {deck.custom_cards ? (
                    <div className="text-sm mb-4 font-mono flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-bold">
                            {deck.version_label || '派生'}
                        </span>
                        <span className="text-gray-600 truncate" title={deck.memo || 'Custom Edit'}>
                            {deck.memo || '編集済みデッキ'}
                        </span>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mb-4 font-mono">{deck.deck_code}</p>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 text-center text-gray-700">
                        <div className="text-2xl font-bold text-gray-900">{deck.total_matches}</div>
                        <div className="text-xs text-gray-500">試合数</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {deck.win_rate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">勝率</div>
                    </div>
                </div>

                <div className="flex gap-2 text-sm mb-4 font-medium">
                    <span className="text-green-600">{deck.wins}勝</span>
                    <span className="text-red-600">{deck.losses}敗</span>
                    <span className="text-gray-600">{deck.draws}分</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onSelectDeck(selectedDeck === deck.id ? null : deck.id)}
                        className="flex-1 py-1.5 px-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition shadow-sm text-sm"
                    >
                        {selectedDeck === deck.id ? '閉じる' : '記録'}
                    </button>
                    <Link
                        href={`/practice?code1=${deck.deck_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-sm text-center text-xs font-bold flex items-center justify-center whitespace-nowrap"
                    >
                        一人回し
                    </Link>
                    <button
                        onClick={() => onDelete(deck.id)}
                        className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition text-sm"
                    >
                        削除
                    </button>
                </div>
                {/* Mock Open Button */}
                <button
                    onClick={onOpenMock}
                    className="w-full mt-2 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 border border-gray-200 flex items-center justify-center gap-1"
                >
                    <span>✨</span> 詳細・編集 (Mock)
                </button>

                {selectedDeck === deck.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <AddMatchForm
                            deckId={deck.id}
                            userId={userId}
                            onSuccess={() => {
                                onSelectDeck(null)
                                onMatchAdded()
                            }}
                            isLimitReached={isLimitReached}
                            matchCount={matchCount}
                            maxMatches={maxMatches}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
