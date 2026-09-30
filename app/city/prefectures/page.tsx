import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import { loadEventsDB, loadDeckIndex, loadArchetypeMapDB } from '@/lib/cityStore'
import { buildDistributionByPrefecture, REGIONS, monthOf, fmtMonth } from '@/lib/city'

// 都道府県別デッキ分布の専用ページ。全期間/月 × 全国/地方 で絞り込み。
// 集計は /city と同じ（rep+別名map）。Supabase追加読み込みなし・静的ISR。
export const revalidate = 3600

const PREF_URL = 'https://www.pokelix.jp/city/prefectures'
export const metadata: Metadata = {
    title: '都道府県別デッキ分布 | ポケカ シティリーグ環境 | PokéLix',
    description: 'ポケモンカード シティリーグ入賞デッキの都道府県別・地方別アーキタイプ分布（使用率）。全期間／月別、全国／地方（関東・近畿…）で絞り込み。地域ごとの環境メタの偏りがわかります。',
    keywords: ['ポケカ 都道府県別', 'シティリーグ 地域', 'ポケカ 地方別 環境', 'デッキ分布 都道府県', 'ポケカ 環境 地域差'],
    alternates: { canonical: PREF_URL },
    openGraph: { title: '都道府県別デッキ分布 | ポケカ シティリーグ環境', description: 'ポケカ シティリーグの都道府県別・地方別デッキ分布。全期間/月・全国/地方で絞り込み。', url: PREF_URL, siteName: 'PokéLix', type: 'website', locale: 'ja_JP' },
    robots: { index: true, follow: true },
}

export default async function PrefDistPage({ searchParams }: { searchParams: Promise<{ period?: string; region?: string }> }) {
    const sp = await searchParams
    const events = (await loadEventsDB()).filter(e => e.league === 'オープン')
    const deckIndex = await loadDeckIndex()
    const archMap = await loadArchetypeMapDB()

    const months = [...new Set(events.map(e => monthOf(e.date)))].sort((a, b) => b.localeCompare(a))
    const period = (sp.period && months.includes(sp.period)) ? sp.period : 'all'
    const periodEvents = period === 'all' ? events : events.filter(e => monthOf(e.date) === period)

    const regionKey = REGIONS.some(r => r.key === sp.region) ? sp.region! : 'all'
    const region = REGIONS.find(r => r.key === regionKey)

    const allPref = buildDistributionByPrefecture(periodEvents, deckIndex.reps, archMap)
    const prefDist = region ? allPref.filter(p => region.prefs.includes(p.prefecture)) : allPref
    const totalDecks = prefDist.reduce((s, p) => s + p.total, 0)

    // 選択中のperiod/regionを保ちつつ、片方だけ変えるクエリを作る
    const href = (o: { period?: string; region?: string }) => {
        const pr = o.period ?? period, rg = o.region ?? regionKey
        const parts: string[] = []
        if (pr !== 'all') parts.push(`period=${pr}`)
        if (rg !== 'all') parts.push(`region=${rg}`)
        return '/city/prefectures' + (parts.length ? `?${parts.join('&')}` : '')
    }
    const tab = (active: boolean) =>
        `px-3 py-1.5 rounded-lg text-sm font-bold border ${active
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`

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

                {/* 期間フィルタ */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-bold text-gray-500 w-10">期間</span>
                    <Link href={href({ period: 'all' })} className={tab(period === 'all')}>全期間</Link>
                    {months.map(m => (
                        <Link key={m} href={href({ period: m })} className={tab(period === m)}>{fmtMonth(m)}</Link>
                    ))}
                </div>
                {/* 地域フィルタ */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="text-xs font-bold text-gray-500 w-10">地域</span>
                    <Link href={href({ region: 'all' })} className={tab(regionKey === 'all')}>全国</Link>
                    {REGIONS.map(r => (
                        <Link key={r.key} href={href({ region: r.key })} className={tab(regionKey === r.key)}>{r.label}</Link>
                    ))}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                    {period === 'all' ? '全期間' : fmtMonth(period)}・{region ? region.label : '全国'}
                    ／{prefDist.length}都道府県・{totalDecks}デッキ
                </div>

                {prefDist.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {prefDist.map(p => (
                            <div key={p.prefecture} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                                <div className="flex items-baseline justify-between mb-3">
                                    <span className="font-black text-gray-900">{p.prefecture}</span>
                                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 rounded px-2 py-0.5 shrink-0">{p.total}デッキ</span>
                                </div>
                                <div className="space-y-1.5">
                                    {p.list.slice(0, 5).map((d, i) => (
                                        <div key={d.name} className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-gray-400 w-3 text-right shrink-0">{i + 1}</span>
                                            <span className="flex-1 min-w-0 text-xs text-gray-800 truncate">{d.name}</span>
                                            <div className="w-14 h-1.5 bg-gray-100 rounded overflow-hidden shrink-0">
                                                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, d.rate)}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-indigo-700 w-9 text-right shrink-0">{d.rate}%</span>
                                        </div>
                                    ))}
                                    {p.list.length > 5 && <div className="text-[10px] text-gray-400 pl-4">ほか{p.list.length - 5}型</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                        この条件のデータがありません。期間や地域を変えてお試しください。
                    </div>
                )}

                <p className="mt-8 text-[11px] text-gray-400">
                    ※アーキタイプ分類はシティリーグ結果と同じ基準（入賞デッキの代表カード）。重複デッキコードは1回として集計しています。
                </p>
            </div>
        </div>
    )
}
