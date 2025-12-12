'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

export default function BetaTermsPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-white">
            <PublicHeader />

            <main>
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-purple-50 to-white z-0" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-pink-200 text-pink-600 font-bold mb-6 text-sm shadow-sm">
                            🎉 50名様限定募集中
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            ベータテスター募集中！
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block mt-2">
                                一緒に最強のアプリを作りませんか？
                            </span>
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                            PokéLixは現在、正式リリースに向けたベータテストを実施しています。<br className="hidden md:inline" />
                            あなたのフィードバックが、このアプリの未来を作ります。
                        </p>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-gray-900">
                            <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-white border border-pink-100 shadow-sm hover:shadow-md transition">
                                <div className="text-5xl mb-4">∞</div>
                                <h3 className="text-xl font-bold mb-3">ずっと無料</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    正式リリース後も、テスター様は<br />
                                    <strong>「永続プレミアム会員」</strong>として<br />
                                    有料機能を無料で利用できます。
                                </p>
                            </div>
                            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm hover:shadow-md transition">
                                <div className="text-5xl mb-4">🚀</div>
                                <h3 className="text-xl font-bold mb-3">先行体験</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    AI分析やグラフ機能など、<br />
                                    開発中の<strong>新機能</strong>を<br />
                                    誰よりも早く体験できます。
                                </p>
                            </div>
                            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm hover:shadow-md transition">
                                <div className="text-5xl mb-4">💬</div>
                                <h3 className="text-xl font-bold mb-3">開発に参加</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    開発者と直接やり取りし、<br />
                                    あなたの<strong>「欲しい機能」</strong>が<br />
                                    実際にアプリに実装されます。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Rules Section */}
                <section className="py-16 bg-gray-50 text-gray-900">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">参加条件・ルール</h2>
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-3 text-xl">✓</span>
                                    <span>ポケモンカードゲームに興味があり、日常的にプレイしている方。</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-3 text-xl">✓</span>
                                    <span>開発中のアプリを使用し、不具合や感想をフィードバックしていただける方。</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-3 text-xl">✓</span>
                                    <span>iOS 13以降、またはAndroid 8.0以降のスマートフォン、またはPCをお持ちの方。</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Disclaimer Section */}
                <section className="py-12 bg-white text-gray-600">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">免責事項</h2>
                        <div className="bg-gray-50 p-6 rounded-xl text-sm leading-relaxed text-left space-y-3">
                            <p>
                                ・本アプリはベータ版（開発中）のため、予期せぬ不具合やエラーが発生する可能性があります。
                            </p>
                            <p>
                                ・重大な不具合修正や仕様変更に伴い、予告なくデータをリセットまたはロールバックする場合があります（可能な限り回避します）。
                            </p>
                            <p>
                                ・本アプリの利用により生じた損害（データ消失など）について、開発者は一切の責任を負いかねます。
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 text-center">
                    <div className="max-w-4xl mx-auto px-4">
                        <button
                            onClick={() => router.push('/auth?mode=signup')}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xl md:text-2xl font-bold py-6 px-12 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-pulse"
                        >
                            条件に同意して参加する
                        </button>
                        <p className="mt-4 text-gray-500 text-sm">
                            ※登録は無料です。いつでも退会できます。
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
