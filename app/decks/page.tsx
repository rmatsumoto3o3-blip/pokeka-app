import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import ReferenceDeckList from '@/components/ReferenceDeckList'
import AdPlaceholder from '@/components/AdPlaceholder'

export const metadata: Metadata = {
    title: '環境・優勝デッキ一覧 | PokéLix（ポケリス）',
    description: 'ジムバトル・シティリーグの優勝/入賞デッキレシピをアーキタイプ別に一覧。デッキコードのコピーやレシピ確認ができます。',
    keywords: ['ポケカ 環境デッキ', 'ポケカ 優勝デッキ', 'ポケカ デッキレシピ', 'ポケカ 入賞デッキ', 'シティリーグ 優勝', 'ジムバトル 優勝'],
    alternates: { canonical: 'https://www.pokelix.jp/decks' },
    openGraph: {
        title: '環境・優勝デッキ一覧 | PokéLix（ポケリス）',
        description: '大会で結果を残したポケカのデッキをアーキタイプ別にまとめています。',
        url: 'https://www.pokelix.jp/decks',
    },
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
                {/* 本文下（FV外）の広告。固定枠でCLSを出さない */}
                <div className="mt-6">
                    <AdPlaceholder slot="2515406718" format="auto" />
                </div>
            </main>
            <Footer />
        </div>
    )
}
