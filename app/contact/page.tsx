'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Contact() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsLoggedIn(!!session)
        }
        checkAuth()
    }, [])

    const handleBack = () => {
        router.push(isLoggedIn ? '/dashboard' : '/')
    }

    // Color Change: White base
    return (
        <div className="min-h-screen bg-pink-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border-2 border-pink-200 shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">お問い合わせ</h1>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <p className="leading-relaxed mb-4">
                            ポケカ戦績管理アプリに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
                        </p>

                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">お問い合わせ先</p>
                            <p className="text-xl text-gray-900 font-mono">
                                contact@3o3.tech
                            </p>
                        </div>
                    </section>

                    <section className="mt-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">お問い合わせ内容の例</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                            <li>サービスの使い方について</li>
                            <li>不具合・エラーの報告</li>
                            <li>機能追加のご要望</li>
                            <li>アカウント削除のご依頼</li>
                            <li>その他ご質問・ご意見</li>
                        </ul>
                    </section>

                    <section className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>注意:</strong> お問い合わせへの返信には数日かかる場合がございます。
                            あらかじめご了承ください。
                        </p>
                    </section>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleBack}
                        className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition"
                    >
                        {isLoggedIn ? 'ダッシュボードに戻る' : 'トップページに戻る'}
                    </button>
                </div>
            </div>
        </div>
    )
}
