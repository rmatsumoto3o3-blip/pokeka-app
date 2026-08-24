import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import GundamDeckIcon from '@/components/GundamDeckIcon'
import { getGundamRecommendedDecksAction } from '@/app/actions'

export const metadata: Metadata = {
    title: 'ガンダム みんなのデッキ | PokéLix（ポケリス）',
    description: 'ガンダムカードゲームのデッキレシピ投稿ギャラリー。いろんな構築をカード付きで公開しています。',
    keywords: ['ガンダムカードゲーム デッキ', 'ガンダム デッキレシピ', 'GCG デッキ', 'ガンダムカード 構築'],
    alternates: { canonical: 'https://www.pokelix.jp/gundam/titles' },
}

export const dynamic = 'force-dynamic'

export default async function GundamCommunityDecksPage() {
    const decksRes = await getGundamRecommendedDecksAction()
    const decks = decksRes.data || []

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PublicHeader game="gundam" />
            <main className="flex-grow pt-8 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <Link href="/gundam" className="text-sm text-blue-600 hover:text-blue-800 font-medium">← TOPに戻る</Link>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-2">みんなのデッキ</h1>
                        <p className="text-gray-600 text-sm md:text-base">ガンダムカードゲームのデッキレシピ集。気になる構築をカード付きでチェックできます。</p>
                    </div>

                    {decks.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">まだデッキがありません（診断v2）。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {decks.map((d: any) => (
                                <Link
                                    key={d.id}
                                    href={`/gundam/titles/${d.id}`}
                                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
                                >
                                    <div className="relative aspect-square bg-gray-100">
                                        <GundamDeckIcon iconUrls={d.icon_urls} thumbnailUrl={d.image_url} alt={d.deck_name || 'デッキ'} />
                                    </div>
                                    <div className="px-2.5 py-2">
                                        <p className="text-xs font-bold text-gray-800 truncate">{d.deck_name || '無題のデッキ'}</p>
                                        {d.tag_code && <p className="text-[11px] text-gray-400 truncate">{d.tag_code}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer game="gundam" />
        </div>
    )
}
