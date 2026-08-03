'use client'

import { useState, useEffect } from 'react'
import { type CardData } from '@/lib/deckParser'
import { getFeaturedDeckCardsByIdAction } from '@/app/actions'
import DeckPracticeLauncher from './DeckPracticeLauncher'
import Image from 'next/image'

interface DeckPreviewProps {
    // デッキコードではなく内部IDで受け取る。コード照会・公式取得はサーバー側で行い、
    // コードはクライアント（URL・DOM・Network）に一切出さない。
    deckId: string
}

export default function DeckPreview({ deckId }: DeckPreviewProps) {
    const [cards, setCards] = useState<CardData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true

        const loadDeck = async () => {
            try {
                setLoading(true)
                const res = await getFeaturedDeckCardsByIdAction(deckId)
                if (mounted) {
                    if (res.success && res.cards.length > 0) {
                        setCards(res.cards)
                    } else {
                        setError('デッキ情報の取得に失敗しました')
                    }
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

        if (deckId) {
            loadDeck()
        }

        return () => {
            mounted = false
        }
    }, [deckId])

    if (loading) {
        return (
            <div className="p-2.5 text-center bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-gray-500 text-sm">デッキ情報を読み込み中...</p>

            </div>
        )
    }

    if (error) {
        return (
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
                <p>⚠️ {error}</p>
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

            {/* このデッキで一人回し（コードは使わず、読み込み済みの60枚を直接渡す） */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-center">
                <DeckPracticeLauncher cards={cards} />
            </div>
        </div>
    )
}

function PreviewGrid({ cards }: { cards: CardData[] }) {
    return (
        <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-1 md:gap-1.5">
            {cards.map((card, i) => (
                <div key={i} className="flex flex-col">
                    <div className="relative aspect-[73/102] rounded bg-white overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition">
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
                    {/* Card name caption (下に常時表示・省略) */}
                    <p className="mt-0.5 px-0.5 text-[9px] leading-tight text-center text-gray-500 truncate" title={card.name}>
                        {card.name}
                    </p>
                </div>
            ))}
        </div>
    )
}

const countCards = (list: CardData[]) => list.reduce((acc, c) => acc + c.quantity, 0)
