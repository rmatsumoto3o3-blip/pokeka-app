'use client'

import { useState, useEffect } from 'react'
import { getWeeklyReportAction, type WeeklyReportData } from '@/app/actions'

export default function WeeklyReport() {
    const [data, setData] = useState<WeeklyReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getWeeklyReportAction().then(res => {
            if (res.success && res.data) setData(res.data)
            else setError(res.error || '取得失敗')
            setLoading(false)
        })
    }, [])

    if (loading) return <div className="text-gray-500 py-8 text-center">集計中...</div>
    if (error) return <div className="text-red-500 py-8 text-center">{error}</div>
    if (!data) return null

    return (
        <div className="space-y-8">
            {/* アーキタイプ伸び率 */}
            <section>
                <h3 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3 mb-4">
                    優勝/準優勝 増加デッキ
                    <span className="ml-2 text-sm font-normal text-gray-500">
                        今週 {data.thisWeekRange.from}〜{data.thisWeekRange.to} vs 先週 {data.lastWeekRange.from}〜{data.lastWeekRange.to}
                    </span>
                </h3>

                {data.archetypes.length === 0 ? (
                    <p className="text-gray-400 text-sm">該当データなし（deck_recordsにデータが溜まると表示されます）</p>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">アーキタイプ</th>
                                    <th className="px-4 py-3 text-center">今週</th>
                                    <th className="px-4 py-3 text-center">先週</th>
                                    <th className="px-4 py-3 text-center">増加数</th>
                                    <th className="px-4 py-3 text-center">伸び率</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.archetypes.map(a => (
                                    <tr key={a.archetype_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-bold text-gray-800">{a.name}</td>
                                        <td className="px-4 py-3 text-center font-bold text-indigo-600">{a.thisWeek}</td>
                                        <td className="px-4 py-3 text-center text-gray-500">{a.lastWeek}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-green-600 font-bold">+{a.growth}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
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

            {/* 注目カード採用率変化 */}
            <section>
                <h3 className="text-lg font-bold text-gray-800 border-l-4 border-yellow-400 pl-3 mb-4">
                    注目カード 採用率変化
                    <span className="ml-2 text-sm font-normal text-gray-500">
                        今週平均 vs 先週平均
                    </span>
                </h3>

                {data.featuredCards.length === 0 ? (
                    <p className="text-gray-400 text-sm">注目カードのスナップショットデータがありません（管理画面で「集計＆更新を実行」を押してください）</p>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">カード名</th>
                                    <th className="px-4 py-3 text-center">今週平均</th>
                                    <th className="px-4 py-3 text-center">先週平均</th>
                                    <th className="px-4 py-3 text-center">変化</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.featuredCards.map(c => (
                                    <tr key={c.card_name} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-bold text-gray-800">{c.card_name}</td>
                                        <td className="px-4 py-3 text-center font-bold text-indigo-600">{c.thisWeekAvg}%</td>
                                        <td className="px-4 py-3 text-center text-gray-500">{c.lastWeekAvg}%</td>
                                        <td className="px-4 py-3 text-center">
                                            {c.diff > 0 ? (
                                                <span className="text-green-600 font-bold">+{c.diff}%</span>
                                            ) : c.diff < 0 ? (
                                                <span className="text-red-500 font-bold">{c.diff}%</span>
                                            ) : (
                                                <span className="text-gray-400">±0%</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}
