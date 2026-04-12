'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

export default function PublicHeader() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = React.useState<any>(null)
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)

    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setIsLoggedIn(!!user)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null)
            setIsLoggedIn(!!session)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <header className="border-b-2 border-pink-200 bg-white/90 backdrop-blur-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5 py-2.5 md:py-2.5">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center">
                        <h1 className="text-xl sm:text-2xl text-gray-900 whitespace-nowrap cursor-pointer font-[family-name:var(--font-dotgothic-16)] tracking-wider flex items-center gap-1">
                            <Image src="/pikachu.png" alt="pikachu" width={28} height={28} className="inline-block" />
                            ポケリス
                            <Image src="/pikachu.png" alt="pikachu" width={28} height={28} className="inline-block" />
                        </h1>
                    </Link>

                    <div className="flex gap-2 md:gap-3 items-center">
                        <Link
                            href="/guide"
                            className="hidden lg:block px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-600 hover:text-pink-500 transition whitespace-nowrap font-medium"
                        >
                            活用ガイド
                        </Link>
                        <Link
                            href="/about"
                            className="hidden lg:block px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-600 hover:text-pink-500 transition whitespace-nowrap font-medium"
                        >
                            ポケリスについて
                        </Link>
                        <Link
                            href="/articles"
                            className="hidden md:block px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-600 hover:text-pink-500 transition whitespace-nowrap font-medium"
                        >
                            コラム・記事
                        </Link>

                        {isLoggedIn ? (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-white border-2 border-pink-200 rounded-full hover:border-pink-400 transition shadow-sm group"
                            >
                                {user?.user_metadata?.avatar_url ? (
                                    <Image
                                        src={user.user_metadata.avatar_url}
                                        alt="User Avatar"
                                        width={28}
                                        height={28}
                                        className="rounded-full"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-7 h-7 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold text-xs">
                                        {user?.user_metadata?.nickname?.[0] || user?.user_metadata?.full_name?.[0] || 'U'}
                                    </div>
                                )}
                                <span className="text-xs md:text-sm font-bold text-gray-700 max-w-[80px] md:max-w-[120px] truncate group-hover:text-pink-600 transition">
                                    {user?.user_metadata?.nickname || user?.user_metadata?.full_name || 'マイページ'}
                                </span>
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
