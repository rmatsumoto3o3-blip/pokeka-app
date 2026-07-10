'use client'

import { useState, useRef } from 'react'
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
    if (data.featuredCards.length > 0) {
        lines.push('注目カード採用率')
        data.featuredCards.forEach(c => {
            const sign = c.diff > 0 ? `+${c.diff}` : c.diff < 0 ? `${c.diff}` : `±0`
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
    const [imageCopied, setImageCopied] = useState(false)
    const [imageLoading, setImageLoading] = useState(false)
    const reportCardRef = useRef<HTMLDivElement>(null)

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

    const handleCopyImage = async () => {
        if (!reportCardRef.current || !data) return
        setImageLoading(true)
        try {
            const html2canvas = (await import('html2canvas')).default
            const el = reportCardRef.current
            const canvas = await html2canvas(el, {
                backgroundColor: '#0f172a',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: el.offsetWidth,
                height: el.scrollHeight,
                windowWidth: el.offsetWidth,
                windowHeight: el.scrollHeight,
                onclone: (_doc, clonedEl) => {
                    clonedEl.style.overflow = 'visible'
                    clonedEl.style.borderRadius = '0'
                },
            })

            // toBlob を Promise 化
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((b) => {
                    if (b) resolve(b)
                    else reject(new Error('toBlob failed'))
                }, 'image/png')
            })

            // クリップボードへのコピーを試みる
            if (navigator.clipboard && 'write' in navigator.clipboard) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ])
                setImageCopied(true)
                setTimeout(() => setImageCopied(false), 2000)
            } else {
                // 非対応ブラウザはダウンロードにフォールバック
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `pokelix-report-${data.thisWeekRange.from}-${data.thisWeekRange.to}.png`
                a.click()
                URL.revokeObjectURL(url)
                setImageCopied(true)
                setTimeout(() => setImageCopied(false), 2000)
            }
        } catch (e: any) {
            console.error('画像コピーエラー:', e)
            alert(`画像のコピーに失敗しました\n${e?.message || e}`)
        } finally {
            setImageLoading(false)
        }
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

                    {/* 画像カード */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">投稿画像</h3>
                            <button
                                onClick={handleCopyImage}
                                disabled={imageLoading}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${
                                    imageCopied ? 'bg-green-100 text-green-700' : 'bg-slate-800 text-white hover:bg-slate-900'
                                }`}
                            >
                                {imageLoading ? '生成中...' : imageCopied ? 'コピーしました' : '画像をコピー'}
                            </button>
                        </div>
                        {/* Report Card (rendered for screenshot) */}
                        <div className="p-4 bg-gray-50 overflow-auto">
                            <div
                                ref={reportCardRef}
                                style={{
                                    width: '680px',
                                    backgroundColor: '#0f172a',
                                    color: '#fff',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    margin: '0 auto',
                                }}
                            >
                                {/* Header */}
                                <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #1e293b' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>PokeLix · 環境レポート</span>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{data.thisWeekRange.from}〜{data.thisWeekRange.to}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#475569' }}>優勝・準優勝 計{data.totalDecksThisWeek}件集計</div>
                                </div>

                                {/* Rankings */}
                                {data.topArchetypes.length > 0 && (
                                    <div style={{ padding: '16px 28px', borderBottom: '1px solid #1e293b' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>優勝・準優勝ランキング</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {data.topArchetypes.slice(0, 5).map((a, i) => (
                                                <div key={a.archetype_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '22px' }}>
                                                    <span style={{ fontSize: '11px', lineHeight: '22px', color: '#475569', width: '16px', fontFamily: 'monospace', display: 'block' }}>{i + 1}</span>
                                                    <span style={{ flex: 1, fontSize: '13px', lineHeight: '22px', fontWeight: 700, color: '#f1f5f9', display: 'block' }}>{a.name}</span>
                                                    <span style={{ fontSize: '11px', lineHeight: '22px', color: '#fbbf24', fontWeight: 700, display: 'block' }}>優勝 {a.wins}</span>
                                                    <span style={{ fontSize: '11px', lineHeight: '22px', color: '#94a3b8', fontWeight: 700, display: 'block' }}>準優勝 {a.runnerUps}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Growth — 集計期間の伸び */}
                                {data.archetypes.filter(a => a.growth > 0).length > 0 && (
                                    <div style={{ padding: '16px 28px', borderBottom: '1px solid #1e293b' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>集計期間の伸び</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {data.archetypes.filter(a => a.growth > 0).slice(0, 5).map(a => (
                                                <div key={a.archetype_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '22px' }}>
                                                    <span style={{ flex: 1, fontSize: '13px', lineHeight: '22px', fontWeight: 700, color: '#f1f5f9', display: 'block' }}>{a.name}</span>
                                                    <span style={{ fontSize: '11px', lineHeight: '22px', color: '#818cf8', fontWeight: 700, display: 'block' }}>{a.thisWeek}件</span>
                                                    <span style={{ fontSize: '11px', lineHeight: '22px', fontWeight: 700, color: '#34d399', display: 'block' }}>
                                                        +{a.growth} {a.growthRate !== null ? `(+${a.growthRate}%)` : '(NEW)'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Featured Cards — 2列グリッド、見切れなし */}
                                {data.featuredCards.length > 0 && (
                                    <div style={{ padding: '16px 28px', borderBottom: '1px solid #1e293b' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>注目カード採用率</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '24px', rowGap: '2px' }}>
                                            {data.featuredCards.slice(0, 10).map(c => (
                                                <div key={c.card_name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '24px', boxSizing: 'border-box' }}>
                                                    <span style={{ fontSize: '12px', lineHeight: '24px', color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, display: 'block' }}>{c.card_name}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, height: '24px' }}>
                                                        <span style={{ fontSize: '12px', lineHeight: '24px', fontWeight: 700, color: '#a5b4fc', display: 'block' }}>{c.thisWeekAvg}%</span>
                                                        <span style={{ fontSize: '10px', lineHeight: '24px', fontWeight: 700, color: c.diff > 0 ? '#34d399' : c.diff < 0 ? '#f87171' : '#475569', display: 'block' }}>
                                                            {c.diff > 0 ? `+${c.diff}` : c.diff < 0 ? `${c.diff}` : '±0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div style={{ padding: '12px 28px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '10px', color: '#334155' }}>pokelix.com</span>
                                    <span style={{ fontSize: '10px', color: '#334155' }}>#ポケカ #環境分析</span>
                                </div>
                            </div>
                        </div>
                    </div>

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
