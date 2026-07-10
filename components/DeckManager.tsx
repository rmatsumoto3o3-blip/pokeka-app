'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Deck, Match, DeckArchetype } from '@/lib/supabase'
import { createFolderAction, createDeckVariantAction } from '@/app/actions' // [NEW]

import Link from 'next/link'
import Image from 'next/image'
import DeckDetailManager from './DeckDetailManager'
import MatchRecordModal from './MatchRecordModal'
import { Ico } from './Icons'

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
    const supabase = createClient()
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>([])
    const [decks, setDecks] = useState<DeckWithStats[]>([])
    const [loading, setLoading] = useState(true)

    // UI State
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    // The detail modal will now potentially need the real deck ID later, but for now it's a mock
    const [showMockDetail, setShowMockDetail] = useState(false)
    const [mockDetailTargetDeck, setMockDetailTargetDeck] = useState<DeckWithStats | null>(null)

    // Folder Expansion State
    const [expandedArchetypeId, setExpandedArchetypeId] = useState<string | null>(null)

    // New Folder Creation State
    const [isCreatingFolder, setIsCreatingFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')

    // Inline "Add Variant" State
    const [addingVariationToArchId, setAddingVariationToArchId] = useState<string | null>(null)
    const [newDeckCode, setNewDeckCode] = useState('')
    const [newVersionLabel, setNewVersionLabel] = useState('')

    useEffect(() => {
        fetchData()
    }, [userId])

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

            {/* Match Record Modal */}
            <MatchRecordModal
                isOpen={!!selectedDeck}
                onClose={() => setSelectedDeck(null)}
                deckId={selectedDeck || ''}
                userId={userId}
                onUpdate={() => {
                    fetchData()
                    if (onMatchAdded) onMatchAdded()
                }}
            />

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

            <div className="space-y-8">

                {/* 1. Folder Controls */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-700">フォルダ管理</h3>
                        {!isCreatingFolder ? (
                            <button
                                onClick={() => setIsCreatingFolder(true)}
                                className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 font-bold flex items-center gap-1"
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
                                    className="text-sm px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 w-48 bg-white text-gray-900"
                                    autoFocus
                                />
                                <button onClick={handleCreateFolder} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">作成</button>
                                <button onClick={() => setIsCreatingFolder(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2">キャンセル</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Archetypes (Folders) */}
                {archetypes.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                            <Ico name="folder" className="w-4 h-4 text-gray-400" /> デッキフォルダ
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {archetypes.map(arch => {
                                const archDecks = getArchetypeDecks(arch.id)
                                const isExpanded = expandedArchetypeId === arch.id

                                // Calculate aggregate stats for folder
                                const totalMatches = archDecks.reduce((sum, d) => sum + d.total_matches, 0)
                                const totalWins = archDecks.reduce((sum, d) => sum + d.wins, 0)
                                const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0

                                return (
                                    <div key={arch.id} className={`bg-white rounded-xl border border-[#e2e8f0] overflow-hidden ${isExpanded ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
                                        {/* Folder Header */}
                                        <div
                                            className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                                            onClick={() => setExpandedArchetypeId(isExpanded ? null : arch.id)}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                                    <Ico name="folder" className="w-4.5 h-4.5 text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{arch.name}</h4>
                                                    <div className="text-[11px] text-gray-500 flex gap-1.5 mt-0.5 flex-wrap">
                                                        <span>{archDecks.length}デッキ</span>
                                                        <span className="text-gray-300">·</span>
                                                        <span>{totalMatches}試合</span>
                                                        <span className="text-gray-300">·</span>
                                                        <span className={`${winRate >= 50 ? 'text-emerald-600' : 'text-red-500'} font-bold`}>
                                                            {winRate.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Ico name="chevronDown" className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>

                                        {/* Folder Content (Expanded) */}
                                        {isExpanded && (
                                            <div className="p-3.5 bg-gray-50/60 border-t border-[#eef1f6]">
                                                <div className="flex justify-between mb-4 items-start">
                                                    {/* Add Variant Form or Button */}
                                                    {addingVariationToArchId === arch.id ? (
                                                        <div className="flex flex-col gap-2 bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="text-xs font-bold text-gray-500">新規バリエーション追加</div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="デッキコード"
                                                                    value={newDeckCode}
                                                                    onChange={(e) => setNewDeckCode(e.target.value)}
                                                                    className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white text-gray-900"
                                                                    autoFocus
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="ver"
                                                                    value={newVersionLabel}
                                                                    onChange={(e) => setNewVersionLabel(e.target.value)}
                                                                    className="w-16 text-xs px-2 py-1 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white text-gray-900"
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
                                                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
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
                                                            className="text-xs bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 font-bold flex items-center gap-1"
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
        <div className="bg-white rounded-xl overflow-hidden border border-[#e2e8f0] hover:border-blue-300 transition shadow-sm hover:shadow-md">
            {deck.image_url && (
                <div className="relative">
                    <img
                        src={deck.image_url}
                        alt={deck.deck_name}
                        className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={() => onImageClick(deck.image_url)}
                    />
                    {deck.custom_cards && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                            CUSTOM
                        </div>
                    )}
                </div>
            )}

            <div className="p-3.5">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900 truncate flex-1 min-w-0" title={deck.deck_name}>{deck.deck_name}</h3>
                    <div className="flex -space-x-1.5 shrink-0">
                        {deck.icon_1 && (
                            <div className="w-6 h-6 bg-white rounded-full border border-gray-100 flex items-center justify-center p-0.5 shadow-sm">
                                <Image src={`/pokemon-icons/${deck.icon_1}.png`} alt={deck.icon_1} width={18} height={18} className="object-contain" unoptimized />
                            </div>
                        )}
                        {deck.icon_2 && (
                            <div className="w-6 h-6 bg-white rounded-full border border-gray-100 flex items-center justify-center p-0.5 shadow-sm">
                                <Image src={`/pokemon-icons/${deck.icon_2}.png`} alt={deck.icon_2} width={18} height={18} className="object-contain" unoptimized />
                            </div>
                        )}
                    </div>
                </div>

                {/* Deck Code or Version/Memo */}
                {deck.custom_cards ? (
                    <div className="text-xs mb-3 font-mono flex items-center gap-1.5">
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold shrink-0">
                            {deck.version_label || '派生'}
                        </span>
                        <span className="text-gray-500 truncate" title={deck.memo || 'Custom Edit'}>
                            {deck.memo || '編集済みデッキ'}
                        </span>
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 mb-3 font-mono truncate">{deck.deck_code}</p>
                )}

                <div className="flex items-center justify-between mb-3.5 px-1">
                    <div className="text-xs text-gray-400">
                        <span className="text-emerald-600 font-bold">{deck.wins}勝</span>
                        <span className="mx-1">{deck.losses}敗</span>
                        <span>{deck.draws}分</span>
                        <span className="ml-1.5">（{deck.total_matches}試合）</span>
                    </div>
                    <div className={`text-lg font-bold ${deck.win_rate >= 50 ? 'text-emerald-600' : 'text-gray-700'}`}>
                        {deck.win_rate.toFixed(1)}%
                    </div>
                </div>

                <div className="flex gap-1.5">
                    <button
                        onClick={() => onSelectDeck(selectedDeck === deck.id ? null : deck.id)}
                        className="flex-1 py-1.5 px-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition text-xs font-bold"
                    >
                        {selectedDeck === deck.id ? '閉じる' : '記録'}
                    </button>
                    <Link
                        href={`/practice?code1=${deck.deck_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-center text-xs font-bold flex items-center justify-center whitespace-nowrap"
                    >
                        一人回し
                    </Link>
                    <button
                        onClick={() => onDelete(deck.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 transition"
                        aria-label="削除"
                    >
                        <Ico name="trash" className="w-3.5 h-3.5" />
                    </button>
                </div>
                <button
                    onClick={onOpenMock}
                    className="w-full mt-1.5 py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                    <Ico name="sparkle" className="w-3 h-3" /> 詳細・編集 (Mock)
                </button>
            </div>
        </div>
    )
}
