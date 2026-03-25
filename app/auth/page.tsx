'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthContent() {
    const searchParams = useSearchParams()
    const [isLogin, setIsLogin] = useState(true)

    useEffect(() => {
        const mode = searchParams.get('mode')
        if (mode === 'signup') {
            setIsLogin(false)
        }
    }, [searchParams])

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nickname, setNickname] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                // Login
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/dashboard')
            } else {
                // Sign up
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            nickname: nickname || email.split('@')[0],
                        },
                    },
                })
                if (error) throw error

                setError('確認メールを送信しました。メールを確認してアカウントを有効化してください。')
            }
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    // Color Change: White background, Pop card
    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
            <div className="w-full max-w-md p-6 md:p-8 bg-white rounded-2xl shadow-xl border-2 border-pink-200">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        <span className="text-pink-500">⚡</span> ポケカ戦績
                    </h1>
                    <p className="text-gray-600">
                        {isLogin ? 'ログインして戦績を記録' : '新規アカウント作成'}
                    </p>
                </div>

                {error && (
                    <div className={`mb-4 p-3 rounded-lg ${error.includes('確認メール')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ニックネーム
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                                placeholder="プレイヤー名（任意）"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                            placeholder="6文字以上"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? '処理中...' : isLogin ? 'ログイン' : '新規登録'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">または</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true)
                            const { error } = await supabase.auth.signInWithOAuth({
                                provider: 'discord',
                                options: {
                                    redirectTo: `${window.location.origin}/auth/callback`
                                }
                            })
                            if (error) {
                                setError(error.message)
                                setLoading(false)
                            }
                        }}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-3 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.295 1.199-1.99a.076.076 0 0 0-.041-.105 13.11 13.11 0 0 1-1.872-.89.077.077 0 0 1-.008-.128 10.24 10.24 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.89.077.077 0 0 0-.041.106c.34.693.737 1.362 1.199 1.99a.076.076 0 0 0 .084.028 19.83 19.83 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
                        </svg>
                        Discordでログイン
                    </button>

                </form>

                <div className="mt-6 text-center space-y-3">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError(null)
                        }}
                        className="text-pink-500 hover:text-pink-600 transition font-medium"
                    >
                        {isLogin ? 'アカウントを作成' : 'ログインに戻る'}
                    </button>

                    <div>
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-500 hover:text-gray-700 transition text-sm"
                        >
                            ← トップページに戻る
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-pink-50">読み込み中...</div>}>
            <AuthContent />
        </Suspense>
    )
}
