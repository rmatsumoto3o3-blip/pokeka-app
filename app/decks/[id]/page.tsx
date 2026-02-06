
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 3600 // Revalidate every hour
export const dynamicParams = true

async function getDeck(id: string) {
    const supabase = await createClient()

    // 1. Fetch Reference Deck Metadata
    const { data: deck, error } = await supabase
        .from('reference_decks')
        .select(`
            *,
            deck_archetypes (
                id,
                name
            )
        `)
        .eq('id', id)
        .single()

    if (error || !deck) return null

    // 2. Fetch Card List (from analyzed_decks by deck_code)
    // We prioritize analyzed_decks for structured data
    const { data: analyzed } = await supabase
        .from('analyzed_decks')
        .select('cards_json')
        .eq('deck_code', deck.deck_code)
        .eq('archetype_id', deck.archetype_id) // Ensure archetype match
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // Fallback: If no analyzed deck, we might need to parse deck_code or just show basic info
    // For now, if no analyzed deck, we just show metadata.

    return { ...deck, cards: analyzed?.cards_json || [] }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const deck = await getDeck(id)
    if (!deck) return { title: 'Deck Not Found' }

    const archetype = deck.deck_archetypes?.name || 'ポケモンカード'
    return {
        title: `${deck.deck_name} (${archetype}) | ポケリス`,
        description: `【ポケカ】${archetype}デッキ「${deck.deck_name}」のデッキレシピと採用カード詳細。ジムバトルやシティリーグの優勝・入賞デッキを分析。`,
        openGraph: {
            title: `${deck.deck_name} | ポケリス`,
            description: `${archetype}デッキのレシピ公開中！`,
            images: deck.image_url ? [deck.image_url] : [],
        }
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const deck = await getDeck(id)

    if (!deck) notFound()

    const archetype = deck.deck_archetypes?.name || 'Unknown'
    const cards = deck.cards as any[]

    // Prepare JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${deck.deck_name}`,
        "image": deck.image_url ? [deck.image_url] : [],
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

            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
                        <span className="text-2xl">⚡️</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                            POKELIX
                        </span>
                    </Link>
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                        TOPへ戻る
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="md:flex">
                        {/* Image */}
                        <div className="md:w-1/3 bg-gray-100 relative aspect-[4/3] md:aspect-auto">
                            {deck.image_url ? (
                                <img
                                    src={deck.image_url}
                                    alt={deck.deck_name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">⚡️</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-6 md:w-2/3 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                    {archetype}
                                </span>
                                {deck.event_type && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                        {deck.event_type}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                {deck.deck_name}
                            </h1>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={deck.deck_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition"
                                >
                                    公式で見る
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                                {deck.deck_code && (
                                    <a
                                        href={`/practice?code=${deck.deck_code}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500 text-white rounded-lg font-bold text-sm hover:bg-pink-600 transition"
                                    >
                                        一人回し練習
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card List Section */}
                {cards.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                            デッキリスト ({cards.reduce((acc, c) => acc + c.quantity, 0)}枚)
                        </h2>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
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
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 font-mono leading-relaxed whitespace-pre-wrap select-all">
                                {cards.map((c: any) => `${c.quantity} ${c.name}`).join('\n')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">詳細なカードリストは登録されていません。</p>
                        <p className="text-sm text-gray-400 mt-2">公式ページでご確認ください。</p>
                    </div>
                )}
            </main>
        </div>
    )
}
