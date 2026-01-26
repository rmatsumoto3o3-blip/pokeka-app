'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import ReferenceDeckList from '@/components/ReferenceDeckList'
import KeyCardAdoptionList from '@/components/KeyCardAdoptionList'
import AdPlaceholder from '@/components/AdPlaceholder'
import type { ReferenceDeck, DeckArchetype, Article } from '@/lib/supabase'

import PublicHeader from '@/components/PublicHeader'

interface LandingPageProps {
    decks: ReferenceDeck[]
    archetypes: DeckArchetype[]
    articles: Article[]
}

export default function LandingPage({ decks, archetypes, articles }: LandingPageProps) {
    const router = useRouter()

    // Color Change Only: White base, Pop borders
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative pt-20 pb-12 md:pt-32 md:pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-purple-100/50 to-blue-100/50 z-0" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white border border-pink-200 text-pink-600 text-sm font-semibold shadow-sm animate-fade-in-up">
                        ✨ 勝つための情報が集まる場所
                    </div>
                    <h1 className="font-extrabold text-gray-900 tracking-tight mb-6 animate-fade-in-up delay-100">
                        <span className="block text-xl md:text-2xl mb-2 text-gray-600">ポケモンカード情報局</span>
                        <span className="block text-5xl md:text-7xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 font-[family-name:var(--font-press-start-2p)] py-2">
                            PokéLix
                        </span>
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
                        最新の環境考察、優勝デッキ情報、初心者ガイドまで。<br className="block sm:hidden" />
                        あなたのポケカライフを充実させる<br className="block sm:hidden" />
                        全ての情報がここに。
                    </p>
                    <div className="flex flex-col items-center gap-4 animate-fade-in-up delay-300">
                        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                            <a
                                href="#key-card-adoption"
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center"
                            >
                                <span className="flex items-center justify-center">
                                    カード採用率
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </a>
                            <a
                                href="#reference-decks"
                                className="px-8 py-4 rounded-xl bg-white text-gray-700 font-bold text-lg border-2 border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all duration-200 shadow-sm"
                            >
                                参考デッキを探す
                            </a>
                        </div>
                        <Link
                            href="/practice"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center"
                        >
                            <span className="flex items-center justify-center">
                                🎮 一人回し（練習）
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Reference Decks Section (Public Preview) */}
            <section className="py-4 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-400 mb-1">PR: サプライ買うならTOYGER</span>
                        <a
                            href="https://shopa.jp/9293M3MEXQ2Z"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full max-w-sm hover:opacity-90 transition-opacity"
                        >
                            <img
                                src="/ad_sponsor_toyger.png"
                                alt="サプライ買うならTOYGER"
                                className="w-full h-auto rounded-lg shadow-sm border border-gray-100"
                                loading="lazy"
                            />
                        </a>
                    </div>
                </div>
            </section>

            {/* Reference Decks Section (Public Preview) */}
            <section id="reference-decks" className="py-12 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            🏆 環境・優勝デッキ集
                        </h2>
                        <p className="text-gray-600 mt-2">大会で結果を残している強力なデッキレシピをチェック</p>
                    </div>
                    {/* Unified Reference Deck List */}
                    <div className="bg-white rounded-2xl border-2 border-pink-100 shadow-sm p-4 md:p-6">
                        <ReferenceDeckList
                            initialDecks={decks}
                            initialArchetypes={archetypes}
                        />
                    </div>

                    <div className="mt-8" id="key-card-adoption">
                        <div className="mb-4">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                🔑 キーカード採用率
                            </h3>
                            <p className="text-gray-600 mt-1">環境デッキで採用されているカードの採用枚数を確認</p>
                        </div>
                        <div className="bg-white rounded-2xl border-2 border-pink-100 shadow-sm p-4 md:p-6">
                            <KeyCardAdoptionList initialArchetypes={archetypes} />
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Usage Guide Section */}
            <section className="py-16 bg-pink-50/50 overflow-hidden border-t border-b border-pink-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-pink-500 font-bold tracking-wider uppercase text-sm">How to Use</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
                            PokeLixの活用方法
                        </h2>
                        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                            デッキの登録から戦績管理まで、3ステップであなたのポケカライフをサポートします。
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 transform -translate-y-1/2 z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            {/* Step 1 */}
                            <div className="bg-white p-6 rounded-2xl border-2 border-pink-100 shadow-lg hover:shadow-xl transition-shadow text-center group">
                                <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                    📋
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">1. デッキを登録</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    公式のエディタで作成した「デッキコード」を入力するだけ。<br />
                                    カード画像ごと一瞬で保存できます。
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white p-6 rounded-2xl border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow text-center group">
                                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                    📊
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">2. 分析・カスタマイズ</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    「キーカード採用率」を見ながらデッキを調整。<br />
                                    自分だけの最強構築を作り上げましょう。
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow text-center group">
                                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                    ⚔️
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3. 戦績を記録</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    対戦結果をサクサク記録。<br />
                                    「どのデッキに勝てるか」がグラフで可視化されます。
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-10">
                            <Link
                                href="/guide"
                                className="inline-flex items-center text-purple-600 font-bold hover:text-purple-800 transition-colors text-lg"
                            >
                                詳しい使い方はこちら <span className="ml-2">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Articles Carousel Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            🔥 最新のピックアップ記事
                        </h2>
                        <Link href="/articles" className="text-pink-600 font-semibold hover:underline">
                            すべて見る &rarr;
                        </Link>
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="flex overflow-x-auto pb-8 -mx-4 px-4 space-x-6 no-scrollbar snap-x snap-mandatory">
                        {articles.map((article) => (
                            <Link
                                href={`/articles/${article.slug}`}
                                key={article.id}
                                className="flex-none snap-center w-[300px] md:w-[350px] bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                            >
                                <div className="aspect-video w-full relative">
                                    {article.thumbnail_url ? (
                                        <Image
                                            src={article.thumbnail_url}
                                            alt={article.title}
                                            width={350}
                                            height={197}
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-4xl">
                                            📝
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {article.excerpt}
                                    </p>
                                    <div className="mt-4 flex items-center text-xs text-gray-500">
                                        <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                                        <span className="mx-2">•</span>
                                        <span className="text-pink-500 font-medium">読む</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ad Slot: Mid-Page */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AdPlaceholder slot="landing-mid" label="Sponsored" />
            </div>

            {/* Features Section */}
            <section id="features" className="py-12 md:py-20 bg-pink-50">                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">充実の戦績管理機能</h2>
                    <p className="text-gray-600">シンプルで使いやすい機能が揃っています</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {[
                        {
                            icon: "📊",
                            title: "勝率を自動計算",
                            description: "デッキごとの勝率を自動で計算。相性の良いデッキ、悪いデッキが一目でわかります。"
                        },
                        {
                            icon: "📝",
                            title: "詳細な対戦記録",
                            description: "先攻・後攻、対戦相手のデッキタイプ、サイド差など、細かいデータまで記録可能。"
                        },
                        {
                            icon: "🔍",
                            title: "参考デッキ閲覧",
                            description: "強いプレイヤーのデッキ構築をチェックして、自分のデッキ作りの参考に。"
                        }
                    ].map((feature, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 md:p-8 border-2 border-white hover:border-pink-200 transition-all duration-300 shadow-md hover:shadow-xl">
                            <div className="text-4xl md:text-5xl mb-4 md:mb-6">{feature.icon}</div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button
                        onClick={() => router.push('/auth?mode=signup')}
                        className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg rounded-lg font-bold transition shadow-lg hover:shadow-xl"
                    >
                        無料で戦績管理を始める
                    </button>
                </div>
            </div>
            </section>

            {/* Ad Slot: Bottom */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AdPlaceholder slot="landing-bottom" label="Sponsored" />
            </div>

            <Footer />
        </div>
    )
}
