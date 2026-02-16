'use client'

import { useState, useEffect } from 'react'
import { fetchDeckData, type CardData } from '@/lib/deckParser'
import Image from 'next/image'

interface DeckPreviewProps {
    deckCode: string
}

export default function DeckPreview({ deckCode }: DeckPreviewProps) {
    const [cards, setCards] = useState<CardData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        const loadDeck = async () => {
            try {
                setLoading(true)
                const data = await fetchDeckData(deckCode)
                if (mounted) {
                    setCards(data)
                }
            } catch (err) {
                console.error(err)
                if (mounted) {
                    setError('デッキ情報の取得に失敗しました')
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        if (deckCode) {
            loadDeck()
        }

        return () => {
            mounted = false
        }
    }, [deckCode])

    if (loading) {
        return (
            <div className="p-2.5 text-center bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
                <p className="text-gray-500 text-sm">デッキ情報を読み込み中...</p>

            </div>
        )
    }

    if (error) {
        return (
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
                <p>⚠️ {error}</p>
                <a
                    href={`https://www.pokemon-card.com/deck/confirm.html/deckID/${deckCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-blue-500 underline hover:text-blue-700"
                >
                    公式サイトで確認する
                </a>
            </div>
        )
    }

    // Categorize
    const pokemons = cards.filter(c => c.supertype === 'Pokémon')
    const trainers = cards.filter(c => c.supertype === 'Trainer')
    const energies = cards.filter(c => c.supertype === 'Energy')

    return (
        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4">
                {/* Pokemons */}
                {pokemons.length > 0 && (
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-500 px-1">ポケモン ({countCards(pokemons)})</h4>
                        <PreviewGrid cards={pokemons} />
                    </div>
                )}

                {/* Trainers */}
                {trainers.length > 0 && (
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-500 px-1">トレーナーズ ({countCards(trainers)})</h4>
                        <PreviewGrid cards={trainers} />
                    </div>
                )}

                {/* Energies */}
                {energies.length > 0 && (
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-500 px-1">エネルギー ({countCards(energies)})</h4>
                        <PreviewGrid cards={energies} />
                    </div>
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                <a
                    href={`https://www.pokemon-card.com/deck/confirm.html/deckID/${deckCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-600 hover:underline transition"
                >
                    公式サイトで詳細を見る
                </a>
            </div>
        </div>
    )
}

function PreviewGrid({ cards }: { cards: CardData[] }) {
    return (
        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-1.5 md:gap-2">
            {cards.map((card, i) => (
                <div key={i} className="group relative">
                    <div className="relative aspect-[73/102] rounded bg-white overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition cursor-help">
                        {/* Image */}
                        <Image
                            src={card.imageUrl}
                            alt={card.name}
                            fill
                            className="object-cover"
                            unoptimized
                            loading="lazy"
                        />
                        {/* Quantity */}
                        <div className="absolute bottom-0 right-0 bg-black/70 backdrop-blur-[1px] text-white font-bold px-1 text-[10px] rounded-tl shadow-sm">
                            {card.quantity}
                        </div>
                    </div>
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                        {card.name}
                    </div>
                </div>
            ))}
        </div>
    )
}

const countCards = (list: CardData[]) => list.reduce((acc, c) => acc + c.quantity, 0)
