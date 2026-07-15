'use client'

import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { buildSearchConsoleReport, type SearchConsoleMetricRow, type SearchConsoleReport } from '@/lib/searchConsoleReport'

const number = new Intl.NumberFormat('ja-JP')

export default function SearchConsoleSeoReport() {
    const [report, setReport] = useState<SearchConsoleReport | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function loadFiles(fileList: FileList | null) {
        if (!fileList?.length) return
        setLoading(true)
        setError('')
        try {
            const inputs = await Promise.all(Array.from(fileList).map(async file => ({ name: file.name, text: await file.text() })))
            const next = buildSearchConsoleReport(inputs)
            if (!next.queries.length && !next.pages.length && !next.trend.length) throw new Error('検索パフォーマンスの指標列を読み取れませんでした。CSVの種類とヘッダーを確認してください。')
            setReport(next)
        } catch (caught) {
            setReport(null)
            setError(caught instanceof Error ? caught.message : 'CSVの読み込みに失敗しました。')
        } finally {
            setLoading(false)
        }
    }

    function loadDemo() {
        const trendRows = Array.from({ length: 12 }, (_, index) => `2026-07-${String(index + 1).padStart(2, '0')},${12 + index},${260 + index * 24},${(4.6 + index * 0.08).toFixed(2)}%,${(9.8 - index * 0.18).toFixed(2)}`).join('\n')
        setError('')
        setReport(buildSearchConsoleReport([
            { name: 'クエリ.csv', text: '上位のクエリ,クリック数,表示回数,CTR,掲載順位\nポケカ 一人回し,82,980,8.37%,3.8\nポケカ 確率 シミュレーター,28,1100,2.55%,11.4\nポケカ シュミレーター,6,520,1.15%,12.2\nデッキ 作り方,18,190,9.47%,8.9' },
            { name: 'ページ.csv', text: '上位のページ,クリック数,表示回数,CTR,掲載順位\nhttps://pokelix.jp/practice,96,1400,6.86%,4.1\nhttps://pokelix.jp/simulator,31,1280,2.42%,11.6\nhttps://pokelix.jp/,22,900,2.44%,9.8' },
            { name: 'デバイス.csv', text: 'デバイス,クリック数,表示回数,CTR,掲載順位\nモバイル,118,2700,4.37%,8.4\nパソコン,31,720,4.31%,7.8' },
            { name: '国.csv', text: '国,クリック数,表示回数,CTR,掲載順位\n日本,143,3300,4.33%,8.1\nアメリカ合衆国,6,120,5%,9.2' },
            { name: '平均読み込み時間のチャート.csv', text: `期間,クリック数,表示回数,CTR,掲載順位\n${trendRows}` },
        ]))
    }

    return <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div><h2 className="text-xl font-bold text-gray-900">Search Console CSVを読み込む</h2><p className="mt-1 text-sm text-gray-500">クエリ・ページ・デバイス・国・日次チャート・フィルタCSVをまとめて選択してください。日本語・英語ヘッダーに対応しています。</p></div>
                <div className="flex gap-2"><button type="button" onClick={loadDemo} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-slate-50">サンプルで試す</button><label className="cursor-pointer rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"><input type="file" accept=".csv,text/csv" multiple className="hidden" onChange={event => loadFiles(event.target.files)} />{loading ? '解析中…' : 'CSVを選択'}</label></div>
            </div>
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-800"><strong>外部送信なし：</strong>CSVはブラウザ内だけで解析され、Supabase、Vercel API、その他の外部サービスにはアップロードされません。</div>
            {error && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </section>

        {report && <Report report={report} />}
    </div>
}

function Report({ report }: { report: SearchConsoleReport }) {
    const strongestPage = report.topPages[0]
    const mainOpportunity = report.highImpressionLowCtr[0] || report.nearFirstPage[0]
    return <article className="space-y-6">
        <header className="rounded-2xl bg-slate-950 px-6 py-7 text-white"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">PokéLix SEO</div><h1 className="mt-2 text-3xl font-bold">検索パフォーマンス改善レポート</h1><p className="mt-2 text-sm text-slate-300">{report.summary.period} · {report.loadedFiles.length} files</p></header>

        <ReportSection title="Executive Summary">
            <ul className="space-y-2 text-sm leading-relaxed text-gray-700">
                <li><strong>検索流入の現在地：</strong>{number.format(report.summary.clicks)}クリック、{number.format(report.summary.impressions)}表示、CTR {report.summary.ctr.toFixed(2)}%です。</li>
                {strongestPage && <li><strong>主力ページ：</strong><span className="break-all">{shortPage(strongestPage.label)}</span> が最多の{number.format(strongestPage.clicks)}クリックを獲得しています。</li>}
                {mainOpportunity && <li><strong>優先改善候補：</strong>「{mainOpportunity.label}」は{number.format(mainOpportunity.impressions)}表示あり、CTR {mainOpportunity.ctr.toFixed(2)}%・平均順位 {mainOpportunity.position.toFixed(1)}です。</li>}
                <li><strong>次の一手：</strong>高表示・低CTRの検索語からタイトルとディスクリプションを改善し、平均8〜20位の検索語は対応ページの内容を補強します。</li>
            </ul>
        </ReportSection>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="クリック" value={number.format(report.summary.clicks)} />
            <Metric label="表示回数" value={number.format(report.summary.impressions)} />
            <Metric label="平均CTR" value={`${report.summary.ctr.toFixed(2)}%`} />
            <Metric label="平均掲載順位" value={report.summary.position.toFixed(2)} />
        </div>

        <ReportSection title="検索流入の日次推移">
            <p className="mb-4 text-sm leading-relaxed text-gray-600">クリックと表示回数の動きを同じ期間で確認します。表示が伸びているのにクリックが追いつかない期間は、検索結果上の見せ方を優先して見直します。</p>
            {report.trend.length >= 2 ? <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={report.trend} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="label" tick={{ fontSize: 10 }} minTickGap={28} /><YAxis yAxisId="clicks" tick={{ fontSize: 10 }} /><YAxis yAxisId="impressions" orientation="right" tick={{ fontSize: 10 }} /><Tooltip /><Legend /><Line yAxisId="clicks" type="monotone" dataKey="clicks" name="クリック" stroke="#2563eb" strokeWidth={2.5} dot={false} /><Line yAxisId="impressions" type="monotone" dataKey="impressions" name="表示回数" stroke="#f59e0b" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div> : <Empty text="日次チャートCSVを追加すると推移を表示できます。" />}
        </ReportSection>

        <ReportSection title="主要流入クエリ">
            <p className="mb-4 text-sm text-gray-600">クリック上位の検索語です。現在の流入を支えているテーマを、関連記事や内部リンクでも明確に扱います。</p>
            <MetricTable rows={report.topQueries} />
        </ReportSection>

        <ReportSection title="クリック改善の優先候補">
            <InsightBlock title="表示が多いのにCTRが低い" description="タイトル・ディスクリプションと検索意図の一致を確認する候補です。" rows={report.highImpressionLowCtr} />
            <InsightBlock title="あと少しで1ページ目" description="平均順位8〜20位で、本文の具体性・内部リンク・見出しを強化する候補です。" rows={report.nearFirstPage} />
            <InsightBlock title="反応は良いが露出が少ない" description="CTRは高いものの表示が少なく、関連語や派生コンテンツを増やす候補です。" rows={report.highCtrLowExposure} />
        </ReportSection>

        <ReportSection title="ページ別の稼ぎ頭と伸びしろ">
            <div className="grid gap-5 lg:grid-cols-2"><div><h3 className="mb-2 text-sm font-bold text-gray-800">クリック上位</h3><MetricTable rows={report.topPages} compact /></div><div><h3 className="mb-2 text-sm font-bold text-gray-800">表示機会がある改善候補</h3><MetricTable rows={report.pageOpportunities} compact /></div></div>
        </ReportSection>

        <ReportSection title="デバイス・国別の傾向">
            <p className="mb-4 text-sm text-gray-600">利用環境ごとの差を確認し、主力デバイスの表示品質と主要地域の検索意図を優先します。</p>
            <div className="grid gap-5 lg:grid-cols-2"><div><h3 className="mb-2 text-sm font-bold text-gray-800">デバイス</h3><MetricTable rows={report.devices} compact /></div><div><h3 className="mb-2 text-sm font-bold text-gray-800">国</h3><MetricTable rows={report.countries} compact /></div></div>
        </ReportSection>

        <ReportSection title="表記ゆれ・誤字クエリ">
            <p className="mb-4 text-sm text-gray-600">「シュミレーター」など、実際に検索される表記を確認します。本文へ不自然に詰め込まず、FAQや自然な補足文で取り込みます。</p>
            <MetricTable rows={report.typoQueries} compact />
        </ReportSection>

        <ReportSection title="推奨する次の対応">
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-700"><li>高表示・低CTR候補の上位3件について、対応ページのtitleとdescriptionを検索意図に合わせて修正する。</li><li>平均順位8〜20位の上位候補へ、具体例・FAQ・関連ページへの内部リンクを追加する。</li><li>主力ページから伸びしろページへ、文脈のある内部リンクを追加する。</li><li>変更日を記録し、次回CSVでクリック・CTR・順位を同じ期間幅で比較する。</li></ol>
        </ReportSection>

        <ReportSection title="次回確認したいこと">
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700"><li>改善前後で同じ検索語のCTRが上昇したか。</li><li>平均順位8〜20位の候補が10位以内へ入ったか。</li><li>モバイルの表示回数に対してCTRが低くないか。</li></ul>
        </ReportSection>

        <ReportSection title="前提と注意点">
            <ul className="space-y-2 text-xs leading-relaxed text-gray-500"><li>合計値の基準：{report.summary.basis}。平均掲載順位は表示回数で加重しています。</li>{report.warnings.map(warning => <li key={warning}>・{warning}</li>)}<li>CSVの行数制限やSearch Console側の匿名化により、合計と明細の合算が一致しない場合があります。</li></ul>
        </ReportSection>
    </article>
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>{children}</section> }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-xs font-semibold text-gray-500">{label}</div><div className="mt-2 text-2xl font-bold text-gray-900">{value}</div></div> }
function Empty({ text }: { text: string }) { return <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-gray-400">{text}</div> }

function InsightBlock({ title, description, rows }: { title: string; description: string; rows: SearchConsoleMetricRow[] }) {
    return <div className="mb-6 last:mb-0"><h3 className="text-base font-bold text-gray-800">{title}</h3><p className="mb-3 mt-1 text-xs text-gray-500">{description}</p><MetricTable rows={rows} compact /></div>
}

function MetricTable({ rows, compact = false }: { rows: SearchConsoleMetricRow[]; compact?: boolean }) {
    if (!rows.length) return <Empty text="該当データはありません。" />
    return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="border-b border-slate-200 text-gray-500"><th className="px-2 py-2 font-semibold">項目</th><th className="px-2 py-2 text-right font-semibold">クリック</th><th className="px-2 py-2 text-right font-semibold">表示</th><th className="px-2 py-2 text-right font-semibold">CTR</th><th className="px-2 py-2 text-right font-semibold">順位</th></tr></thead><tbody>{rows.slice(0, compact ? 6 : 10).map(row => <tr key={`${row.label}-${row.clicks}-${row.impressions}`} className="border-b border-slate-100 last:border-0"><td className="max-w-[360px] break-all px-2 py-2.5 font-medium text-gray-800">{shortPage(row.label)}</td><td className="px-2 py-2.5 text-right text-gray-600">{number.format(row.clicks)}</td><td className="px-2 py-2.5 text-right text-gray-600">{number.format(row.impressions)}</td><td className="px-2 py-2.5 text-right text-gray-600">{row.ctr.toFixed(2)}%</td><td className="px-2 py-2.5 text-right text-gray-600">{row.position.toFixed(1)}</td></tr>)}</tbody></table></div>
}

function shortPage(value: string) {
    try { const url = new URL(value); return `${url.pathname}${url.search}` || '/' } catch { return value }
}
