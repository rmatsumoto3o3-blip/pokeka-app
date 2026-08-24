import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import GundamDeckCardGrid from '@/components/GundamDeckCardGrid'
import GundamDeckIcon from '@/components/GundamDeckIcon'
import AdPlaceholder from '@/components/AdPlaceholder'
import { fetchGundamDeckData, type GundamCard } from '@/lib/gundamDeckParser'

export const revalidate = 3600
export const dynamicParams = true

async function getRecommendedDeck(id: string) {
    const supabase = await createClient()
    const { data: deck, error } = await supabase
        .from('gundam_recommended_decks')
        .select('id, deck_code, tag_code, deck_name, image_url')
        .eq('id', id)
        .single()

    if (error || !deck) return null

    // 保存済みカード構成を使う（公式API非依存）。軽量形式 [{n,q}] は gundam_cards 辞書で解決。
    let mainDeck: GundamCard[] = []
    const { data: stored } = await supabase
        .from('gundam_recommended_decks')
        .select('card_list')
        .eq('id', id)
        .single()
    const cl: any = stored?.card_list
    if (Array.isArray(cl) && cl.length > 0) {
        if (cl[0] && typeof cl[0] === 'object' && 'n' in cl[0]) {
            // 軽量形式：番号→辞書で名前・画像を復元
            const numbers = cl.map((x: any) => x.n).filter(Boolean)
            const { data: dict } = await supabase
                .from('gundam_cards')
                .select('card_number, card_name, image_url, color, cost, card_type')
                .in('card_number', numbers)
            const dmap = new Map((dict || []).map((c: any) => [c.card_number, c]))
            mainDeck = cl.map((x: any, i: number) => {
                const c: any = dmap.get(x.n) || {}
                return {
                    id: i, code: x.n, cardNumber: x.n,
                    name: c.card_name || x.n, quantity: x.q || 1,
                    imageUrl: c.image_url || '', cost: c.cost || '', color: c.color || '', type: c.card_type || '',
                } as GundamCard
            })
        } else {
            mainDeck = cl as GundamCard[] // 旧フル形式
        }
    } else if (deck.deck_code) {
        try {
            mainDeck = (await fetchGundamDeckData(deck.deck_code)).mainDeck
        } catch (e) {
            console.error('Failed to fetch gundam deck recipe:', e)
        }
    }

    // アイコン（icon_urls）は別クエリで安全に取得（列未追加でも壊れない）
    const { data: ic } = await supabase.from('gundam_recommended_decks').select('icon_urls').eq('id', id).single()
    const iconUrls = (ic as any)?.icon_urls ?? null

    return { ...deck, mainDeck, iconUrls }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const deck = await getRecommendedDeck(id)
    if (!deck) return { title: 'Deck Not Found' }

    const deckName = deck.deck_name || 'ガンダム デッキ'

    return {
        title: `${deckName} | ガンダム みんなのデッキ | ポケリス`,
        description: `【ガンダム】投稿デッキ「${deckName}」のデッキレシピ・採用カード一覧。`,
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const deck = await getRecommendedDeck(id)
    if (!deck) notFound()

    const deckName = deck.deck_name || 'ガンダム デッキ'
    const comment = deck.tag_code as string | null
    const imageUrl = deck.image_url
    const mainDeck = deck.mainDeck || []
    const totalCards = mainDeck.reduce((acc, c) => acc + c.quantity, 0)

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            <PublicHeader game="gundam" />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="md:flex">
                        <div className="md:w-1/3 bg-gray-100 relative aspect-[4/3] md:aspect-auto">
                            {(Array.isArray(deck.iconUrls) && deck.iconUrls.filter(Boolean).length > 0) || imageUrl ? (
                                <GundamDeckIcon iconUrls={deck.iconUrls} thumbnailUrl={imageUrl} alt={deckName} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">🃏</div>
                            )}
                        </div>
                        <div className="p-6 md:w-2/3 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">みんなのデッキ</span>
                                {comment && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{comment}</span>}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">{deckName}</h1>
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

                <div className="mt-8 rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm">
                    <AdPlaceholder slot="5651129539" format="leaderboard" className="mx-auto" />
                </div>
            </main>
        </div>
    )
}
