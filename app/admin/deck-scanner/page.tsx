import DeckScanner from '@/components/DeckScanner'

export const metadata = { title: 'デッキ写真読み取り | 管理', robots: { index: false, follow: false } }

export default function DeckScannerPage() {
    return (
        <div className="px-4">
            <h2 className="mb-1 text-xl font-bold text-gray-900">デッキ写真読み取り</h2>
            <p className="mb-5 text-sm text-gray-600">デッキを並べた写真から、カード名・枚数を読み取ってデッキリスト化し、そのまま一人回しで使えます。</p>
            <DeckScanner />
        </div>
    )
}
