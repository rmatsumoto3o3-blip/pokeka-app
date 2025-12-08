'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
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
        <div className="min-h-screen flex items-center justify-center bg-pink-50">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border-2 border-pink-200">
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
