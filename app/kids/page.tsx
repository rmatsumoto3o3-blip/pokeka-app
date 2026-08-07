import type { Metadata } from 'next'
import MathLearningTool from '@/components/MathLearningTool'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'

export const metadata: Metadata = {
    title: 'ポケカで算数 | 子ども向け計算学習 | PokéLix（ポケリス）',
    description: 'ポケモンカードを使って楽しく算数（たし算・ひき算・かけ算）を学べる無料の学習ツール。お子さんの計算練習に。',
    keywords: ['ポケカ 算数', 'ポケモンカード 算数', '子ども 計算 学習', 'ポケカ 勉強'],
    alternates: { canonical: 'https://www.pokelix.jp/kids' },
    openGraph: {
        title: 'ポケカで算数 | PokéLix（ポケリス）',
        description: 'ポケモンカードで楽しく算数を学べる無料ツール。',
        url: 'https://www.pokelix.jp/kids',
    },
}

export default function KidsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100">
            <PublicHeader />
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-orange-600 mb-4 drop-shadow-sm">
                        ポケカで算数
                    </h1>
                </div>

                <div className="relative">
                    {/* 装飾用の浮遊物 */}
                    <div className="absolute -top-10 -left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-20 blur-xl animate-pulse" />
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-300 rounded-full opacity-20 blur-xl animate-pulse" />
                    
                    <MathLearningTool />
                </div>

                <div className="mt-16 text-center">
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-orange-600 font-black hover:text-orange-700 transition group"
                    >
                        トップページに もどる
                    </Link>
                </div>
            </div>
        </main>
    )
}
