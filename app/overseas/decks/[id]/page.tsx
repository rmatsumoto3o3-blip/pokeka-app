import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import OverseasDeckCardGrid from '@/components/OverseasDeckCardGrid'
import { getOverseasDeck } from '@/lib/overseasData'

export const revalidate = 3600
export const dynamicParams = true

export function generateStaticParams() {
    return [] as { id: string }[]
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const data = await getOverseasDeck(id)
    if (!data) return { title: 'Deck Not Found | PokéLix' }
    return {
        title: `${data.archetype?.nameEn || 'Overseas Deck'} · ${data.result.rankLabel} | PokéLix`,
        robots: { index: false, follow: false },
    }
}

export default async function OverseasDeckPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const data = await getOverseasDeck(id)
    if (!data?.tournament || !data.archetype) notFound()
    const { result, tournament, archetype } = data
    const totalCards = result.cards.reduce((total, card) => total + card.quantity, 0)
    const groups = ['Pokemon', 'Trainer', 'Energy'] as const

    return <div className="min-h-screen bg-slate-50"><PublicHeader game="overseas" /><main className="mx-auto max-w-5xl px-4 py-8"><div className="mb-4 text-xs text-gray-400"><Link href="/overseas" className="text-sky-600">海外TOP</Link> › <Link href="/overseas/decks" className="text-sky-600">デッキ一覧</Link> › {archetype.nameEn}</div><section className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center"><div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">{archetype.coverImageUrl ? <Image src={archetype.coverImageUrl} alt="" fill className="object-contain" unoptimized /> : null}<span className="absolute left-1 top-1 rounded bg-sky-700 px-2 py-0.5 text-xs font-bold text-white">#{result.placing}</span></div><div><div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">{result.rankLabel}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">English card list</span></div><h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{archetype.nameEn}</h1>{archetype.nameJa && <p className="mt-1 text-sm text-gray-400">{archetype.nameJa}</p>}<p className="mt-3 text-sm text-gray-600">{result.playerName} · {result.countryCode} · {totalCards} cards</p></div></div><div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-gray-500">{tournament.shortName} · {tournament.eventDateStart} · {tournament.city}, {tournament.countryCode}</div></section><section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-900">Deck List ({totalCards} cards)</h2><a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-sky-600">Source ↗</a></div><div className="space-y-7">{groups.map(group => { const cards = result.cards.filter(card => card.category === group); if (!cards.length) return null; return <div key={group}><h3 className="mb-3 text-sm font-bold text-gray-700">{group} <span className="font-normal text-gray-400">{cards.reduce((total, card) => total + card.quantity, 0)}</span></h3><OverseasDeckCardGrid cards={cards} /></div> })}</div></section></main><Footer game="pokemon" /></div>
}
