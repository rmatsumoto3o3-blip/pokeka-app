export type SearchConsoleDimension = 'queries' | 'pages' | 'devices' | 'countries' | 'trend' | 'filters' | 'unknown'

export interface SearchConsoleMetricRow {
    label: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

export interface SearchConsoleFileInput {
    name: string
    text: string
}

export interface SearchConsoleReport {
    summary: { clicks: number; impressions: number; ctr: number; position: number; period: string; basis: string }
    queries: SearchConsoleMetricRow[]
    pages: SearchConsoleMetricRow[]
    devices: SearchConsoleMetricRow[]
    countries: SearchConsoleMetricRow[]
    trend: SearchConsoleMetricRow[]
    topQueries: SearchConsoleMetricRow[]
    highImpressionLowCtr: SearchConsoleMetricRow[]
    nearFirstPage: SearchConsoleMetricRow[]
    highCtrLowExposure: SearchConsoleMetricRow[]
    topPages: SearchConsoleMetricRow[]
    pageOpportunities: SearchConsoleMetricRow[]
    typoQueries: SearchConsoleMetricRow[]
    warnings: string[]
    loadedFiles: string[]
}

const HEADER_ALIASES = {
    clicks: ['クリック数', 'Clicks'],
    impressions: ['表示回数', 'Impressions'],
    ctr: ['CTR'],
    position: ['掲載順位', 'Position'],
    queries: ['上位のクエリ', 'クエリ', 'Top queries', 'Query'],
    pages: ['上位のページ', 'ページ', 'Top pages', 'Page'],
    devices: ['デバイス', 'Device'],
    countries: ['国', 'Country'],
    trend: ['期間', '日付', 'Date'],
}

function normalize(value: string) {
    return value.replace(/^\uFEFF/, '').trim().toLowerCase()
}

function findHeaderIndex(headers: string[], aliases: string[]) {
    const normalized = headers.map(normalize)
    return aliases.map(normalize).map(alias => normalized.indexOf(alias)).find(index => index >= 0) ?? -1
}

function parseNumber(value: string | undefined) {
    if (!value) return 0
    const parsed = Number.parseFloat(value.replace(/[,%\s]/g, ''))
    return Number.isFinite(parsed) ? parsed : 0
}

export function parseCsv(text: string): string[][] {
    const input = text.replace(/^\uFEFF/, '')
    const rows: string[][] = []
    let row: string[] = []
    let cell = ''
    let quoted = false

    for (let index = 0; index < input.length; index += 1) {
        const character = input[index]
        if (character === '"') {
            if (quoted && input[index + 1] === '"') {
                cell += '"'
                index += 1
            } else {
                quoted = !quoted
            }
        } else if (character === ',' && !quoted) {
            row.push(cell.trim())
            cell = ''
        } else if ((character === '\n' || character === '\r') && !quoted) {
            if (character === '\r' && input[index + 1] === '\n') index += 1
            row.push(cell.trim())
            if (row.some(value => value.length > 0)) rows.push(row)
            row = []
            cell = ''
        } else {
            cell += character
        }
    }
    row.push(cell.trim())
    if (row.some(value => value.length > 0)) rows.push(row)
    return rows
}

function detectDimension(fileName: string, headers: string[]): SearchConsoleDimension {
    const name = normalize(fileName)
    if (/クエリ|quer/.test(name)) return 'queries'
    if (/ページ|page/.test(name)) return 'pages'
    if (/デバイス|device/.test(name)) return 'devices'
    if (/^国|country|countries/.test(name)) return 'countries'
    if (/フィルタ|filter/.test(name)) return 'filters'
    if (/チャート|chart|日付|date/.test(name)) return 'trend'
    for (const dimension of ['queries', 'pages', 'devices', 'countries', 'trend'] as const) {
        if (findHeaderIndex(headers, HEADER_ALIASES[dimension]) >= 0) return dimension
    }
    return 'unknown'
}

function metricRows(rows: string[][], dimension: Exclude<SearchConsoleDimension, 'filters' | 'unknown'>) {
    const headers = rows[0] || []
    const labelIndex = findHeaderIndex(headers, HEADER_ALIASES[dimension])
    const clicksIndex = findHeaderIndex(headers, HEADER_ALIASES.clicks)
    const impressionsIndex = findHeaderIndex(headers, HEADER_ALIASES.impressions)
    const ctrIndex = findHeaderIndex(headers, HEADER_ALIASES.ctr)
    const positionIndex = findHeaderIndex(headers, HEADER_ALIASES.position)
    if ([labelIndex, clicksIndex, impressionsIndex, ctrIndex, positionIndex].some(index => index < 0)) return []

    return rows.slice(1).map(row => ({
        label: row[labelIndex] || '',
        clicks: parseNumber(row[clicksIndex]),
        impressions: parseNumber(row[impressionsIndex]),
        ctr: parseNumber(row[ctrIndex]),
        position: parseNumber(row[positionIndex]),
    })).filter(row => row.label)
}

function weightedPosition(rows: SearchConsoleMetricRow[]) {
    const weight = rows.reduce((total, row) => total + row.impressions, 0)
    return weight > 0 ? rows.reduce((total, row) => total + row.position * row.impressions, 0) / weight : 0
}

function median(values: number[]) {
    if (!values.length) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function topBy(rows: SearchConsoleMetricRow[], key: 'clicks' | 'impressions', limit = 10) {
    return [...rows].sort((a, b) => b[key] - a[key]).slice(0, limit)
}

export function buildSearchConsoleReport(files: SearchConsoleFileInput[]): SearchConsoleReport {
    const datasets: Record<Exclude<SearchConsoleDimension, 'filters' | 'unknown'>, SearchConsoleMetricRow[]> = { queries: [], pages: [], devices: [], countries: [], trend: [] }
    const warnings: string[] = []
    let filterPeriod = ''

    files.forEach(file => {
        const rows = parseCsv(file.text)
        const dimension = detectDimension(file.name, rows[0] || [])
        if (dimension === 'unknown') {
            warnings.push(`${file.name}: 対応する列を判定できなかったため除外しました。`)
        } else if (dimension === 'filters') {
            const dateRow = rows.find(row => row.some(cell => /日付|date/i.test(cell)))
            filterPeriod = dateRow?.slice(1).filter(Boolean).join(' ') || filterPeriod
        } else {
            const parsed = metricRows(rows, dimension)
            if (!parsed.length) warnings.push(`${file.name}: 必要な指標列を読み取れませんでした。`)
            datasets[dimension].push(...parsed)
        }
    })

    const basisRows = datasets.trend.length ? datasets.trend : datasets.queries
    const clicks = basisRows.reduce((total, row) => total + row.clicks, 0)
    const impressions = basisRows.reduce((total, row) => total + row.impressions, 0)
    const ctr = impressions > 0 ? clicks / impressions * 100 : 0
    const position = weightedPosition(basisRows)
    const trendLabels = datasets.trend.map(row => row.label)
    const period = filterPeriod || (trendLabels.length ? `${trendLabels[0]}〜${trendLabels[trendLabels.length - 1]}` : 'CSV内に期間情報なし')
    const queryMedianImpressions = median(datasets.queries.map(row => row.impressions))
    const highVolumeThreshold = Math.max(100, median(datasets.queries.map(row => row.impressions).filter(value => value >= queryMedianImpressions)))
    const lowCtrThreshold = Math.max(1, ctr * 0.75)
    const highCtrThreshold = Math.max(5, ctr * 1.25)

    const highImpressionLowCtr = datasets.queries.filter(row => row.impressions >= highVolumeThreshold && row.ctr < lowCtrThreshold).sort((a, b) => b.impressions - a.impressions).slice(0, 10)
    const nearFirstPage = datasets.queries.filter(row => row.position >= 8 && row.position <= 20 && row.impressions >= queryMedianImpressions).sort((a, b) => b.impressions - a.impressions).slice(0, 10)
    const highCtrLowExposure = datasets.queries.filter(row => row.clicks > 0 && row.ctr >= highCtrThreshold && row.impressions <= queryMedianImpressions).sort((a, b) => b.ctr - a.ctr).slice(0, 10)
    const pageMedianImpressions = median(datasets.pages.map(row => row.impressions))
    const pageOpportunities = datasets.pages.filter(row => row.impressions >= pageMedianImpressions && (row.ctr < lowCtrThreshold || row.position > 10)).sort((a, b) => b.impressions - a.impressions).slice(0, 10)
    const typoPattern = /シュミレー|しゅみれー|simulater|simlator|pokelixx|pokelics/i
    const typoQueries = datasets.queries.filter(row => typoPattern.test(row.label)).sort((a, b) => b.impressions - a.impressions)

    if (!datasets.trend.length) warnings.push('日次チャートCSVがないため、合計値はクエリCSVの掲載行を基準にしています。Search Console全体値と一致しない場合があります。')
    if (!datasets.queries.length) warnings.push('クエリCSVがないため、検索語の改善候補を算出できません。')
    if (!datasets.pages.length) warnings.push('ページCSVがないため、ページ別の稼ぎ頭・伸びしろを算出できません。')

    return {
        summary: { clicks, impressions, ctr, position, period, basis: datasets.trend.length ? '日次チャートCSV' : 'クエリCSV掲載行' },
        ...datasets,
        topQueries: topBy(datasets.queries, 'clicks'),
        highImpressionLowCtr,
        nearFirstPage,
        highCtrLowExposure,
        topPages: topBy(datasets.pages, 'clicks'),
        pageOpportunities,
        typoQueries,
        warnings,
        loadedFiles: files.map(file => file.name),
    }
}
