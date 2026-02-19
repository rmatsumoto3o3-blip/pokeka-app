'use client'

import Link from 'next/link'

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border-2 border-pink-200 text-center">
                <div className="text-pink-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">認証エラー</h1>
                <p className="text-gray-600 mb-8">
                    ログイン処理中にエラーが発生しました。もう一度お試しいただくか、管理者にお問い合わせください。
                </p>
                <Link
                    href="/auth"
                    className="inline-block w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
                >
                    ログイン画面に戻る
                </Link>
            </div>
        </div>
    )
}
