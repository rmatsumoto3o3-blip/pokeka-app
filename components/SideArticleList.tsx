'use client'

import { useEffect, useState } from 'react'
import { supabase, Article } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export default function SideArticleList() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchArticles = async () => {
            const { data } = await supabase
                .from('articles')
                .select('*') // Select all to satisfy Article interface
                .eq('is_published', true)
                .order('published_at', { ascending: false })
                .limit(5)

            if (data) {
                setArticles(data)
            }
            setLoading(false)
        }

        fetchArticles()
    }, [])

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-xl"></div>
    if (articles.length === 0) return null

    return (
        <div className="bg-white rounded-xl border border-pink-100 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-pink-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">📝 新着記事</h3>
                <Link href="/articles" className="text-xs text-pink-600 hover:underline">
                    一覧へ
                </Link>
            </div>
            <div className="divide-y divide-gray-50">
                {articles.map((article) => (
                    <Link
                        href={`/articles/${article.slug}`}
                        key={article.id}
                        className="block p-3 hover:bg-gray-50 transition group"
                    >
                        <div className="flex gap-3">
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
                                {article.thumbnail_url ? (
                                    <Image
                                        src={article.thumbnail_url}
                                        alt={article.title}
                                        width={64}
                                        height={64}
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">📝</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-pink-600 mb-1 leading-snug">
                                    {article.title}
                                </h4>
                                <p className="text-[10px] text-gray-500">
                                    {new Date(article.published_at || article.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
