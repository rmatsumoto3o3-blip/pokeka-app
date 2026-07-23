'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { OverseasDeckCard } from '@/lib/overseasData'

export default function OverseasDeckCardGrid({ cards }: { cards: OverseasDeckCard[] }) {
    const [selected, setSelected] = useState<OverseasDeckCard | null>(null)
    return (
        <>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {cards.map(card => <button key={card.cardKey} type="button" onClick={() => setSelected(card)} className="group text-left">
                    <div className="relative aspect-[63/88] overflow-hidden rounded bg-slate-100 shadow-sm transition group-hover:scale-[1.03] group-hover:shadow-md">
                        {card.imageUrl ? <Image src={card.imageUrl} alt={card.nameEn} fill sizes="(max-width: 640px) 33vw, 120px" className="object-cover" unoptimized /> : <div className="flex h-full items-center justify-center p-2 text-center text-[10px] text-slate-400">{card.nameEn}</div>}
                        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-xs font-bold text-white">×{card.quantity}</span>
                    </div>
                    <div className="mt-1 truncate text-[10px] font-medium text-gray-700">{card.nameEn}</div><div className="text-[9px] text-gray-400">{card.setCode} {card.collectorNumber}</div>
                </button>)}
            </div>
            {selected && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={() => setSelected(null)}><div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={event => event.stopPropagation()}>{selected.imageUrl ? <div className="relative aspect-[63/88] max-h-[78vh] w-full bg-slate-100"><Image src={selected.imageUrl} alt={selected.nameEn} fill sizes="448px" className="object-contain" unoptimized /></div> : <div className="flex aspect-[63/88] items-center justify-center bg-slate-100 p-8 text-center text-gray-500">{selected.nameEn}</div>}<div className="p-4"><div className="font-semibold text-gray-900">{selected.nameEn}</div><div className="text-xs text-gray-500">{selected.setCode} {selected.collectorNumber} · ×{selected.quantity}</div></div><button type="button" onClick={() => setSelected(null)} aria-label="閉じる" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">×</button></div></div>}
        </>
    )
}
