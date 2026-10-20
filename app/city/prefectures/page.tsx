import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import { buildPrefectureView } from '@/lib/cityView'
import PrefecturesClient from '@/components/city/PrefecturesClient'

// 都道府県別デッキ分布。静的ISR（searchParams不使用）。既定＝全期間/全国をSSRし、
// 絞り込みは /api/city/prefectures（CDNキャッシュ）から取得。
export const revalidate = 43200

const PREF_URL = 'https://www.pokelix.jp/city/prefectures'
export const metadata: Metadata = {
    title: '都道府県別デッキ分布 | ポケカ シティリーグ環境 | PokéLix',
    description: 'ポケモンカード シティリーグ入賞デッキの都道府県別・地方別アーキタイプ分布（使用率）。全期間／月別、全国／地方（関東・近畿…）で絞り込み。地域ごとの環境メタの偏りがわかります。',
    keywords: ['ポケカ 都道府県別', 'シティリーグ 地域', 'ポケカ 地方別 環境', 'デッキ分布 都道府県', 'ポケカ 環境 地域差'],
    alternates: { canonical: PREF_URL },
    openGraph: { title: '都道府県別デッキ分布 | ポケカ シティリーグ環境', description: 'ポケカ シティリーグの都道府県別・地方別デッキ分布。全期間/月・全国/地方で絞り込み。', url: PREF_URL, siteName: 'PokéLix', type: 'website', locale: 'ja_JP' },
    robots: { index: true, follow: true },
}

export default async function PrefDistPage() {
    const view = await buildPrefectureView({}) // 既定（全期間・全国）をSSR

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900">
            <PublicHeader />
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="mb-4">
                    <Link href="/city" className="text-sm font-bold text-indigo-600 hover:underline">← シティリーグ結果へ戻る</Link>
                    <h1 className="text-2xl font-black text-gray-900 mt-1">都道府県別デッキ分布</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        ポケカ シティリーグ入賞デッキ（オープン）のアーキタイプ使用率を、開催地の都道府県・地方ごとに集計。
                        地域による環境メタの偏りが確認できます。
                    </p>
                </div>

                <PrefecturesClient initial={view} />

                <p className="mt-8 text-[11px] text-gray-400">
                    ※アーキタイプ分類はシティリーグ結果と同じ基準（入賞デッキの代表カード）。重複デッキコードは1回として集計しています。
                </p>
            </div>
        </div>
    )
}
