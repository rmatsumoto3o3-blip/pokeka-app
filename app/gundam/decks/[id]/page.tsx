import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import GundamDeckCardGrid from '@/components/GundamDeckCardGrid'
import GundamDeckIcon from '@/components/GundamDeckIcon'
import { fetchGundamDeckData, type GundamCard } from '@/lib/gundamDeckParser'

export const revalidate = 3600
export const dynamicParams = true

async function getDeck(id: string) {
    const supabase = await createClient()
    const { data: deck, error } = await supabase
        .from('gundam_deck_records')
        .select(`
            id,
            deck_code,
            event_rank,
            event_date,
            event_location,
            archetype_id,
            color,
            deck_name,
            thumbnail_url,
            icon_urls,
            created_at,
            gundam_deck_archetypes (
                id,
                name,
                cover_image_url
            )
        `)
        .eq('id', id)
        .single()

    if (error || !deck) return null

    // 1. DBに保存済みのカード構成があればそれを使う（公式API非依存・deck_code失効に耐える）
    //    card_list列が未作成でもクエリ失敗を握りつぶして従来動作にフォールバックする
    let mainDeck: GundamCard[] = []
    const { data: stored } = await supabase
        .from('gundam_deck_records')
        .select('card_list')
        .eq('id', id)
        .single()
    if (stored?.card_list && Array.isArray(stored.card_list) && stored.card_list.length > 0) {
        mainDeck = stored.card_list as GundamCard[]
    } else if (deck.deck_code) {
        // 2. 未保存なら公式APIからリアルタイム取得（フォールバック）
        try {
            const deckData = await fetchGundamDeckData(deck.deck_code)
            mainDeck = deckData.mainDeck
        } catch (e) {
            console.error('Failed to fetch Union Arena deck recipe:', e)
        }
    }

    return { ...deck, mainDeck }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const deck = await getDeck(id)
    if (!deck) return { title: 'Deck Not Found' }

    const archetype = (deck.gundam_deck_archetypes as any)?.name || 'ガンダム'
    const displayName = deck.event_location || deck.deck_code || archetype

    return {
        title: `${displayName} (${archetype}) | ポケリス`,
        description: `【ガンダム】${archetype}デッキ「${displayName}」の大会結果とデッキレシピ。`,
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const deck = await getDeck(id)
    if (!deck) notFound()

    const archetype = (deck.gundam_deck_archetypes as any)?.name || 'Unknown'
    const imageUrl = (deck.thumbnail_url || (deck.gundam_deck_archetypes as any)?.cover_image_url) as string | undefined
    const displayName = deck.event_location || deck.deck_code || archetype
    const mainDeck = deck.mainDeck || []
    const totalCards = mainDeck.reduce((acc, c) => acc + c.quantity, 0)

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${displayName}（${archetype}）| ガンダム デッキレシピ`,
        image: imageUrl ? [imageUrl] : [],
        author: { '@type': 'Organization', name: 'PokéLix' },
        publisher: { '@type': 'Organization', name: 'PokéLix', logo: { '@type': 'ImageObject', url: 'https://www.pokelix.jp/icon.png' } },
        datePublished: (deck as any).created_at,
        description: `ガンダムカードゲーム ${archetype}デッキ「${displayName}」の大会結果とデッキレシピ。`,
        mainEntity: {
            '@type': 'ItemList',
            name: 'Deck List',
            itemListElement: mainDeck.map((c, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: { '@type': 'Thing', name: `${c.name} x${c.quantity}` },
            })),
        },
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <PublicHeader game="gundam" />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="md:flex">
                        <div className="md:w-1/3 bg-gray-100 relative aspect-[4/3] md:aspect-auto">
                            {(Array.isArray(deck.icon_urls) && deck.icon_urls.filter(Boolean).length > 0) || deck.thumbnail_url || imageUrl ? (
                                <GundamDeckIcon
                                    iconUrls={deck.icon_urls}
                                    thumbnailUrl={deck.thumbnail_url}
                                    fallbackUrl={(deck.gundam_deck_archetypes as any)?.cover_image_url}
                                    alt={displayName}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">🃏</div>
                            )}
                        </div>
                        <div className="p-6 md:w-2/3 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {deck.color && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">{deck.color}</span>
                                )}
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{archetype}</span>
                                {deck.event_rank && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">{deck.event_rank}</span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{displayName}</h1>
                            {deck.deck_code && (
                                <a
                                    href={`https://www.bandai-tcg-plus.com/deck_code_recipe/${deck.deck_code}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition w-fit"
                                >
                                    公式で見る
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {mainDeck.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                            デッキリスト ({totalCards}枚)
                        </h2>
                        <GundamDeckCardGrid cards={mainDeck} />
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-500 mb-3">テキスト形式</h3>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 font-mono leading-relaxed whitespace-pre-wrap select-all">
                                {mainDeck.map((c) => `${c.quantity} ${c.name}`).join('\n')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">カードリストを取得できませんでした。</p>
                        {deck.deck_code && (
                            <a
                                href={`https://www.bandai-tcg-plus.com/deck_code_recipe/${deck.deck_code}`}
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
