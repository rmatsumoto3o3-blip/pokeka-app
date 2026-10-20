import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import CityAdminProvider from '@/components/city/CityAdminContext'
import CityClient from '@/components/city/CityClient'
import { loadCityStatic, buildCityView } from '@/lib/cityView'

// 公開ページは静的ISR（searchParams不使用＝本当に静的）。既定（最新月・最新日）をSSRし、
// 月/日付/分布/並び替えの切替は CityClient が /api/city/view（CDNキャッシュ）から取得する。
export const revalidate = 43200

const CITY_URL = 'https://www.pokelix.jp/city'
export const metadata: Metadata = {
    title: 'シティリーグ結果・入賞デッキ・採用率 | ポケカ環境 | PokéLix',
    description:
        'ポケモンカード「シティリーグ」の入賞デッキを日付・開催店舗別に掲載。優勝〜ベスト16のデッキレシピ（公式デッキコード）、デッキ分布（使用率ランキング）、注目カードの採用率を毎日更新。いまのポケカ環境デッキを一目でチェックできます。',
    keywords: [
        'ポケカ シティリーグ', 'シティリーグ 結果', 'シティリーグ 入賞デッキ', 'ポケカ 入賞デッキ',
        'ポケカ 環境デッキ', 'ポケカ 環境', 'デッキ分布', 'カード 採用率', 'ポケモンカード デッキレシピ',
        'ポケカ 優勝デッキ', 'デッキコード',
    ],
    alternates: { canonical: CITY_URL },
    openGraph: {
        title: 'シティリーグ結果・入賞デッキ・採用率 | PokéLix',
        description: 'ポケカ シティリーグの入賞デッキ・デッキ分布・注目カード採用率を日付/店舗別に毎日更新。',
        url: CITY_URL,
        siteName: 'PokéLix',
        type: 'website',
        locale: 'ja_JP',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'シティリーグ結果・入賞デッキ | PokéLix',
        description: 'ポケカ シティリーグの入賞デッキ・採用率を毎日更新。',
    },
    robots: { index: true, follow: true },
}

export default async function CityPage() {
    const s = await loadCityStatic()
    const view = await buildCityView({}) // 既定ビュー（最新月・最新日）をSSR

    const introMeta = view.introMeta
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'PokéLix', item: 'https://www.pokelix.jp/' },
                    { '@type': 'ListItem', position: 2, name: 'シティリーグ結果', item: CITY_URL },
                ],
            },
            {
                '@type': 'CollectionPage',
                name: 'シティリーグ結果・入賞デッキ・採用率',
                description: 'ポケカ シティリーグの入賞デッキ・デッキ分布（使用率）・注目カード採用率を日付/店舗別に毎日更新。',
                url: CITY_URL,
                inLanguage: 'ja',
                isPartOf: { '@type': 'WebSite', name: 'PokéLix', url: 'https://www.pokelix.jp/' },
                ...(view.dist.list.length
                    ? {
                        mainEntity: {
                            '@type': 'ItemList',
                            name: 'ポケカ環境 デッキ分布（使用率ランキング）',
                            itemListElement: view.dist.list.slice(0, 10).map((d, i) => ({
                                '@type': 'ListItem', position: i + 1, name: d.name,
                            })),
                        },
                    }
                    : {}),
            },
        ],
    }

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <PublicHeader />
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-black text-gray-900">ポケカ シティリーグ結果・入賞デッキ・採用率</h1>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        ポケモンカード「シティリーグ」の入賞デッキ（優勝〜ベスト16）を開催日・店舗別にまとめています。
                        各デッキは公式デッキコードからレシピを確認でき、<strong>デッキ分布（使用率ランキング）</strong>と
                        <strong>注目カードの採用率</strong>もあわせて掲載。いまのポケカ環境デッキを一目でチェックできます。
                        {introMeta && <span className="block mt-1 text-gray-500">{introMeta}</span>}
                    </p>
                </div>
                {/* 専用ページへの導線 */}
                <div className="mb-3 flex flex-wrap gap-2">
                    <a href="/city/archetypes"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-black border bg-white text-blue-700 border-blue-300 hover:bg-blue-50 transition">
                        <span>📊 デッキ別 採用カード・採用率</span>
                        <span className="text-[11px] font-bold opacity-80">を見る（全期間・月別）→</span>
                    </a>
                    <a href="/city/prefectures"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-black border bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50 transition">
                        <span>🗾 都道府県別デッキ分布</span>
                        <span className="text-[11px] font-bold opacity-80">を見る（全期間・月・地方で絞り込み）→</span>
                    </a>
                </div>

                {/* 管理者ログイン時のみ各デッキを区分（公開側には一切出さない） */}
                <CityAdminProvider existing={s.existing} auto={s.autoOptions} initialOverrides={s.overrides}>
                    <CityClient initial={view} s={s} />

                    {/* SEO用の補足テキスト（検索意図の受け皿） */}
                    <section className="mt-8 text-sm leading-relaxed text-gray-600 space-y-2">
                        <h2 className="text-base font-black text-gray-900">ポケカ シティリーグとは</h2>
                        <p>
                            シティリーグはポケモンカードゲームの公式大会で、全国の店舗で毎週末を中心に開催されています。
                            本ページでは各大会の入賞デッキ（オープンリーグ）を開催日・店舗ごとに集計し、
                            どのデッキタイプがどれだけ勝ち上がっているか（<strong>デッキ分布・使用率</strong>）や、
                            入賞デッキでの<strong>カード採用率</strong>を毎日更新しています。
                            新弾後の環境変化のチェック、デッキ構築の参考、対面（メタ）の把握にご活用ください。
                        </p>
                        <p className="text-gray-500">
                            各デッキのレシピは「公式 ↗」から公式デッキコードで確認できます。使用率・採用率は入賞デッキ（重複デッキコードは1回）で集計しています。
                        </p>
                    </section>
                </CityAdminProvider>
            </div>
        </div>
    )
}
