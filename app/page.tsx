'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ReferenceDeck } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

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
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-pink-500">⚡</span> ポケカ戦績
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

      {/* メインビジュアル */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            対戦記録を簡単管理
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            デッキ管理から試合記録、戦績分析まで。<br />
            ポケモンカードの対戦記録を一元管理できます。
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg rounded-lg font-bold transition shadow-lg hover:shadow-xl"
          >
            無料で登録して始める
          </button>
        </div>
      </section>

      {/* 参考デッキ一覧 */}
      <section className="py-16 px-4 bg-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">最新デッキレシピ・環境デッキ</h3>
            <p className="text-gray-600">登録不要で閲覧できます</p>
          </div>

          {loading ? (
            <div className="text-center text-gray-600">読み込み中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className="bg-white rounded-xl overflow-hidden border-2 border-pink-100 hover:border-pink-400 transition shadow-sm hover:shadow-md"
                >
                  {deck.image_url && (
                    <div className="w-full h-48 bg-gray-100">
                      <img
                        src={deck.image_url}
                        alt={deck.deck_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{deck.deck_name}</h4>
                    {deck.deck_code && (
                      <p className="text-sm text-gray-500 mb-2 font-mono break-all bg-gray-50 px-2 py-1 rounded inline-block">
                        {deck.deck_code}
                      </p>
                    )}
                    {deck.deck_url && (
                      <div>
                        <a
                          href={deck.deck_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-pink-500 hover:text-pink-600 underline"
                        >
                          詳細を見る →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {decks.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-12">
              まだデッキが登録されていません
            </div>
          )}
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">登録すると使える機能</h3>
            <p className="text-gray-600">無料で全ての機能が利用できます</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-sm">
              <div className="text-4xl mb-4">🎴</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">デッキ管理</h4>
              <p className="text-gray-600">
                デッキコードや画像を登録して、複数のデッキを一元管理。
                デッキごとの戦績も自動集計されます。
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">試合記録</h4>
              <p className="text-gray-600">
                勝敗、先攻後攻、サイド状況など詳細な試合記録を保存。
                デッキ別に戦績を分析できます。
              </p>
            </div>
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
