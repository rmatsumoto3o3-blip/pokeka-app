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
            lines.push(`${i + 1}. ${a.name}　優勝${a.wins} / 準優勝${a.runnerUps}`)
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
        <div className="min-h-screen flex items-center justify-center text-gray-400">
            集計中...
        </div>
    )
    if (error) return (
        <div className="min-h-screen flex items-center justify-center text-red-500">
            {error}
        </div>
    )
    if (!data) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* ヘッダー */}
                <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-indigo-500 tracking-widest uppercase">Weekly Report</p>
                    <h1 className="text-3xl font-extrabold text-gray-900">週間環境レポート</h1>
                    <p className="text-gray-500 text-sm">
                        {data.thisWeekRange.from}〜{data.thisWeekRange.to}
                        <span className="mx-2 text-gray-300">|</span>
                        優勝・準優勝 計{data.totalDecksThisWeek}件
                    </p>
                </div>

                {/* 今週の優勝ランキング */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">今週の優勝・準優勝ランキング</h2>
                    </div>
                    {data.topArchetypes.length === 0 ? (
                        <p className="px-6 py-8 text-gray-400 text-sm text-center">今週のデータがまだありません</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-xs">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium w-8">#</th>
                                        <th className="px-2 py-3 text-left font-medium">アーキタイプ</th>
                                        <th className="px-6 py-3 text-center font-medium">優勝</th>
                                        <th className="px-6 py-3 text-center font-medium">準優勝</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.topArchetypes.map((a, i) => (
                                        <tr key={a.archetype_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-gray-300 font-mono text-xs">{i + 1}</td>
                                            <td className="px-2 py-3 font-bold text-gray-800">{a.name}</td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`font-bold ${a.wins > 0 ? 'text-yellow-600' : 'text-gray-200'}`}>
                                                    {a.wins}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`font-bold ${a.runnerUps > 0 ? 'text-gray-600' : 'text-gray-200'}`}>
                                                    {a.runnerUps}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* 先週比 */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800">先週比の伸び</h2>
                        <span className="text-xs text-gray-400">先週 {data.lastWeekRange.from}〜{data.lastWeekRange.to}</span>
                    </div>
                    {data.archetypes.length === 0 ? (
                        <p className="px-6 py-8 text-gray-400 text-sm text-center">先週比データがありません</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-xs">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">アーキタイプ</th>
                                        <th className="px-6 py-3 text-center font-medium">今週</th>
                                        <th className="px-6 py-3 text-center font-medium">先週</th>
                                        <th className="px-6 py-3 text-center font-medium">増加</th>
                                        <th className="px-6 py-3 text-center font-medium">伸び率</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.archetypes.map(a => (
                                        <tr key={a.archetype_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-bold text-gray-800">{a.name}</td>
                                            <td className="px-6 py-3 text-center font-bold text-indigo-600">{a.thisWeek}</td>
                                            <td className="px-6 py-3 text-center text-gray-400">{a.lastWeek}</td>
                                            <td className="px-6 py-3 text-center font-bold text-gray-800">+{a.growth}</td>
                                            <td className="px-6 py-3 text-center">
                                                {a.growthRate !== null ? (
                                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                                        +{a.growthRate}%
                                                    </span>
                                                ) : (
                                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                                        NEW
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* 注目カード */}
                {data.featuredCards.length > 0 && (
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800">注目カード採用率</h2>
                            <span className="text-xs text-gray-400">今週平均 vs 先週平均</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-xs">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium">カード名</th>
                                        <th className="px-6 py-3 text-center font-medium">今週</th>
                                        <th className="px-6 py-3 text-center font-medium">先週</th>
                                        <th className="px-6 py-3 text-center font-medium">変化</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.featuredCards.map(c => (
                                        <tr key={c.card_name} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-bold text-gray-800">{c.card_name}</td>
                                            <td className="px-6 py-3 text-center font-bold text-indigo-600">{c.thisWeekAvg}%</td>
                                            <td className="px-6 py-3 text-center text-gray-400">{c.lastWeekAvg}%</td>
                                            <td className="px-6 py-3 text-center font-medium">
                                                {c.diff > 0 ? (
                                                    <span className="text-green-600">+{c.diff}pt</span>
                                                ) : c.diff < 0 ? (
                                                    <span className="text-red-400">{c.diff}pt</span>
                                                ) : (
                                                    <span className="text-gray-300">±0</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* SNS投稿文 */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800">投稿テキスト</h2>
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                copied
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                            {copied ? 'コピーしました' : 'テキストをコピー'}
                        </button>
                    </div>
                    <pre className="px-6 py-5 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans bg-gray-50">
                        {generateSNSText(data)}
                    </pre>
                </section>

                <p className="text-center text-xs text-gray-300 pb-4">
                    PokeLix · データ更新: 毎朝自動集計
                </p>
            </div>
        </div>
    )
}
