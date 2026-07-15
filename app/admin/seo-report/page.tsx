import SearchConsoleSeoReport from '@/components/SearchConsoleSeoReport'

export const dynamic = 'force-dynamic'

export default function SeoReportPage() {
    return <div className="space-y-6 px-4 sm:px-0"><div><h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">SEO CSVレポート</h2><p className="mt-1 text-sm text-gray-500">Google Search Consoleの検索パフォーマンスCSVを端末内で集計します。</p></div><SearchConsoleSeoReport /></div>
}
