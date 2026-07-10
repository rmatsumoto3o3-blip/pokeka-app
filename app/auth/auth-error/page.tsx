'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const errorMsg = searchParams.get('error')

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa] px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-[#e2e8f0] text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">認証エラー</h1>
                <p className="text-gray-600 mb-4">
                    ログイン処理中にエラーが発生しました。
                </p>
                {errorMsg && (
                    <div className="mb-8 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 break-all text-left">
                        <div className="font-bold mb-1 underline">エラー内容:</div>
                        {errorMsg}
                    </div>
                )}
                {!errorMsg && (
                    <div className="mb-8 p-3 bg-gray-50 text-gray-600 text-sm rounded-lg border border-gray-100">
                        エラーメッセージが見つかりませんでした。
                        これは、エラーパラメータがない状態でこのページにリダイレクトされたことを意味します。
                    </div>
                )}
                <Link
                    href="/auth"
                    className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition"
                >
                    ログイン画面に戻る
                </Link>
            </div>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f4f6fa]">読み込み中...</div>}>
            <AuthErrorContent />
        </Suspense>
    )
}
