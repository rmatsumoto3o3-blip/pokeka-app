import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const revalidate = 3600 // Revalidate every hour

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!article) {
        return {
            title: '記事が見つかりません',
        }
    }

    return {
        title: `${article.title} | PokéLix`,
        description: article.excerpt || article.title,
        openGraph: {
            images: article.thumbnail_url ? [article.thumbnail_url] : [],
        },
    }
}

export default async function ArticleDetailPage({ params }: Props) {
    const { slug } = await params
    const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (error || !article) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white">
            <PublicHeader />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="prose prose-lg prose-pink max-w-none">
                    {/* Header */}
                    <div className="mb-8 border-b border-gray-200 pb-8 text-center">
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <span className="text-sm font-semibold text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                                コラム
                            </span>
                            <span className="text-sm text-gray-500">
                                {new Date(article.published_at || article.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {article.title}
                        </h1>
                        {article.thumbnail_url && (
                            <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
                                <img
                                    src={article.thumbnail_url}
                                    alt={article.title}
                                    className="w-full h-auto object-cover max-h-[500px]"
                                />
                            </div>
                        )}
                    </div>



                    {/* Content */}
                    <div
                        className="text-gray-800 leading-relaxed space-y-6 whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />


                </article>

                {/* Navigation */}
                <div className="border-t border-gray-200 mt-12 pt-8 flex justify-center">
                    <Link
                        href="/articles"
                        className="flex items-center text-pink-600 hover:text-pink-700 font-bold transition"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        記事一覧に戻る
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    )
}
