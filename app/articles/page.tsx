import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
    title: 'コラム・記事一覧 | PokéLix',
    description: 'ポケモンカードの環境考察、デッキ解説、初心者向けガイドなど、役立つ情報を発信しています。',
}

export default async function ArticlesPage() {
    const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

    if (error) {
        console.error('Error fetching articles:', error)
    }

    return (
        <div className="min-h-screen bg-white">
            <PublicHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        ポケモンカード戦略コラム
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        最新の環境考察から初心者向けガイドまで、<br className="hidden md:inline" />
                        あなたのポケカライフを充実させる情報をお届けします。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles?.map((article) => (
                        <Link
                            href={`/articles/${article.slug}`}
                            key={article.id}
                            className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-pink-200"
                        >
                            {article.thumbnail_url ? (
                                <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                                    <img
                                        src={article.thumbnail_url}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 text-4xl">
                                    📝
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-1 rounded-md">
                                        コラム
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                        {new Date(article.published_at || article.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                                    {article.title}
                                </h2>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                                    {article.excerpt}
                                </p>
                                <div className="text-pink-600 text-sm font-bold flex items-center mt-auto">
                                    続きを読む
                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {(!articles || articles.length === 0) && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl mt-8 border-2 border-dashed border-gray-200">
                        <div className="text-4xl mb-4">✍️</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">準備中</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">現在、最新の環境考察や攻略記事を執筆中です。公開まで今しばらくお待ちください！</p>
                    </div>
                )}


            </main>

            <Footer />
        </div>
    )
}
