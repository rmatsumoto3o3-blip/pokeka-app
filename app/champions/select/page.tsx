import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import ChampionsTool from '@/components/ChampionsTool'

export const metadata: Metadata = {
    title: 'ポケチャン 選出おすすめ｜相性のいい相棒を提案',
    description: 'ポケモンチャンピオンズの選出補助ツール。使いたいポケモンを1〜2匹選ぶと、3匹選出の残り枠に相性のいい相棒をタイプ相性（弱点の受け・攻撃範囲・種族値）から提案します。',
    keywords: ['ポケチャン 選出', 'ポケモンチャンピオンズ 選出', 'ポケチャン パーティ構築', 'ポケチャン 相性', 'ポケチャン タイプ相性', 'ポケチャン おすすめ ポケモン', 'ポケモンチャンピオンズ 構築'],
    alternates: { canonical: 'https://www.pokelix.jp/champions/select' },
    openGraph: {
        title: 'ポケチャン 選出おすすめ | PokéLix（ポケリス）',
        description: '使いたいポケモン1〜2匹から、3匹選出の残り枠に相性のいい相棒を提案。',
        url: 'https://www.pokelix.jp/champions/select',
        siteName: 'PokéLix（ポケリス）', locale: 'ja_JP', type: 'website',
    },
    twitter: { card: 'summary_large_image', title: 'ポケチャン 選出おすすめ | PokéLix', description: '使いたいポケモンから相性のいい相棒を提案。' },
    robots: { index: true, follow: true },
}

export default function ChampionsSelectPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-gray-900">
            <PublicHeader game="champions" />
            <main className="max-w-5xl mx-auto px-4 py-6">
                <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">
                        <Link href="/champions" className="hover:underline">ポケチャン</Link> ／ 選出おすすめ
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">ポケチャン 選出おすすめ</h1>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                        使いたいポケモンを1〜2匹選ぶと、<strong>3匹選出の残り枠に相性のいい相棒</strong>を提案します。
                        受けきれないタイプは必ず残りますが、技・サイクル・起点作り・受けループで対処する前提のゆるめの提案です。
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <ChampionsTool src="/champions-select.html" title="ポケチャン 選出おすすめ" />
                </div>
            </main>
            <Footer />
        </div>
    )
}
