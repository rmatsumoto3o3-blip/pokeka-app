'use client'

import { useState } from 'react'
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

export default function WeeklyReport() {
    const [data, setData] = useState<WeeklyReportData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // 期間指定（デフォルト: 直近7日）
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const [fromDate, setFromDate] = useState(weekAgo)
    const [toDate, setToDate] = useState(today)

    const handleGenerate = async () => {
        setLoading(true)
        setError(null)
        setData(null)
        const res = await getWeeklyReportAction(fromDate, toDate)
        if (res.success && res.data) setData(res.data)
        else setError(res.error || '取得失敗')
        setLoading(false)
    }

    const handleCopy = () => {
        if (!data) return
        navigator.clipboard.writeText(generateSNSText(data))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">

            {/* 期間指定 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4">期間を指定してレポート生成</h3>
                <div className="flex items-center gap-3 flex-wrap">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">開始日（今週）</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">終了日（今週）</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="pt-5">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-indigo-600 text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? '集計中...' : 'レポート生成'}
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    ※ 先週は指定した開始日から7日前〜開始日前日として自動計算されます
                </p>
            </div>

            {error && (
                <div className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl p-4">{error}</div>
            )}

            {!data && !loading && (
                <p className="text-gray-400 text-sm text-center py-8">期間を指定してレポートを生成してください</p>
            )}

            {data && (
                <div className="space-y-6">

                    {/* 優勝ランキング */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">優勝・準優勝ランキング</h3>
                            <span className="text-xs text-gray-400">{data.thisWeekRange.from}〜{data.thisWeekRange.to}　計{data.totalDecksThisWeek}件</span>
                        </div>
                        {data.topArchetypes.length === 0 ? (
                            <p className="px-6 py-6 text-gray-400 text-sm">該当データなし</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-xs">
                                    <tr>
                                        <th className="px-6 py-3 text-left w-8">#</th>
                                        <th className="px-2 py-3 text-left">アーキタイプ</th>
                                        <th className="px-6 py-3 text-center">優勝</th>
                                        <th className="px-6 py-3 text-center">準優勝</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.topArchetypes.map((a, i) => (
                                        <tr key={a.archetype_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-gray-300 font-mono text-xs">{i + 1}</td>
                                            <td className="px-2 py-3 font-bold text-gray-800">{a.name}</td>
                                            <td className="px-6 py-3 text-center font-bold text-yellow-600">{a.wins}</td>
                                            <td className="px-6 py-3 text-center font-bold text-gray-500">{a.runnerUps}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* 先週比 */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">先週比の伸び</h3>
                            <span className="text-xs text-gray-400">先週 {data.lastWeekRange.from}〜{data.lastWeekRange.to}</span>
                        </div>
                        {data.archetypes.length === 0 ? (
                            <p className="px-6 py-6 text-gray-400 text-sm">先週比データがありません</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-xs">
                                    <tr>
                                        <th className="px-6 py-3 text-left">アーキタイプ</th>
                                        <th className="px-6 py-3 text-center">今週</th>
                                        <th className="px-6 py-3 text-center">先週</th>
                                        <th className="px-6 py-3 text-center">増加</th>
                                        <th className="px-6 py-3 text-center">伸び率</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.archetypes.map(a => (
                                        <tr key={a.archetype_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-bold text-gray-800">{a.name}</td>
                                            <td className="px-6 py-3 text-center font-bold text-indigo-600">{a.thisWeek}</td>
                                            <td className="px-6 py-3 text-center text-gray-400">{a.lastWeek}</td>
                                            <td className="px-6 py-3 text-center font-bold">+{a.growth}</td>
                                            <td className="px-6 py-3 text-center">
                                                {a.growthRate !== null ? (
                                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">+{a.growthRate}%</span>
                                                ) : (
                                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">NEW</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* 注目カード */}
                    {data.featuredCards.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">注目カード採用率</h3>
                                <span className="text-xs text-gray-400">今週平均 vs 先週平均</span>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-xs">
                                    <tr>
                                        <th className="px-6 py-3 text-left">カード名</th>
                                        <th className="px-6 py-3 text-center">今週</th>
                                        <th className="px-6 py-3 text-center">先週</th>
                                        <th className="px-6 py-3 text-center">変化</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.featuredCards.map(c => (
                                        <tr key={c.card_name} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-bold text-gray-800">{c.card_name}</td>
                                            <td className="px-6 py-3 text-center font-bold text-indigo-600">{c.thisWeekAvg}%</td>
                                            <td className="px-6 py-3 text-center text-gray-400">{c.lastWeekAvg}%</td>
                                            <td className="px-6 py-3 text-center font-medium">
                                                {c.diff > 0 ? <span className="text-green-600">+{c.diff}pt</span>
                                                    : c.diff < 0 ? <span className="text-red-400">{c.diff}pt</span>
                                                    : <span className="text-gray-300">±0</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 投稿テキスト */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">投稿テキスト</h3>
                            <button
                                onClick={handleCopy}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    copied ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                {copied ? 'コピーしました' : 'テキストをコピー'}
                            </button>
                        </div>
                        <pre className="px-6 py-5 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans bg-gray-50">
                            {generateSNSText(data)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    )
}
