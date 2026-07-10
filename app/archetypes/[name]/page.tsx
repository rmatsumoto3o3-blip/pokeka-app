import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

export const revalidate = 86400 // 24時間（GASが毎日更新）
// generateStaticParams に無いアーキタイプ名は404を返す（ソフト404を防ぐ）
export const dynamicParams = false

interface Props {
    params: Promise<{ name: string }>
}

interface RecentCard {
    card_name: string
    image_url: string | null
    supertype: string | null
    subtypes: string[] | null
    total_qty: number
    adoption_count: number
    total_decks: number
}

const CATEGORY_ORDER = ['Pokemon', 'Goods', 'Tool', 'Supporter', 'Stadium', 'Energy'] as const
const CATEGORY_LABEL: Record<string, string> = {
    Pokemon: 'ポケモン',
    Goods: 'グッズ',
    Tool: 'ポケモンのどうぐ',
    Supporter: 'サポート',
    Stadium: 'スタジアム',
    Energy: 'エネルギー',
}

function categoryOf(supertype: string | null, subtypes: string[] | null): string {
    if (supertype === 'Pokémon') return 'Pokemon'
    if (supertype === 'Energy') return 'Energy'
    const s = subtypes?.[0] || ''
    if (s === 'Supporter') return 'Supporter'
    if (s === 'Stadium') return 'Stadium'
    if (s === 'Pokémon Tool') return 'Tool'
    return 'Goods'
}

// params.name を安全にデコード（二重エンコードURLにも対応）
function safeDecodeName(raw: string): string {
    let d = raw
    try { d = decodeURIComponent(raw) } catch { return raw }
    // まだ %XX が残っていたら二重エンコードなのでもう一度デコード
    if (/%[0-9A-Fa-f]{2}/.test(d)) {
        try { d = decodeURIComponent(d) } catch { /* そのまま */ }
    }
    return d
}

export async function generateStaticParams() {
    const { data } = await supabase.from('deck_archetypes').select('name')
    // Next.js が自動でエンコードするため、ここではデコード済みの生の名前を返す
    return (data || []).map((a) => ({ name: a.name }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { name } = await params
    const decoded = safeDecodeName(name)
    const encoded = encodeURIComponent(decoded)
    const title = `${decoded}デッキの採用カード・レシピ【直近2ヶ月】`
    const description = `ポケカ「${decoded}」デッキの直近2ヶ月の採用カード一覧と採用率。全国の大会データから集計したリアルな構築をカードごとの採用率・平均枚数で確認できます。`
    return {
        title,
        description,
        keywords: [`${decoded} デッキ`, `${decoded} デッキレシピ`, `${decoded} 採用率`, `${decoded} 構築`, 'ポケカ', 'ポケモンカード'],
        openGraph: {
            title: `${decoded}デッキの採用カード・レシピ | PokéLix`,
            description,
            url: `https://www.pokelix.jp/archetypes/${encoded}`,
            siteName: 'PokéLix（ポケリス）',
            locale: 'ja_JP',
            type: 'website',
        },
        alternates: {
            canonical: `https://www.pokelix.jp/archetypes/${encoded}`,
        },
    }
}

export default async function ArchetypePage({ params }: Props) {
    const { name } = await params
    const decoded = safeDecodeName(name)

    const { data: arch } = await supabase
        .from('deck_archetypes')
        .select('id, name')
        .eq('name', decoded)
        .single()

    if (!arch) notFound()

    const { data: cards } = await supabase
        .from('archetype_cards_recent')
        .select('*')
        .eq('archetype_id', arch.id)
        .order('adoption_count', { ascending: false })

    if (!cards || cards.length === 0) notFound()

    const list = cards as RecentCard[]
    const totalDecks = list[0].total_decks

    const byCategory: Record<string, RecentCard[]> = {}
    list.forEach((c) => {
        const cat = categoryOf(c.supertype, c.subtypes)
        if (!byCategory[cat]) byCategory[cat] = []
        byCategory[cat].push(c)
    })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PublicHeader />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">← トップに戻る</Link>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-2">
                            {decoded}デッキの採用カード一覧
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
                            直近2ヶ月の大会データ（{totalDecks}件のデッキ）から集計した、{decoded}デッキの採用カードと採用率です。
                        </p>
                    </div>

                    {/* Categories */}
                    {CATEGORY_ORDER.filter((cat) => byCategory[cat]?.length).map((cat) => (
                        <section key={cat} className="mb-8">
                            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                                {CATEGORY_LABEL[cat]}
                                <span className="text-sm font-normal text-gray-400">{byCategory[cat].length}種</span>
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {byCategory[cat].map((c) => {
                                    const rate = Math.round((c.adoption_count / c.total_decks) * 100)
                                    const avg = (c.total_qty / c.adoption_count).toFixed(1)
                                    return (
                                        <div key={c.card_name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="relative aspect-[63/88] bg-gray-100">
                                                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 font-bold p-1 text-center">
                                                    {c.card_name}
                                                </div>
                                                {c.image_url && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={c.image_url}
                                                        alt={c.card_name}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <div className="absolute top-0 right-0 bg-blue-600/90 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                                                    {rate}%
                                                </div>
                                            </div>
                                            <div className="px-2 py-1.5">
                                                <p className="text-xs font-medium text-gray-800 truncate">{c.card_name}</p>
                                                <p className="text-[11px] text-gray-400">平均 {avg}枚</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    ))}

                    {/* Simulator CTA */}
                    <div className="mt-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white text-center">
                        <h2 className="text-lg md:text-xl font-bold mb-2">このデッキの初手確率を計算してみる</h2>
                        <p className="text-white/85 text-sm mb-4">デッキコードを入力すれば、初手確率やサイド落ちリスクを無料でシミュレーションできます。</p>
                        <Link
                            href="/simulator"
                            className="inline-block bg-white text-blue-700 font-bold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform"
                        >
                            シミュレーターを使う（無料）
                        </Link>
                    </div>

                    <p className="mt-6 text-xs text-gray-400 text-center">
                        ※採用率は直近2ヶ月の大会入賞デッキを集計したものです。データは毎日更新されます。
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
