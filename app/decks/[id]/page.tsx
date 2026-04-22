import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchDeckData } from '@/lib/deckParser'

export const revalidate = 3600
export const dynamicParams = true

async function getDeck(id: string) {
    const supabase = await createClient()

    const { data: record, error } = await supabase
        .from('deck_records')
        .select(`
            id,
            deck_code,
            event_rank,
            event_date,
            event_location,
            created_at,
            archetype_id,
            deck_archetypes (
                id,
                name
            )
        `)
        .eq('id', id)
        .single()

    if (error || !record) return null

    // カードデータはポケカ公式から都度取得
    let cards: Awaited<ReturnType<typeof fetchDeckData>> = []
    if (record.deck_code) {
        try {
            cards = await fetchDeckData(record.deck_code)
        } catch {
            // 取得失敗でも表示は続ける
        }
    }

    return { ...record, cards }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const deck = await getDeck(id)
    if (!deck) return { title: 'Deck Not Found' }

    const archetype = (deck.deck_archetypes as any)?.name || 'ポケモンカード'
    const title = deck.event_date && deck.event_location
        ? `${deck.event_date} ${deck.event_location} ${deck.event_rank || ''}`
        : deck.deck_code

    return {
        title: `${title} (${archetype}) | ポケリス`,
        description: `【ポケカ】${archetype}デッキ「${title}」のデッキレシピと採用カード詳細。`,
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const deck = await getDeck(id)

    if (!deck) notFound()

    const archetype = (deck.deck_archetypes as any)?.name || 'Unknown'
    const cards = deck.cards

    const displayName = deck.event_date && deck.event_location
        ? `${deck.event_date} ${deck.event_location}`
        : deck.deck_code

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": displayName,
        "author": { "@type": "Organization", "name": "Pokelix" },
        "publisher": {
            "@type": "Organization",
            "name": "Pokelix",
            "logo": { "@type": "ImageObject", "url": "https://pokelix.jp/icon.png" }
        },
        "datePublished": deck.created_at,
        "description": `${archetype}デッキの紹介。`,
        "mainEntity": {
            "@type": "ItemList",
            "name": "Deck List",
            "itemListElement": cards.map((c, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "item": { "@type": "Thing", "name": `${c.name} x${c.quantity}` }
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
                    <div className="p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                {archetype}
                            </span>
                            {deck.event_rank && (
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    deck.event_rank === '優勝' ? 'bg-yellow-100 text-yellow-700' :
                                    deck.event_rank === '準優勝' ? 'bg-gray-100 text-gray-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {deck.event_rank === '優勝' ? '🥇' : deck.event_rank === '準優勝' ? '🥈' : '🎖️'} {deck.event_rank}
                                </span>
                            )}
                            {deck.event_date && (
                                <span className="text-xs text-gray-500">{deck.event_date}</span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                            {displayName}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            {deck.deck_code && (
                                <a
                                    href={`https://www.pokemon-card.com/deck/confirm.html/deckID/${deck.deck_code}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition"
                                >
                                    公式で見る
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            )}
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

                {/* Card List */}
                {cards.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
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
                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                                        x{card.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-500 mb-3">テキスト形式</h3>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 font-mono leading-relaxed whitespace-pre-wrap select-all">
                                {cards.map((c) => `${c.quantity} ${c.name}`).join('\n')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">カードリストを取得できませんでした。</p>
                        {deck.deck_code && (
                            <a
                                href={`https://www.pokemon-card.com/deck/confirm.html/deckID/${deck.deck_code}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-block text-blue-500 hover:underline text-sm"
                            >
                                公式ページで確認する →
                            </a>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
