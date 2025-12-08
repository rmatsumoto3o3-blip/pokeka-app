'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PrivacyPolicy() {
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
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h1 className="text-3xl font-bold text-white mb-8">プライバシーポリシー</h1>

                <div className="space-y-6 text-gray-200">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. 個人情報の収集について</h2>
                        <p className="leading-relaxed">
                            当サイトでは、ユーザー登録時にメールアドレスを収集します。
                            収集した個人情報は、サービス提供のためにのみ使用し、第三者に提供することはありません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Cookieの使用について</h2>
                        <p className="leading-relaxed">
                            当サイトでは、ユーザーの利便性向上のためにCookieを使用しています。
                            Cookieは、ログイン状態の維持や、サイトの利用状況の分析に使用されます。
                            ブラウザの設定でCookieを無効にすることも可能ですが、一部機能が制限される場合があります。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. 広告配信について</h2>
                        <p className="leading-relaxed mb-3">
                            当サイトでは、第三者配信の広告サービス（Google AdSense等）を利用しています。
                            広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
                        </p>
                        <p className="leading-relaxed">
                            Google AdSenseに関する詳細は、
                            <a
                                href="https://policies.google.com/technologies/ads?hl=ja"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-300 hover:text-purple-200 underline ml-1"
                            >
                                Googleの広告ポリシー
                            </a>
                            をご確認ください。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. アクセス解析ツールについて</h2>
                        <p className="leading-relaxed">
                            当サイトでは、Googleアナリティクスを使用してアクセス解析を行っています。
                            これにより、サイトの利用状況を把握し、サービス向上に役立てています。
                            データは匿名で収集され、個人を特定するものではありません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. データの保存について</h2>
                        <p className="leading-relaxed">
                            ユーザーが登録したデッキ情報、試合記録などのデータは、Supabaseのサーバーに安全に保存されます。
                            データは暗号化され、不正アクセスから保護されています。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. データの削除について</h2>
                        <p className="leading-relaxed">
                            アカウント削除を希望される場合は、お問い合わせページよりご連絡ください。
                            アカウント削除と同時に、登録されたすべてのデータを削除いたします。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">7. プライバシーポリシーの変更</h2>
                        <p className="leading-relaxed">
                            当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、
                            本ポリシーの内容を適宜見直し、その改善に努めます。
                            修正された最新のプライバシーポリシーは常に本ページにて開示されます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">8. お問い合わせ</h2>
                        <p className="leading-relaxed">
                            本ポリシーに関するお問い合わせは、
                            <a
                                href="/contact"
                                className="text-purple-300 hover:text-purple-200 underline ml-1"
                            >
                                お問い合わせページ
                            </a>
                            よりご連絡ください。
                        </p>
                    </section>

                    <div className="mt-8 pt-6 border-t border-white/20 text-sm text-gray-400">
                        <p>制定日: 2025年12月8日</p>
                        <p>最終更新日: 2025年12月8日</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleBack}
                        className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                    >
                        {isLoggedIn ? 'ダッシュボードに戻る' : 'トップページに戻る'}
                    </button>
                </div>
            </div>
        </div>
    )
}
