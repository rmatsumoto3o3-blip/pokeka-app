'use client'

import { useState, useEffect } from 'react'
import { getWeeklyReportAction, type WeeklyReportData } from '@/app/actions'

function generateSNSText(data: WeeklyReportData): string {
    const lines: string[] = []
    lines.push(`週間環境レポート ${data.thisWeekRange.from}〜${data.thisWeekRange.to}`)
    lines.push('')

    if (data.topArchetypes.length > 0) {
        lines.push('今週の優勝・準優勝')
        data.topArchetypes.slice(0, 5).forEach((a, i) => {
            const detail = a.wins > 0 && a.runnerUps > 0
                ? `優勝${a.wins} 準優勝${a.runnerUps}`
                : a.wins > 0 ? `優勝${a.wins}回` : `準優勝${a.runnerUps}回`
            lines.push(`${i + 1}. ${a.name}（${detail}）`)
        })
        lines.push('')
    }

    const growing = data.archetypes.filter(a => a.growth > 0).slice(0, 3)
    if (growing.length > 0) {
        lines.push('先週比で伸びたデッキ')
        growing.forEach(a => {
            const rate = a.growthRate !== null ? ` +${a.growthRate}%` : ' NEW'
            lines.push(`${a.name} +${a.growth}回${rate}`)
        })
        lines.push('')
    }

    const notable = data.featuredCards.filter(c => c.diff !== 0).slice(0, 3)
    if (notable.length > 0) {
        lines.push('注目カード採用率')
        notable.forEach(c => {
            const sign = c.diff > 0 ? `+${c.diff}` : `${c.diff}`
            lines.push(`${c.card_name} ${c.thisWeekAvg}%（${sign}pt）`)
        })
        lines.push('')
    }

    lines.push('#ポケカ #ポケモンカード #環境分析 #PokeLix')
    return lines.join('\n')
}

export default function WeeklyReportPage() {
    const [data, setData] = useState<WeeklyReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        getWeeklyReportAction().then(res => {
            if (res.success && res.data) setData(res.data)
            else setError(res.error || '取得失敗')
            setLoading(false)
        })
    }, [])

    const handleCopy = () => {
        if (!data) return
        navigator.clipboard.writeText(generateSNSText(data))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
            集計中...
        </div>
    )
    if (error) return (
        <div className="min-h-screen flex items-center justify-center text-red-500 text-sm">
            {error}
        </div>
    )
    if (!data) return null

    return (
        <div className="min-h-screen bg-white text-gray-900">

            {/* ヘッダー */}
            <div className="border-b border-gray-200 px-8 py-6">
                <div className="max-w-3xl mx-auto flex items-end justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-1">Weekly Report</p>
                        <h1 className="text-2xl font-bold tracking-tight">週間環境レポート</h1>
                    </div>
                    <p className="text-sm text-gray-400">
                        {data.thisWeekRange.from} — {data.thisWeekRange.to}
                        <span className="ml-3 text-gray-300">|</span>
                        <span className="ml-3">優勝・準優勝 {data.totalDecksThisWeek}件</span>
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-8 py-10 space-y-12">

                {/* 今週の優勝ランキング */}
                <section>
                    <h2 className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">
                        今週の優勝・準優勝
                    </h2>
                    {data.topArchetypes.length === 0 ? (
                        <p className="text-sm text-gray-300">今週のデータがまだありません</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {data.topArchetypes.map((a, i) => (
                                <div key={a.archetype_id} className="flex items-center gap-5 py-3">
                                    <span className="text-sm font-mono text-gray-300 w-5 text-right">{i + 1}</span>
                                    <span className="flex-1 font-semibold text-gray-900">{a.name}</span>
                                    <div className="flex gap-2 text-xs">
                                        {a.wins > 0 && (
                                            <span className="border border-gray-900 text-gray-900 px-2 py-0.5 font-medium">
                                                優勝 {a.wins}
                                            </span>
                                        )}
                                        {a.runnerUps > 0 && (
                                            <span className="border border-gray-300 text-gray-500 px-2 py-0.5 font-medium">
                                                準優勝 {a.runnerUps}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* 先週比 */}
                <section>
                    <h2 className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">
                        先週比の伸び
                        <span className="ml-3 normal-case font-normal text-gray-300">
                            {data.lastWeekRange.from} — {data.lastWeekRange.to} 比較
                        </span>
                    </h2>
                    {data.archetypes.length === 0 ? (
                        <p className="text-sm text-gray-300">先週比データがありません</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100">
                                    <th className="text-left py-2 font-medium">アーキタイプ</th>
                                    <th className="text-right py-2 font-medium">今週</th>
                                    <th className="text-right py-2 font-medium">先週</th>
                                    <th className="text-right py-2 font-medium">増加</th>
                                    <th className="text-right py-2 font-medium">伸び率</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.archetypes.map(a => (
                                    <tr key={a.archetype_id}>
                                        <td className="py-3 font-medium">{a.name}</td>
                                        <td className="py-3 text-right font-bold">{a.thisWeek}</td>
                                        <td className="py-3 text-right text-gray-400">{a.lastWeek}</td>
                                        <td className="py-3 text-right text-gray-900">+{a.growth}</td>
                                        <td className="py-3 text-right">
                                            {a.growthRate !== null ? (
                                                <span className="text-xs font-medium text-gray-500">+{a.growthRate}%</span>
                                            ) : (
                                                <span className="text-xs font-medium text-gray-400">NEW</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* 注目カード */}
                {data.featuredCards.length > 0 && (
                    <section>
                        <h2 className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">
                            注目カード採用率
                            <span className="ml-3 normal-case font-normal text-gray-300">今週平均 vs 先週平均</span>
                        </h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100">
                                    <th className="text-left py-2 font-medium">カード名</th>
                                    <th className="text-right py-2 font-medium">今週</th>
                                    <th className="text-right py-2 font-medium">先週</th>
                                    <th className="text-right py-2 font-medium">変化</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.featuredCards.map(c => (
                                    <tr key={c.card_name}>
                                        <td className="py-3 font-medium">{c.card_name}</td>
                                        <td className="py-3 text-right font-bold">{c.thisWeekAvg}%</td>
                                        <td className="py-3 text-right text-gray-400">{c.lastWeekAvg}%</td>
                                        <td className="py-3 text-right text-sm font-medium">
                                            {c.diff > 0 ? (
                                                <span className="text-gray-900">+{c.diff}pt</span>
                                            ) : c.diff < 0 ? (
                                                <span className="text-gray-400">{c.diff}pt</span>
                                            ) : (
                                                <span className="text-gray-300">±0</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* SNS投稿文 */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
                            投稿テキスト
                        </h2>
                        <button
                            onClick={handleCopy}
                            className={`text-xs font-medium px-3 py-1.5 border transition-colors ${
                                copied
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                            }`}
                        >
                            {copied ? 'コピーしました' : 'テキストをコピー'}
                        </button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed bg-gray-50 p-5 border border-gray-100 font-sans">
                        {generateSNSText(data)}
                    </pre>
                </section>

                <p className="text-xs text-gray-300 text-center pb-4">
                    PokeLix · データ更新: 毎朝自動集計
                </p>
            </div>
        </div>
    )
}
