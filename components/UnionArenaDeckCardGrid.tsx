'use client'

import { useState } from 'react'
import type { UnionArenaCard } from '@/lib/unionArenaDeckParser'

interface UnionArenaDeckCardGridProps {
    cards: UnionArenaCard[]
}

export default function UnionArenaDeckCardGrid({ cards }: UnionArenaDeckCardGridProps) {
    const [selected, setSelected] = useState<UnionArenaCard | null>(null)

    return (
        <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {cards.map((card, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setSelected(card)}
                        className="relative aspect-[63/88] group text-left"
                    >
                        {card.imageUrl ? (
                            <img
                                src={card.imageUrl}
                                alt={card.name}
                                className="w-full h-full object-cover rounded shadow-sm group-hover:shadow-md group-hover:scale-[1.03] transition"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-xs text-center p-1 text-gray-400">
                                {card.name}
                            </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                            x{card.quantity}
                        </div>
                    </button>
                ))}
            </div>

            {selected && (
                <div
                    className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="relative max-w-md w-full max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative bg-gray-100 aspect-[63/88]">
                            {selected.imageUrl ? (
                                <img src={selected.imageUrl} alt={selected.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">{selected.name}</div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelected(null)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                            aria-label="閉じる"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
