'use client'

import React from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-pink-50 flex flex-col">
            {/* Header */}
            <nav className="bg-white border-b-2 border-pink-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/">
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                                    ポケカ戦績
                                </span>
                            </Link>
                            <span className="ml-4 text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                活用ガイド
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/auth"
                                className="text-sm font-bold text-gray-600 hover:text-gray-900"
                            >
                                ログイン / 登録
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
                    <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-8 md:p-12 text-center text-white">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">
                            「感覚」ではなく<br />「データ」で勝つ。
                        </h1>
                        <p className="text-pink-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                            このアプリは、ただ勝敗を記録するだけではありません。<br />
                            「どの構築が一番勝てるのか？」を検証し、<br className="hidden md:inline" />あなたのデッキを最強の形へと進化させるためのツールです。
                        </p>
                    </div>

                    <div className="p-6 md:p-12 space-y-16">

                        {/* Registration */}
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">まずはアカウント作成</h2>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="bg-white border rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">1</div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1 text-gray-900">登録ページへアクセス</h3>
                                            <p className="text-gray-600">トップページの「新規登録」ボタンをクリックします。</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="bg-white border rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">2</div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1 text-gray-900">メールアドレスを入力</h3>
                                            <p className="text-gray-600">メールアドレスとパスワードを入力して送信します。</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="bg-white border rounded-full w-8 h-8 flex items-center justify-center font-bold text-pink-500 flex-shrink-0">3</div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1 text-pink-600">メールを確認して完了！</h3>
                                            <p className="text-gray-600">届いた確認メールのURLをクリックすれば登録完了です。</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Concept */}
                        <section>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span>📚</span>
                                基礎知識：デッキ管理の「考え方」
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                このアプリでは、デッキを「大きな分類（フォルダ）」と「実際のデッキ（バリエーション）」に分けて管理することで、
                                調整の履歴をきれいに残せるように設計されています。
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                                    <h3 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                        <span>📂</span> デッキフォルダ (親)
                                    </h3>
                                    <p className="text-sm text-indigo-700 mb-4 font-bold opacity-75">例: リザードンex, ドラパルトex</p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        似たようなデッキをまとめる「バインダー」です。<br />
                                        Freeプランなら最大3つまで作成できます。
                                    </p>
                                </div>
                                <div className="bg-pink-50 p-6 rounded-xl border border-pink-100">
                                    <h3 className="text-xl font-bold text-pink-900 mb-2 flex items-center gap-2">
                                        <span>🃏</span> バリエーション (子)
                                    </h3>
                                    <p className="text-sm text-pink-700 mb-4 font-bold opacity-75">例: v1.0(基本型), v1.1(フトゥー採用)</p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        実際に使用するデッキです。<br />
                                        1つのフォルダの中に5つまで保存できます。
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Practical Steps */}
                        <section>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                                <span>🛠️</span>
                                実践：最強デッキへの4ステップ
                            </h2>

                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="bg-white border-2 border-gray-100 shadow-sm rounded-xl p-6 flex-1 w-full">
                                        <span className="text-xs font-bold text-gray-400 mb-1 block">STEP 1</span>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">「作業机」でデッキを展開</h3>
                                        <p className="text-gray-600 text-sm">
                                            まずはログイン後の画面にある「作業机」に、公式等のデッキコードを入力してみましょう。
                                            カードリストがその場に展開されます。
                                        </p>
                                    </div>
                                    <div className="bg-white border-2 border-gray-100 shadow-sm rounded-xl p-6 flex-1 w-full">
                                        <span className="text-xs font-bold text-gray-400 mb-1 block">STEP 2</span>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">「フォルダ」を作成する</h3>
                                        <p className="text-gray-600 text-sm">
                                            気に入ったデッキが見つかったら、右上の「+ フォルダ作成」から、それを管理するためのバインダーを作ります。
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 md:p-8">
                                    <div className="md:w-3/4">
                                        <span className="text-xs font-bold text-indigo-400 mb-1 block">STEP 3 & 4</span>
                                        <h3 className="text-2xl font-bold text-indigo-900 mb-4">改造して「カスタム保存」</h3>
                                        <p className="text-gray-700 mb-6 leading-relaxed">
                                            ここが最重要ポイントです。<br />
                                            登録したデッキの「編集」ボタンを押し、カードを入れ替えたり枚数を調整したら、
                                            そのまま<strong className="text-indigo-600">「保存」</strong>ボタンを押してください。
                                        </p>
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-indigo-100 inline-block">
                                            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">CUSTOM</span>
                                            <span className="font-bold text-gray-800 text-sm">v1.1 まけんき採用型</span>
                                        </div>
                                        <p className="mt-4 text-sm text-indigo-800 font-bold">
                                            公式コードを発行しなくても、あなただけの調整版として即座に記録されます！
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* CTA */}
                        <div className="text-center pt-8 border-t border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">さあ、始めよう！</h2>
                            <p className="text-gray-600 mb-8">
                                今すぐ登録して、あなたの「最強の60枚」を見つけ出してください。
                            </p>
                            <Link
                                href="/auth?mode=signup"
                                className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold px-12 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
                            >
                                無料でアカウント作成
                            </Link>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
