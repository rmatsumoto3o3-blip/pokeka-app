import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import { fmtMonth } from '@/lib/city'
import { loadArchetypeAdoption, loadCityMonths } from '@/lib/cityStore'
import ArchetypeCardAdoption from '@/components/city/ArchetypeCardAdoption'

export const revalidate = 43200 // 12時間
export const metadata: Metadata = {
    title: 'ポケカ デッキ別 採用カード・採用率｜シティリーグ集計',
    description: 'シティリーグの全入賞デッキを集計し、デッキ（アーキタイプ）ごとに採用されているカードと採用率・平均採用枚数を一覧化。全期間／月別で、いまの環境デッキの中身がわかります。',
    keywords: ['ポケカ 採用率', 'ポケカ アーキタイプ 採用カード', 'ポケカ デッキ 採用率', 'シティリーグ 採用率', 'ポケカ 環境 カード'],
    alternates: { canonical: 'https://www.pokelix.jp/city/archetypes' },
    openGraph: {
        title: 'ポケカ デッキ別 採用カード・採用率', description: 'シティリーグ集計。デッキタイプごとの採用カードと採用率を一覧。',
        url: 'https://www.pokelix.jp/city/archetypes', siteName: 'PokéLix（ポケリス）', type: 'website', locale: 'ja_JP',
    },
    robots: { index: true, follow: true },
}

export default async function CityArchetypesPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
    const { month } = await searchParams
    const months = await loadCityMonths()
    const selMonth = month && months.includes(month) ? month : undefined // undefined = 全期間
    const data = await loadArchetypeAdoption(selMonth)

    return (
        <div className="min-h-screen bg-[#f5f7fa]">
            <PublicHeader game="pokemon" />
            <main className="max-w-4xl mx-auto px-4 py-6">
                <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1"><Link href="/city" className="hover:underline">シティリーグ結果</Link> ／ デッキ別採用率</div>
                    <h1 className="text-2xl font-bold text-gray-900">デッキ別 採用カード・採用率</h1>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                        シティリーグの入賞デッキで採用されているカードと採用率・平均採用枚数一覧表示。<span className="text-gray-400">（0.9%以下は非表示）</span>
                    </p>
                </div>

                {/* 期間切替：全期間 ＋ 月別 */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
                    <Link href="/city/archetypes"
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition ${!selMonth ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>全期間</Link>
                    {months.map(m => (
                        <Link key={m} href={`/city/archetypes?month=${m}`}
                            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition ${selMonth === m ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{fmtMonth(m)}</Link>
                    ))}
                </div>

                {data.length === 0
                    ? <div className="text-center text-gray-400 py-24 bg-white rounded-xl border border-dashed">集計できるデータがありません。</div>
                    : <ArchetypeCardAdoption data={data} />}

                <p className="mt-8 text-[11px] text-gray-400">※採用率はアーキタイプ内のデッキ数を母数に算出。データはシティリーグの入賞デッキをもとに随時更新されます。</p>
            </main>
        </div>
    )
}
