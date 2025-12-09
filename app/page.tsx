'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ReferenceDeck } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import ReferenceDeckList from '@/components/ReferenceDeckList'

export default function Home() {
  const [decks, setDecks] = useState<ReferenceDeck[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchDecks()
  }, [])

  const fetchDecks = async () => {
    try {
      const { data, error } = await supabase
        .from('reference_decks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error
      setDecks(data || [])
    } catch (err) {
      console.error('Error fetching decks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Color Change Only: White base, Pop borders
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ヘッダー */}
      <header className="border-b-2 border-pink-200 bg-white/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
              ⚡️ポケメタ⚡️
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/auth')}
                className="px-4 py-2 text-gray-600 hover:text-pink-500 transition"
              >
                ログイン
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg font-semibold transition shadow-md"
              >
                登録して始める
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-purple-100/50 to-blue-100/50 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white border border-pink-200 text-pink-600 text-sm font-semibold shadow-sm animate-fade-in-up">
            ✨ ポケモンカード専用 戦績管理アプリ
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight animate-fade-in-up delay-100">
            数字で環境把握<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">数字で見るポケカ</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            日々の対戦成績を記録して、勝率を分析。<br className="block sm:hidden" />
            環境デッキや優勝デッキもチェックして、<br className="block sm:hidden" />
            あなたのプレイングを進化させましょう。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-300">
            <a
              href="/auth"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              今すぐ始める（無料）
            </a>
            <a
              href="#features"
              className="px-8 py-4 rounded-xl bg-white text-gray-700 font-bold text-lg border-2 border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all duration-200 shadow-sm"
            >
              機能を見る
            </a>
          </div>
        </div>
      </section>

      {/* Reference Decks Section (Public Preview) */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Unified Reference Deck List */}
          <div className="bg-white rounded-2xl border-2 border-pink-100 shadow-sm p-4 md:p-6">
            <ReferenceDeckList />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 bg-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              onClick={() => router.push('/auth')}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg rounded-lg font-bold transition shadow-lg hover:shadow-xl"
            >
              今すぐ無料で始める
            </button>
          </div>
        </div>
      </section>

      {/* フッターはコンポーネント内なのでここでは変わりませんが、背景が白ならFooterも調整必要かもです */}
      <Footer />
    </div>
  )
}
