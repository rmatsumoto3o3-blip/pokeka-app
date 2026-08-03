import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import ReferenceDeckList from '@/components/ReferenceDeckList'

export const metadata: Metadata = {
    title: '環境・優勝デッキ一覧 | PokéLix（ポケリス）',
    description: 'ジムバトル・シティリーグの優勝/入賞デッキレシピをアーキタイプ別に一覧。デッキコードのコピーやレシピ確認ができます。',
}

export const revalidate = 3600

export default function DecksPage() {
    return (
        <div className="min-h-screen bg-[#f4f6fa] flex flex-col">
            <PublicHeader />
            <main className="flex-grow max-w-[1080px] w-full mx-auto px-3 py-4">
                <div className="text-[11px] text-gray-400 mb-1">
                    <a href="/" className="text-blue-600">TOP</a> › 環境デッキ
                </div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1">環境・優勝デッキ一覧</h1>
                <p className="text-xs text-gray-500 mb-4">大会で結果を残したデッキをアーキタイプ別にまとめています。</p>
                <div className="bg-white border border-[#e2e8f0] rounded-lg p-2.5">
                    <ReferenceDeckList />
                </div>
            </main>
            <Footer />
        </div>
    )
}
