'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

interface PublicHeaderProps {
    game?: 'pokemon' | 'unionarena'
}

export default function PublicHeader({ game = 'pokemon' }: PublicHeaderProps) {
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
        <header className="border-b border-[#e5e9f0] bg-white/90 backdrop-blur-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5 py-2.5 md:py-2.5">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-baseline gap-2">
                        <span className="text-[23px] font-semibold text-gray-800 whitespace-nowrap">
                            Poké<span className="text-blue-600">Lix</span>
                        </span>
                        <span className="hidden sm:inline text-[11px] text-gray-400">Pocket analytics</span>
                    </Link>

                    <div className="flex gap-2 md:gap-3 items-center flex-1 justify-end min-w-0">
                        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-xs text-gray-400 w-[220px] cursor-default select-none">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
                            デッキ・カードを検索 <span className="text-[9px]">準備中</span>
                        </div>

                        {isLoggedIn ? (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-white border-2 border-blue-200 rounded-full hover:border-blue-400 transition shadow-sm group"
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
                                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-xs">
                                        {user?.user_metadata?.nickname?.[0] || user?.user_metadata?.full_name?.[0] || 'U'}
                                    </div>
                                )}
                                <span className="text-xs md:text-sm font-bold text-gray-700 max-w-[80px] md:max-w-[120px] truncate group-hover:text-blue-600 transition">
                                    {user?.user_metadata?.nickname || user?.user_metadata?.full_name || 'マイページ'}
                                </span>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push('/auth')}
                                    className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-600 hover:text-blue-500 transition whitespace-nowrap"
                                >
                                    ログイン
                                </button>
                                <button
                                    onClick={() => router.push('/auth?mode=signup')}
                                    className="px-3 py-1.5 md:px-6 md:py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs md:text-base rounded-lg font-semibold transition shadow-md whitespace-nowrap"
                                >
                                    無料で登録
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-blue-600">
                <div className="max-w-7xl mx-auto px-3.5 flex items-center gap-0.5 overflow-x-auto whitespace-nowrap">
                    <Link
                        href="/"
                        className={`text-[13px] font-semibold px-4 py-2.5 shrink-0 transition ${game === 'pokemon' ? 'text-white bg-blue-700' : 'text-blue-100 hover:bg-blue-700/50'}`}
                    >
                        ポケカ
                    </Link>
                    <Link
                        href="/unionarena"
                        className={`text-[13px] font-semibold px-4 py-2.5 shrink-0 transition ${game === 'unionarena' ? 'text-white bg-blue-700' : 'text-blue-100 hover:bg-blue-700/50'}`}
                    >
                        ユニアリ
                    </Link>
                </div>
            </div>

            {game === 'pokemon' ? (
                <nav className="border-t border-blue-100 bg-white">
                    <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5 flex items-center gap-5 py-2 text-[13px] text-gray-600 overflow-x-auto whitespace-nowrap">
                        <Link href="/" className="text-blue-600 font-semibold shrink-0">TOP</Link>
                        <Link href="/decks" className="hover:text-blue-600 transition shrink-0">環境デッキ</Link>
                        <Link href="/practice" className="hover:text-blue-600 transition shrink-0">一人回し</Link>
                        <Link href="/simulator" className="hover:text-blue-600 transition shrink-0">確率シミュ</Link>
                        <Link href="/articles" className="hover:text-blue-600 transition shrink-0">記事</Link>
                        <span className="text-gray-300 shrink-0 cursor-default">カード検索 <span className="text-[10px]">準備中</span></span>
                    </div>
                </nav>
            ) : (
                <nav className="border-t border-blue-100 bg-white">
                    <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5 flex items-center gap-5 py-2 text-[13px] text-gray-600 overflow-x-auto whitespace-nowrap">
                        <Link href="/unionarena" className="text-blue-600 font-semibold shrink-0">TOP</Link>
                        <Link href="/unionarena/decks" className="hover:text-blue-600 transition shrink-0">環境デッキ</Link>
                        <Link href="/unionarena/titles" className="hover:text-blue-600 transition shrink-0">タイトル別デッキ</Link>
                        <span className="text-gray-300 shrink-0 cursor-default">一人回し <span className="text-[10px]">準備中</span></span>
                        <span className="text-gray-300 shrink-0 cursor-default">確率シミュ <span className="text-[10px]">準備中</span></span>
                        <span className="text-gray-300 shrink-0 cursor-default">カード検索 <span className="text-[10px]">準備中</span></span>
                    </div>
                </nav>
            )}
        </header>
    )
}
