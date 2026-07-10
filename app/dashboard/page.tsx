'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getOrCreateProfileAction } from '@/app/actions'
import InvitationCodeInput from '@/components/InvitationCodeInput'

import AddDeckForm from '@/components/AddDeckForm'
import DeckManager from '@/components/DeckManager'
import ReferenceDeckList from '@/components/ReferenceDeckList'
import AnalyticsManager from '@/components/AnalyticsManager'
import EnvironmentManager from '@/components/EnvironmentManager'
import ArticleManager from '@/components/ArticleManager'
import UserList from '@/components/UserList'
import SideArticleList from '@/components/SideArticleList'
import Footer from '@/components/Footer'
import MatchAnalytics from '@/components/MatchAnalytics'
import KeyCardAdoptionList from '@/components/KeyCardAdoptionList'
import ArchetypeWinChart from '@/components/ArchetypeWinChart'
import DeckDistributionChart from '@/components/DeckDistributionChart'
import FeaturedCardTrends from '@/components/FeaturedCardTrends'
import AdPlaceholder from '@/components/AdPlaceholder'
import { Ico } from '@/components/Icons'

export default function Dashboard() {
    const supabase = createClient()
    const [userId, setUserId] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string>('')
    const [activeTab, setActiveTab] = useState('decks') // decks, analytics, reference, articles
    const [loading, setLoading] = useState(true)
    const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false)

    // Usage Limits (Now Dynamic)
    const [deckCount, setDeckCount] = useState(0)
    const [matchCount, setMatchCount] = useState(0)
    const [maxDecks, setMaxDecks] = useState(1000) // Default Unrestricted
    const [maxMatches, setMaxMatches] = useState(100) // Default Free
    const [userPlan, setUserPlan] = useState<'free' | 'invited'>('free')

    const [isAdmin, setIsAdmin] = useState(false)

    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            try {
                // Initial session check
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    setUserId(session.user.id)
                    const email = session.user.email || ''
                    setUserEmail(email)

                    // Admin Check
                    if (['player1@pokeka.local', 'r.matsumoto.3o3@gmail.com', 'nexpure.event@gmail.com', 'admin@pokeka.local'].includes(email)) {
                        setIsAdmin(true)
                    }

                    // Fetch Profile Limits (Phase 26)
                    const profileResult = await getOrCreateProfileAction(session.user.id)
                    if (profileResult.success && profileResult.profile) {
                        setMaxDecks(profileResult.profile.max_decks)
                        setMaxMatches(profileResult.profile.max_matches)
                        setUserPlan(profileResult.profile.plan_type)
                    }

                    // Fetch Counts (Corrected for Parent Limit: Folders + Loose Decks)
                    const { count: folderCount } = await supabase
                        .from('user_deck_archetypes')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', session.user.id)

                    const { count: looseDeckCount } = await supabase
                        .from('decks')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', session.user.id)
                        .is('archetype_id', null)

                    const { count: mCount } = await supabase
                        .from('matches')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', session.user.id)

                    setDeckCount((folderCount || 0) + (looseDeckCount || 0))
                    setMatchCount(mCount || 0)
                }
            } catch (error) {
                console.error('Initial auth check error:', error)
            } finally {
                setLoading(false)
            }
        }

        checkUser()

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                setUserId(session.user.id)
                setUserEmail(session.user.email || '')
            } else {
                setUserId(null)
                setUserEmail('')
                if (!loading) router.push('/auth')
            }
        })

        return () => subscription.unsubscribe()
    }, [router, loading])

    // Redirect if no user after loading
    useEffect(() => {
        if (!loading && !userId) {
            router.push('/auth')
        }
    }, [loading, userId, router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/auth')
    }

    // Refresh counts when actions happen
    const refreshCounts = async () => {
        if (!userId) return

        // Count Folders
        const { count: fCount } = await supabase
            .from('user_deck_archetypes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        // Count Loose Decks
        const { count: lCount } = await supabase
            .from('decks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .is('archetype_id', null)

        const { count: mCount } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        setDeckCount((fCount || 0) + (lCount || 0))
        setMatchCount(mCount || 0)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50">
                <div className="text-gray-600 text-xl font-medium">読み込み中...</div>
            </div>
        )
    }

    if (!userId) return null

    // Helper for limits
    const isDeckLimitReached = !isAdmin && deckCount >= maxDecks

    const tabClass = (tab: string) =>
        `shrink-0 px-3 py-3 text-[13px] font-semibold border-b-2 transition whitespace-nowrap ${activeTab === tab
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-800'
        }`

    return (
        <div className="min-h-screen bg-[#f4f6fa]">
            <nav className="bg-white border-b border-[#e5e9f0] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-14">
                    <Link href="/" className="flex items-baseline gap-1.5 shrink-0">
                        <span className="text-lg font-semibold text-gray-800">Poké<span className="text-blue-600">Lix</span></span>
                        <span className="hidden sm:inline text-[10px] text-gray-400">マイページ</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSignOut}
                            className="text-[12px] text-gray-500 hover:text-gray-800 whitespace-nowrap px-2.5 py-1.5 hover:bg-gray-50 rounded-lg transition"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar border-t border-[#eef1f6]">
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setActiveTab('decks')} className={tabClass('decks')}>デッキ管理</button>
                        <button onClick={() => setActiveTab('analytics')} className={tabClass('analytics')}>戦績分析</button>
                        <button onClick={() => setActiveTab('reference')} className={tabClass('reference')}>参考デッキ</button>
                        {isAdmin && <button onClick={() => setActiveTab('articles')} className={tabClass('articles')}>記事管理</button>}
                        {isAdmin && <button onClick={() => setActiveTab('users')} className={tabClass('users')}>ユーザー一覧</button>}
                    </div>
                    <div className="flex items-center gap-2 py-2 shrink-0">
                        <Link
                            href="/practice"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                        >
                            <Ico name="cards" className="w-3.5 h-3.5" />
                            一人回し
                        </Link>
                        <Link
                            href="/practice/prize-trainer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-full text-white bg-slate-900 hover:bg-slate-800 transition"
                        >
                            <Ico name="eye" className="w-3.5 h-3.5" />
                            サイド推論
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5 py-2.5 md:py-2.5">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-3 space-y-6">


                        {activeTab === 'decks' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl p-4 md:p-6 border border-[#e2e8f0] shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg md:text-xl font-bold text-gray-900">登録済みデッキ</h2>
                                        <button
                                            onClick={() => setIsAddDeckModalOpen(true)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition"
                                        >
                                            <Ico name="plus" className="w-4 h-4 mr-1.5" />
                                            新しいデッキを登録
                                        </button>
                                    </div>

                                    <DeckManager
                                        userId={userId}
                                        matchCount={matchCount}
                                        maxMatches={maxMatches} // Dynamic
                                        isMatchLimitReached={!isAdmin && matchCount >= maxMatches}
                                        onMatchAdded={refreshCounts}
                                    />
                                </div>

                                {/* Featured Trends Section */}
                                <FeaturedCardTrends />

                                {/* Registration Modal */}
                                {isAddDeckModalOpen && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                        {/* Backdrop */}
                                        <div
                                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                                            onClick={() => setIsAddDeckModalOpen(false)}
                                        />
                                        {/* Modal Content */}
                                        <div className="relative w-full max-w-xl animate-in fade-in zoom-in duration-200">
                                            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-200">
                                                <AddDeckForm
                                                    userId={userId}
                                                    onSuccess={() => {
                                                        refreshCounts()
                                                    }}
                                                    onClose={() => setIsAddDeckModalOpen(false)}
                                                    isLimitReached={isDeckLimitReached}
                                                    deckCount={deckCount}
                                                    maxDecks={maxDecks} // Dynamic
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}



                        {activeTab === 'analytics' && (
                            <MatchAnalytics userId={userId} />
                        )}

                        {activeTab === 'reference' && (
                            <div className="space-y-6">
                                {/* Admin Only: Manager Forms */}
                                {(userEmail === 'player1@pokeka.local' ||
                                    isAdmin) && (
                                        <>
                                            <EnvironmentManager userEmail={userEmail} />
                                            <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-sm mt-8">
                                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                                    <span className="flex items-center justify-center bg-blue-100 p-1.5 rounded-lg mr-2 w-9 h-9">
                                                        <img
                                                            src="/Alakazam.png"
                                                            alt="Alakazam"
                                                            className="w-6 h-6 object-contain"
                                                        />
                                                    </span>
                                                    デッキ管理 (分析 & 参考デッキ)
                                                </h2>
                                                <AnalyticsManager userId={userId} />
                                            </div>
                                        </>
                                    )}

                                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">参考デッキ一覧</h2>
                                    <ReferenceDeckList
                                        userId={userId}
                                        userEmail={userEmail}
                                        gridClassName="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
                                    />
                                </div>

                                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-blue-100 shadow-sm">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <span className="flex items-center justify-center bg-blue-100 p-1.5 rounded-lg mr-2 w-9 h-9">
                                            <img
                                                src="/Klefki.png"
                                                alt="Klefki"
                                                className="w-6 h-6 object-contain"
                                            />
                                        </span>
                                        キーカード採用率
                                    </h2>
                                    <KeyCardAdoptionList />
                                </div>

                                <ArchetypeWinChart />

                                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-blue-100 shadow-sm">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <span className="flex items-center justify-center bg-blue-100 p-1.5 rounded-lg mr-2 w-9 h-9">
                                            <img
                                                src="/Alakazam.png"
                                                alt="Alakazam"
                                                className="w-6 h-6 object-contain"
                                            />
                                        </span>
                                        環境デッキ分布
                                    </h2>
                                    <DeckDistributionChart />
                                </div>
                            </div>
                        )}

                        {activeTab === 'articles' && isAdmin && (
                            <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                                <ArticleManager />
                            </div>
                        )}
                        
                        {activeTab === 'users' && isAdmin && (
                            <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                                <h2 className="text-xl font-bold mb-4">ユーザー管理</h2>
                                <UserList />
                            </div>
                        )}

                        {/* Mobile Ad Slot (Visible only on mobile) */}
                        <div className="lg:hidden mt-8 space-y-6">
                            {/* Mobile PR row */}
                            <div className="mb-6 space-y-4">
                                <AdPlaceholder
                                    slot="1093986865"
                                    format="rectangle"
                                    className="mb-4"
                                />
                                <div>
                                    <span className="text-[10px] text-gray-400 block mb-1">PR: サプライ買うならTOYGER</span>
                                    <a
                                        href="https://shopa.jp/9293M3MEXQ2Z"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full hover:opacity-90 transition-opacity"
                                    >
                                        <img
                                            src="/ad_sponsor_toyger.png"
                                            alt="サプライ買うならTOYGER"
                                            className="w-full h-auto rounded-xl shadow-sm border border-gray-100"
                                            loading="lazy"
                                        />
                                    </a>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block mb-1">PR: ドット絵ご提供者様(下記タップでXへ)</span>
                                    <a
                                        href="https://twitter.com/komori541milk"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full hover:opacity-90 transition-opacity mx-auto"
                                    >
                                        <img
                                            src="/dotpicture.png"
                                            alt="ドット絵ご提供者様"
                                            className="w-full h-auto rounded-xl shadow-sm border border-gray-100"
                                            loading="lazy"
                                        />
                                    </a>
                                </div>
                                <SideArticleList />
                            </div>

                            {/* Mobile Discord Linking Section */}
                            <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm space-y-3 mb-6">
                                <h3 className="text-sm font-bold text-gray-900 border-b border-blue-50 pb-2 flex items-center gap-2">
                                    <span className="text-blue-500">🔗</span> アカウント連携
                                </h3>
                                <button
                                    onClick={async () => {
                                        setLoading(true)
                                        const { error } = await supabase.auth.signInWithOAuth({
                                            provider: 'discord',
                                            options: {
                                                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
                                            }
                                        })
                                        if (error) {
                                            console.error('Link Error:', error)
                                            setLoading(false)
                                        }
                                    }}
                                    disabled={loading}
                                    className="w-full py-2 px-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.295 1.199-1.99a.076.076 0 0 0-.041-.105 13.11 13.11 0 0 1-1.872-.89.077.077 0 0 1-.008-.128 10.24 10.24 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.89.077.077 0 0 0-.041.106c.34.693.737 1.362 1.199 1.99a.076.076 0 0 0 .084-.028 19.83 19.83 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
                                    </svg>
                                    Discord連携
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column (Visible only on Desktop) */}
                    <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24">
                        {/* Sidebar Article List (Top Priority) */}
                        <div className="mb-6 space-y-4">
                            <AdPlaceholder
                                slot="1093986865"
                                format="rectangle"
                                className="mb-4"
                            />
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-1">PR: サプライ買うならTOYGER</span>
                                <a
                                    href="https://shopa.jp/9293M3MEXQ2Z"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full hover:opacity-90 transition-opacity"
                                >
                                    <img
                                        src="/ad_sponsor_toyger.png"
                                        alt="サプライ買うならTOYGER"
                                        className="w-full h-auto rounded-xl shadow-sm border border-gray-100"
                                        loading="lazy"
                                    />
                                </a>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-1">PR: ドット絵ご提供者様(下記タップでXへ)</span>
                                <a
                                    href="https://twitter.com/komori541milk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-[94%] hover:opacity-90 transition-opacity mx-auto"
                                >
                                    <img
                                        src="/dotpicture.png"
                                        alt="ドット絵ご提供者様"
                                        className="w-full h-auto rounded-xl shadow-sm border border-gray-100"
                                        loading="lazy"
                                    />
                                </a>
                            </div>
                            <SideArticleList />
                        </div>

                        {/* Discord Linking Section */}
                        <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 border-b border-blue-50 pb-2 flex items-center gap-2">
                                <span className="text-blue-500">🔗</span> アカウント連携
                            </h3>
                            <button
                                onClick={async () => {
                                    setLoading(true)
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: 'discord',
                                        options: {
                                            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
                                        }
                                    })
                                    if (error) {
                                        console.error('Link Error:', error)
                                        setLoading(false)
                                    }
                                }}
                                disabled={loading}
                                className="w-full py-2 px-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.295 1.199-1.99a.076.076 0 0 0-.041-.105 13.11 13.11 0 0 1-1.872-.89.077.077 0 0 1-.008-.128 10.24 10.24 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.89.077.077 0 0 0-.041.106c.34.693.737 1.362 1.199 1.99a.076.076 0 0 0 .084.028 19.83 19.83 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
                                </svg>
                                Discord連携
                            </button>
                            <p className="text-[10px] text-gray-500 text-center">
                                ※Discordのアカウントを現在のデータに紐付けます
                            </p>
                        </div>



                    </div>
                </div>
            </main >

            <Footer />
        </div >
    )
}
