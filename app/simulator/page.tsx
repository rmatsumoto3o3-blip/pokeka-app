'use client'

import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import SimulatorManager from '@/components/SimulatorManager'

export default async function SimulatorPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const code = typeof resolvedParams.code === 'string' ? resolvedParams.code : undefined

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PublicHeader />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                            初手確率シミュレーター
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            公式デッキコードから、初手（7枚）に特定のカードを引ける確率や、<br className="hidden md:inline" />
                            サイド落ちを考慮して山札に残る確率を計算します。
                        </p>
                    </div>

                    <SimulatorManager initialDeckCode={code} />

                    {/* Content for AdSense (SEO & Value) */}
                    <div className="mt-20 prose prose-pink max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 border-b pb-4 mb-6">
                            <span className="text-3xl">📝</span>
                            初手確率シミュレーターの使い方
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">🔢 このツールでできること</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                                    <li>公式デッキコードを入力するだけで確率を自動計算</li>
                                    <li>初手（7枚）に欲しいカードが来る確率を算出</li>
                                    <li>サイド落ちで特定のカードが使えなくなる確率を計算</li>
                                    <li>マリガン（たねポケモンなし）の発生率をチェック</li>
                                </ul>

                                <h3 className="text-lg font-bold text-gray-900 mb-3">🎲 計算ロジックについて</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    このシミュレーターは、実際のカードゲームと同様の乱数処理を用いた<strong>モンテカルロ法</strong>を採用しています。<br />
                                    100,000回の仮想的な手札配布を行い、その結果から統計的に確率を導き出しています。<br />
                                    純粋な超幾何分布の計算式だけでは難しい、「複数種類のカードの組み合わせ」や「マリガンによる引き直し」も正確にシミュレーション可能です。
                                </p>
                                <h4 className="font-bold text-gray-800 mb-1">山札に残る枚数の内訳について</h4>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    これは残りの47枚の中に特定のカードが何枚含まれるかを算出しています。
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">💡 活用のアドバイス</h3>
                                <div className="space-y-4">
                                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                                        <h4 className="font-bold text-pink-800 mb-1">ボール系統の配分調整に</h4>
                                        <p className="text-sm text-pink-700">ネストボールやハイパーボールなど、初動でたねポケモンに触れるカードの枚数を調整する際に役立ちます。</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                        <h4 className="font-bold text-purple-800 mb-1">事故率確認</h4>
                                        <p className="text-sm text-purple-700">エネルギーやサポートを絞った構築で、どれくらいの頻度で攻撃できない手札になるかを可視化できます。</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
