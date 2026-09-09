import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import ChampionsTool from '@/components/ChampionsTool'

export const metadata: Metadata = {
    title: 'ポケチャン ダメージ計算・構築ツール',
    description: 'ポケモンチャンピオンズのダメージ計算・パーティ構築・選出補助が無料。個体値31固定・能力ポイント(32/66)・性格・持ち物・特性・天候/壁/急所まで反映。相手のHP％から振りを逆算、相手パーティに有利な選出も提案します。',
    keywords: ['ポケモンチャンピオンズ ダメージ計算', 'ポケチャン ダメージ計算', 'ポケチャン 計算機', 'ポケモンチャンピオンズ パーティ構築', 'ポケチャン 選出', 'ポケチャン 能力ポイント', 'ポケチャン 努力値', 'ポケチャン タイプ相性', 'ポケモンチャンピオンズ 構築'],
    openGraph: {
        title: 'ポケチャン ダメージ計算・構築ツール | PokéLix（ポケリス）',
        description: 'ポケモンチャンピオンズのダメージ計算・パーティ構築・選出補助・振り逆算が無料。能力ポイント・性格・持ち物・特性・天候まで反映。',
        url: 'https://www.pokelix.jp/champions',
        siteName: 'PokéLix（ポケリス）',
        locale: 'ja_JP',
        type: 'website',
        images: [{ url: '/api/og?title=ポケチャン ダメージ計算・構築ツール&desc=ダメージ計算・パーティ構築・選出補助・振り逆算が無料', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ポケチャン ダメージ計算・構築ツール | PokéLix',
        description: 'ポケモンチャンピオンズのダメージ計算・パーティ構築・選出・逆算が無料。',
        images: ['/api/og?title=ポケチャン ダメージ計算・構築ツール&desc=ダメージ計算・パーティ構築・選出補助・振り逆算が無料'],
    },
    alternates: { canonical: 'https://www.pokelix.jp/champions' },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ポケチャン ダメージ計算・構築ツール | PokéLix',
    url: 'https://www.pokelix.jp/champions',
    description: 'ポケモンチャンピオンズのダメージ計算・パーティ構築・選出補助・振り逆算ができる無料ツール。',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    publisher: { '@type': 'Organization', name: 'PokéLix', logo: { '@type': 'ImageObject', url: 'https://www.pokelix.jp/icon.png' } },
}

export default function ChampionsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <PublicHeader />
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="mb-4 text-xs text-gray-400">
                    <Link href="/" className="text-sky-600">ホーム</Link> › ポケモンチャンピオンズ ツール
                </div>
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">ポケモンチャンピオンズ ダメージ計算・構築ツール</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
                    <b>ポケモンチャンピオンズ</b>用の無料ツールです。パーティ構築（3つ保存）・<b>ダメージ計算</b>・<b>選出補助</b>・相手の<b>振り逆算</b>をまとめて行えます。
                    個体値31固定・<b>能力ポイント（1ヶ所32／合計66）</b>・性格・持ち物・特性に対応し、天候・フィールド・壁・急所・ランクまで反映します。
                    データはお使いのブラウザにのみ保存され、ログイン不要です。
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                    {['パーティ構築（3保存）', 'ダメージ計算', '弱点と補完', '相手の振り逆算', '有利な選出提案'].map(t => (
                        <li key={t} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-medium text-sky-700">{t}</li>
                    ))}
                </ul>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-[#0f1218] shadow-sm">
                    <ChampionsTool />
                </div>

                <section className="mt-8 max-w-3xl text-sm leading-7 text-gray-600">
                    <h2 className="text-lg font-bold text-gray-900">このツールでできること</h2>
                    <p className="mt-2"><b>ダメージ計算</b>：登録したポケモンの構成（性格・能力ポイント・持ち物・特性）でダメージ乱数・HP割合・確定/乱数◯発を算出。天候・壁・やけど・急所・能力ランクにも対応しています。</p>
                    <p className="mt-2"><b>選出補助</b>：相手のパーティ6体を入れると、自分のどのポケモンで選出すると<b>タイプ相性で有利か</b>をスコア順に提案します。</p>
                    <p className="mt-2"><b>振り逆算</b>：相手のHPが減った割合（％）から、相手の<b>HP・防御の能力ポイント配分</b>を絞り込みます。</p>
                    <p className="mt-3 text-xs text-gray-400">※ ポケモン・種族値・技・特性は公開データ（PokéAPI等）を基に集計。使用率は暫定値、天候連動特性など一部は順次対応予定です。ゲーム内の最新調整とは差が出る場合があります。</p>
                </section>
            </main>
            <Footer game="pokemon" />
        </div>
    )
}
