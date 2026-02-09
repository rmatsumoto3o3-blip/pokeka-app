'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PublicHeader() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)

    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsLoggedIn(!!session)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsLoggedIn(!!session)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <header className="border-b-2 border-pink-200 bg-white/90 backdrop-blur-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center">
                        <h1 className="text-xl sm:text-2xl text-gray-900 whitespace-nowrap cursor-pointer font-[family-name:var(--font-dotgothic-16)] tracking-wider">
                            ⚡️ポケリス⚡️
                        </h1>
                    </Link>

                    <div className="flex gap-2 md:gap-3 items-center">
                        <Link
                            href="/articles"
                            className="hidden md:block px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-600 hover:text-pink-500 transition whitespace-nowrap font-medium"
                        >
                            コラム・記事
                        </Link>

                        <Link
                            href="/global-simulator"
                            className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-indigo-600 hover:text-indigo-800 transition whitespace-nowrap font-bold"
                        >
                            Global Edition
                        </Link>

                        {isLoggedIn ? (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs md:text-sm rounded-lg font-bold shadow-md hover:shadow-lg transition whitespace-nowrap"
                            >
                                ダッシュボードへ
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push('/auth')}
                                    className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-600 hover:text-pink-500 transition whitespace-nowrap"
                                >
                                    ログイン
                                </button>
                                <button
                                    onClick={() => router.push('/auth?mode=signup')}
                                    className="px-3 py-1.5 md:px-6 md:py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xs md:text-base rounded-lg font-semibold transition shadow-md whitespace-nowrap"
                                >
                                    無料で登録
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
