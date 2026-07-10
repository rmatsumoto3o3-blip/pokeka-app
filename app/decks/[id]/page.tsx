
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import DeckPracticeLauncher from '@/components/DeckPracticeLauncher'
import { fetchDeckData } from '@/lib/deckParser'

export const revalidate = 3600 // Revalidate every hour
export const dynamicParams = true

async function getDeck(id: string) {
    const supabase = await createClient()

    // 1. Fetch Deck Record + Archetype
    const { data: deck, error } = await supabase
        .from('deck_records')
        .select(`
            *,
            deck_archetypes (
                id,
                name,
                cover_image_url
            )
        `)
        .eq('id', id)
        .single()

    if (error || !deck) return null

    // 2. Fetch Card List directly from the official deck code (same approach as the simulator tools)
    let cards: Awaited<ReturnType<typeof fetchDeckData>> = []
    if (deck.deck_code) {
        try {
            cards = await fetchDeckData(deck.deck_code)
        } catch (e) {
            console.error('Failed to fetch deck card list:', e)
        }
    }

    return { ...deck, cards }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const deck = await getDeck(id)
    if (!deck) return { title: 'Deck Not Found' }

    const archetype = deck.deck_archetypes?.name || 'ポケモンカード'
    const deckName = `${archetype}${deck.event_rank ? `（${deck.event_rank}）` : ''}`
    return {
        title: `${deckName} | ポケリス`,
        description: `【ポケカ】${archetype}デッキのレシピと採用カード詳細。ジムバトルやシティリーグの優勝・入賞デッキを分析。`,
        openGraph: {
            title: `${deckName} | ポケリス`,
            description: `${archetype}デッキのレシピ公開中！`,
            images: deck.deck_archetypes?.cover_image_url ? [deck.deck_archetypes.cover_image_url] : [],
        }
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const deck = await getDeck(id)

    if (!deck) notFound()

    const archetype = deck.deck_archetypes?.name || 'Unknown'
    const deckName = `${archetype}${deck.event_rank ? `（${deck.event_rank}）` : ''}`
    const imageUrl = deck.deck_archetypes?.cover_image_url as string | undefined
    const deckUrl = deck.deck_code
        ? `https://www.pokemon-card.com/deck/confirm.html/deckID/${deck.deck_code}`
        : undefined
    const cards = deck.cards as any[]

    // Prepare JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": deckName,
        "image": imageUrl ? [imageUrl] : [],
        "author": {
            "@type": "Organization",
            "name": "Pokelix"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Pokelix",
            "logo": {
                "@type": "ImageObject",
                "url": "https://pokelix.jp/icon.png"
            }
        },
        "datePublished": deck.created_at,
        "description": `${archetype}デッキの紹介。`,
        "mainEntity": {
            "@type": "ItemList",
            "name": "Deck List",
            "itemListElement": cards.map((c: any, i: number) => ({
                "@type": "ListItem",
                "position": i + 1,
                "item": {
                    "@type": "Thing",
                    "name": `${c.name} x${c.quantity}`
                }
            }))
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <PublicHeader />

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="md:flex">
                        {/* Image */}
                        <div className="md:w-1/3 bg-gray-100 relative aspect-[4/3] md:aspect-auto">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={deckName}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">⚡️</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-6 md:w-2/3 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                    {archetype}
                                </span>
                                {deck.event_rank && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                        {deck.event_rank}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                {deckName}
                            </h1>
                            {(deck.event_location || deck.event_date) && (
                                <p className="text-sm text-gray-500 mb-4">
                                    {[deck.event_location, deck.event_date].filter(Boolean).join(' ・ ')}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {deckUrl && (
                                    <a
                                        href={deckUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition"
                                    >
                                        公式で見る
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                )}
                                {deck.deck_code && (
                                    <DeckPracticeLauncher deckCode={deck.deck_code} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card List Section */}
                {cards.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2.5">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                            デッキリスト ({cards.reduce((acc, c) => acc + c.quantity, 0)}枚)
                        </h2>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                            {cards.map((card, i) => (
                                <div key={i} className="relative aspect-[2/3] group">
                                    {card.imageUrl ? (
                                        <img
                                            src={card.imageUrl}
                                            alt={card.name}
                                            className="w-full h-full object-cover rounded shadow-sm group-hover:shadow-md transition"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-xs text-center p-1 text-gray-400">
                                            {card.name}
                                        </div>
                                    )}
                                    {/* Quantity Badge */}
                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                                        x{card.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Text List for Copy/Paste */}
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-500 mb-3">テキスト形式</h3>
                            <div className="bg-gray-50 p-2.5 rounded-lg text-sm text-gray-600 font-mono leading-relaxed whitespace-pre-wrap select-all">
                                {cards.map((c: any) => `${c.quantity} ${c.name}`).join('\n')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-2.5 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">詳細なカードリストは登録されていません。</p>
                        <p className="text-sm text-gray-400 mt-2">公式ページでご確認ください。</p>
                    </div>
                )}
            </main>
        </div>
    )
}
