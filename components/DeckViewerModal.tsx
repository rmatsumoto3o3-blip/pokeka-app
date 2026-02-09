'use client'

import { useState, useEffect } from 'react'
import { fetchDeckData, type CardData } from '@/lib/deckParser'
import Link from 'next/link'
import Image from 'next/image'
import { useCallback } from 'react'

interface DeckViewerModalProps {
    isOpen: boolean
    onClose: () => void
    deckCode: string
    deckName: string
}

export default function DeckViewerModal({ isOpen, onClose, deckCode, deckName }: DeckViewerModalProps) {
    const [cards, setCards] = useState<CardData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // activeTab removed as unused per lint

    const loadDeck = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchDeckData(deckCode)
            setCards(data)
        } catch (err) {
            console.error(err)
            setError('デッキデータの取得に失敗しました。公式デッキ作成ツールのサーバーが混雑している可能性があります。')
        } finally {
            setLoading(false)
        }
    }, [deckCode])

    useEffect(() => {
        if (isOpen && deckCode) {
            loadDeck()
        } else {
            // Reset state when closed
            setCards([])
            setError(null)
            setLoading(false)
        }
    }, [isOpen, deckCode, loadDeck])

    const copyDeckCode = () => {
        navigator.clipboard.writeText(deckCode)
        alert('デッキコードをコピーしました')
    }

    if (!isOpen) return null

    // Categorize
    const pokemons = cards.filter(c => c.supertype === 'Pokémon')
    const trainers = cards.filter(c => c.supertype === 'Trainer')
    const energies = cards.filter(c => c.supertype === 'Energy')

    const goods = trainers.filter(c => c.subtypes?.includes('Item') || c.subtypes?.includes('Technical Machine')) // Tech machine checks might vary but usually Item
    const tools = trainers.filter(c => c.subtypes?.includes('Pokémon Tool'))
    const supporters = trainers.filter(c => c.subtypes?.includes('Supporter'))
    const stadiums = trainers.filter(c => c.subtypes?.includes('Stadium'))

    const getContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
                    <p className="text-gray-500">デッキデータを読み込んでいます...</p>
                </div>
            )
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <div className="text-red-500 mb-2">⚠️ エラーが発生しました</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={loadDeck} className="text-blue-500 underline hover:text-blue-700">再読み込み</button>
                    <div className="mt-6">
                        <a
                            href={`https://www.pokemon-card.com/deck/confirm.html/deckID/${deckCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-400 underline"
                        >
                            公式サイトで直接見る
                        </a>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Pokemon Section */}
                {pokemons.length > 0 && (
                    <CategorySection title="ポケモン" count={countCards(pokemons)} color="bg-purple-100 text-purple-800">
                        <CardGrid cards={pokemons} />
                    </CategorySection>
                )}

                {/* Trainer Section (Grouped) */}
                {(goods.length > 0 || tools.length > 0 || supporters.length > 0 || stadiums.length > 0) && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-700 text-lg">トレーナーズ</h3>
                            <span className="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                {countCards(trainers)}枚
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-2">
                            {goods.length > 0 && (
                                <SubCategorySection title="グッズ" cards={goods} color="text-blue-600 bg-blue-50" />
                            )}
                            {tools.length > 0 && (
                                <SubCategorySection title="ポケモンのどうぐ" cards={tools} color="text-teal-600 bg-teal-50" />
                            )}
                            {supporters.length > 0 && (
                                <SubCategorySection title="サポート" cards={supporters} color="text-orange-600 bg-orange-50" />
                            )}
                            {stadiums.length > 0 && (
                                <SubCategorySection title="スタジアム" cards={stadiums} color="text-green-600 bg-green-50" />
                            )}
                        </div>
                    </div>
                )}

                {/* Energy Section */}
                {energies.length > 0 && (
                    <CategorySection title="エネルギー" count={countCards(energies)} color="bg-yellow-100 text-yellow-800">
                        <CardGrid cards={energies} />
                    </CategorySection>
                )}
            </div>
        )
    }

    const countCards = (list: CardData[]) => list.reduce((acc, c) => acc + c.quantity, 0)

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex-1 min-w-0 mr-4">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{deckName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200 select-all">
                                {deckCode}
                            </span>
                            <button onClick={copyDeckCode} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                コピー
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Link
                            href={`/practice?mode=custom&code1=${deckCode}`}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition text-sm"
                        >
                            <span>🎮 一人回し</span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 custom-scrollbar">
                    {getContent()}
                </div>

                {/* Mobile Footer Action */}
                <div className="md:hidden p-4 border-t bg-white flex justify-center pb-safe">
                    <Link
                        href={`/practice?mode=custom&code1=${deckCode}`}
                        className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition"
                    >
                        <span>🎮 このデッキで一人回し</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

function CategorySection({ title, count, color, children }: { title: string, count: number, color: string, children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className={`px-4 py-2 flex justify-between items-center ${color}`}>
                <h3 className="font-bold">{title}</h3>
                <span className="text-sm font-medium bg-white/50 px-2 py-0.5 rounded backdrop-blur-sm">{count}枚</span>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    )
}

function SubCategorySection({ title, cards, color }: { title: string, cards: CardData[], color: string }) {
    return (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className={`px-3 py-1.5 text-sm font-bold border-b border-gray-100 ${color}`}>
                {title} <span className="text-xs opacity-70 ml-1">({cards.reduce((acc, c) => acc + c.quantity, 0)}枚)</span>
            </div>
            <div className="p-3">
                <CardGrid cards={cards} small />
            </div>
        </div>
    )
}

function CardGrid({ cards, small = false }: { cards: CardData[], small?: boolean }) {
    return (
        <div className={`grid grid-cols-3 ${small ? 'md:grid-cols-4 lg:grid-cols-5' : 'md:grid-cols-6 lg:grid-cols-8'} gap-2 md:gap-4`}>
            {cards.map((card, i) => (
                <div key={i} className="group relative">
                    <div className="relative aspect-[73/102] rounded bg-gray-100 overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition">
                        {/* Image */}
                        <Image
                            src={card.imageUrl}
                            alt={card.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        {/* Quantity Badge */}
                        <div className="absolute bottom-0 right-0 bg-black/70 backdrop-blur-[2px] text-white font-bold px-1.5 py-0.5 text-xs md:text-sm rounded-tl-lg shadow-sm border-t border-l border-white/20">
                            x{card.quantity}
                        </div>
                    </div>
                    {/* Tooltip Name */}
                    <div className="mt-1 text-[10px] md:text-xs text-center text-gray-700 font-medium truncate px-1 opacity-80 group-hover:opacity-100 transition">
                        {card.name}
                    </div>
                </div>
            ))}
        </div>
    )
}
