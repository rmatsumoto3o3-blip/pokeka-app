import Link from 'next/link'
import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import { getFirebaseDb } from '@/lib/firebase/admin'
import { getDeckDataAction } from '@/app/actions'

// 環境デッキ詳細（Firebaseでメタ取得＋デッキコードからカード展開）。Supabase不使用。
// 上部に大きな「一人回し」CTA（＝発射台）。カードはキャッシュ済みの getDeckDataAction 経由。

export const revalidate = 3600
export const dynamicParams = true

type EnvDeck = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }

async function getAllDecks(): Promise<EnvDeck[]> {
    const db = getFirebaseDb()
    if (!db) return []
    try {
        const snap = await db.collection('environmentDecks').doc('pokemon').get()
        const data = snap.exists ? snap.data() : null
        return Array.isArray(data?.decks) ? (data!.decks as EnvDeck[]) : []
    } catch { return [] }
}

async function getMeta(code: string): Promise<EnvDeck | null> {
    const decks = await getAllDecks()
    return decks.find(d => d.deckCode === code) || null
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
    const { code } = await params
    const meta = await getMeta(decodeURIComponent(code))
    const title = meta ? `${meta.archetype}（${meta.eventName || '大会デッキ'}）` : '環境デッキ'
    return { title: `${title} | PokéLix`, description: `${title}のデッキリスト。そのまま一人回しで回せます。` }
}

export default async function EnvDeckDetailPage({ params }: { params: Promise<{ code: string }> }) {
    const { code: raw } = await params
    const code = decodeURIComponent(raw)
    const allDecks = await getAllDecks()
    const meta = allDecks.find(d => d.deckCode === code) || null

    // 内部リンク用：同じアーキタイプの他の入賞デッキ（自分を除く・最大8件）
    const siblings = meta
        ? allDecks.filter(d => d.archetype === meta.archetype && d.deckCode !== code).slice(0, 8)
        : []

    let cards: { name: string; imageUrl: string; quantity: number }[] = []
    try {
        const res = await getDeckDataAction(code)
        if (res.success && res.data) cards = res.data
    } catch { /* コード展開失敗時は空 */ }

    const total = cards.reduce((acc, c) => acc + (c.quantity || 0), 0)
    const practiceHref = `/practice?code1=${encodeURIComponent(code)}`

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Article',
                headline: `${meta?.archetype ?? 'ポケカ環境デッキ'}${meta?.eventName ? `（${meta.eventName}）` : ''}のデッキリスト`,
                description: `${meta?.archetype ?? 'ポケカ環境デッキ'}のデッキレシピ。デッキコードからそのまま一人回し（ソリティア）で回せます。`,
                inLanguage: 'ja',
                author: { '@type': 'Organization', name: 'PokéLix' },
                publisher: { '@type': 'Organization', name: 'PokéLix', logo: { '@type': 'ImageObject', url: 'https://www.pokelix.jp/icon.png' } },
                ...(cards.length > 0 ? { mainEntity: { '@type': 'ItemList', numberOfItems: cards.length, itemListElement: cards.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: `${c.name} x${c.quantity}` })) } } : {}),
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.pokelix.jp' },
                    { '@type': 'ListItem', position: 2, name: '環境デッキ', item: 'https://www.pokelix.jp/env' },
                    { '@type': 'ListItem', position: 3, name: meta?.archetype ?? 'デッキ', item: `https://www.pokelix.jp/env/${encodeURIComponent(code)}` },
                ],
            },
        ],
    }

    return (
        <div className="min-h-screen bg-[#f5f7fa]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <PublicHeader game="pokemon" />

            <main className="max-w-5xl mx-auto px-4 py-6">
                <Link href="/env" className="text-sm text-gray-500 hover:text-gray-800">← 環境デッキ一覧</Link>

                <div className="mt-2 mb-4">
                    <h1 className="text-xl font-bold text-gray-900">
                        {meta ? meta.archetype : 'デッキ'}
                        {meta?.rank && <span className="ml-2 text-sm font-bold text-amber-700">{meta.rank}</span>}
                    </h1>
                    <div className="mt-1 text-sm text-gray-600">
                        {meta?.eventName && <span>{meta.eventName}</span>}
                        {meta?.eventDate && <span> ・ {meta.eventDate}</span>}
                        <span className="ml-2 font-mono text-xs text-gray-400">{code}</span>
                    </div>
                </div>

                {/* 発射台CTA */}
                <div className="flex gap-2 mb-5">
                    <Link href={practiceHref} className="flex-[2] text-center text-sm font-bold text-white bg-blue-600 rounded-xl py-3 hover:bg-blue-700">▶ このデッキで一人回し</Link>
                    <a href={`https://www.pokemon-card.com/deck/confirm.html/deckID/${encodeURIComponent(code)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-sm font-bold text-gray-800 border border-gray-300 rounded-xl py-3 hover:bg-gray-50">公式で開く</a>
                </div>

                {/* アーキタイプの採用率ページへ内部リンク */}
                {meta?.archetype && (
                    <Link href={`/archetypes/${encodeURIComponent(meta.archetype)}`} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5 hover:border-blue-300 hover:bg-blue-50/40 transition">
                        <span className="text-sm text-gray-700">
                            <span className="font-bold text-gray-900">{meta.archetype}</span> の採用カード・採用率を見る
                        </span>
                        <span className="text-blue-600 text-sm font-bold">採用率を見る →</span>
                    </Link>
                )}

                {cards.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
                            デッキリスト（{total}枚）
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                            {cards.map((card, i) => (
                                <div key={i} className="relative aspect-[2/3]">
                                    {card.imageUrl ? (
                                        <img src={card.imageUrl} alt={card.name} className="w-full h-full rounded shadow-sm object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-[10px] text-center p-1 text-gray-400">{card.name}</div>
                                    )}
                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded">x{card.quantity}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-dashed">
                        デッキリストを表示できませんでした。「公式で開く」からご確認ください。
                    </div>
                )}

                {/* 内部リンク：同じアーキタイプの他の入賞デッキ */}
                {siblings.length > 0 && (
                    <section className="mt-6 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                            同じ「{meta?.archetype}」の他の入賞デッキ
                        </h2>
                        <ul className="divide-y divide-gray-100">
                            {siblings.map((d) => (
                                <li key={d.deckCode}>
                                    <Link href={`/env/${encodeURIComponent(d.deckCode)}`} className="flex items-center justify-between py-2.5 hover:text-blue-600">
                                        <span className="text-sm text-gray-700">
                                            {d.eventName || '大会デッキ'}
                                            {d.eventDate && <span className="text-gray-400"> ・ {d.eventDate}</span>}
                                        </span>
                                        {d.rank && <span className="text-xs font-bold text-amber-700 shrink-0 ml-2">{d.rank}</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Link href={`/archetypes/${encodeURIComponent(meta!.archetype)}`} className="inline-block mt-3 text-sm font-bold text-blue-600 hover:underline">
                            {meta?.archetype}のデッキをもっと見る →
                        </Link>
                    </section>
                )}
            </main>
        </div>
    )
}
