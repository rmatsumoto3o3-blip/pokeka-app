'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getOrCreateProfileAction } from '@/app/actions'
import InvitationCodeInput from '@/components/InvitationCodeInput'

import AddDeckForm from '@/components/AddDeckForm'
import DeckManager from '@/components/DeckManager'
import ReferenceDeckList from '@/components/ReferenceDeckList'
import AnalyticsManager from '@/components/AnalyticsManager'
import EnvironmentManager from '@/components/EnvironmentManager'
import ArticleManager from '@/components/ArticleManager'
import SideArticleList from '@/components/SideArticleList'
import AdPlaceholder from '@/components/AdPlaceholder'
import Footer from '@/components/Footer'
import MatchAnalytics from '@/components/MatchAnalytics'
import KeyCardAdoptionList from '@/components/KeyCardAdoptionList'

export default function Dashboard() {
    const [userId, setUserId] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string>('')
    const [activeTab, setActiveTab] = useState('decks') // decks, analytics, reference, articles
    const [loading, setLoading] = useState(true)
    const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false)

    // Usage Limits (Now Dynamic)
    const [deckCount, setDeckCount] = useState(0)
    const [matchCount, setMatchCount] = useState(0)
    const [maxDecks, setMaxDecks] = useState(3) // Default Free
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
                    if (['player1@pokeka.local', 'player2@pokeka.local', 'player3@pokeka.local', 'r.matsumoto.3o3@gmail.com', 'nexpure.event@gmail.com', 'admin@pokeka.local'].includes(email)) {
                        setIsAdmin(true)
                    }

                    // Fetch Profile Limits (Phase 26)
                    const profileResult = await getOrCreateProfileAction(session.user.id)
                    if (profileResult.success && profileResult.profile) {
                        setMaxDecks(profileResult.profile.max_decks)
                        setMaxMatches(profileResult.profile.max_matches)
                        setUserPlan(profileResult.profile.plan_type)
                    }

                    // Fetch Counts (Updated: Count Total Decks regardless of folder, ignore folders count)
                    const { count: totalDeckCount } = await supabase
                        .from('decks')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', session.user.id)

                    const { count: mCount } = await supabase
                        .from('matches')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', session.user.id)

                    setDeckCount(totalDeckCount || 0)
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

        // Count Total Decks
        const { count: dCount } = await supabase
            .from('decks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        const { count: mCount } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        setDeckCount(dCount || 0)
        setMatchCount(mCount || 0)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <div className="text-gray-600 text-xl font-medium">読み込み中...</div>
            </div>
        )
    }

    if (!userId) return null

    // Helper for limits
    const isDeckLimitReached = !isAdmin && deckCount >= maxDecks

    const getDeckUsageColor = () => {
        if (isAdmin) return 'text-purple-600 bg-purple-50'
        if (deckCount >= maxDecks) return 'text-red-600 bg-red-50'
        if (deckCount >= maxDecks - 2) return 'text-yellow-600 bg-yellow-50'
        return 'text-green-600 bg-green-50'
    }

    return (
        <div className="min-h-screen bg-pink-50">
            <nav className="bg-white border-b-2 border-pink-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 md:h-16">
                        <div className="flex overflow-x-auto no-scrollbar items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-base md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 mr-2 md:mr-8 whitespace-nowrap">
                                    ポケカ戦績
                                </span>
                            </div>
                            <div className="flex space-x-1 md:space-x-8 items-center whitespace-nowrap">
                                <button
                                    onClick={() => setActiveTab('decks')}
                                    className={`inline-flex items-center px-2 py-1 md:px-1 md:pt-1 border-b-2 text-xs md:text-sm font-medium transition ${activeTab === 'decks'
                                        ? 'border-pink-500 text-gray-900 bg-pink-50 md:bg-transparent rounded-md md:rounded-none'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    デッキ管理
                                </button>
                                {/* History Tab Removed */}
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`inline-flex items-center px-2 py-1 md:px-1 md:pt-1 border-b-2 text-xs md:text-sm font-medium transition ${activeTab === 'analytics'
                                        ? 'border-pink-500 text-gray-900 bg-pink-50 md:bg-transparent rounded-md md:rounded-none'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    戦績分析
                                </button>
                                <button
                                    onClick={() => setActiveTab('reference')}
                                    className={`inline-flex items-center px-2 py-1 md:px-1 md:pt-1 border-b-2 text-xs md:text-sm font-medium transition ${activeTab === 'reference'
                                        ? 'border-pink-500 text-gray-900 bg-pink-50 md:bg-transparent rounded-md md:rounded-none'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    参考デッキ
                                </button>
                                <Link
                                    href="/practice"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 my-1 border border-transparent text-xs md:text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition ml-2 shadow-sm"
                                >
                                    🎮 一人回し
                                </Link>
                                {isAdmin && (
                                    <button
                                        onClick={() => setActiveTab('articles')}
                                        className={`inline-flex items-center px-2 py-1 md:px-1 md:pt-1 border-b-2 text-xs md:text-sm font-medium transition ${activeTab === 'articles'
                                            ? 'border-purple-500 text-purple-900 bg-purple-50 md:bg-transparent rounded-md md:rounded-none'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        記事管理
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center ml-2 md:ml-4 flex-shrink-0">
                            {/* Usage Counter (Mobile/Desktop) */}
                            <div className={`hidden md:flex items-center px-3 py-1 rounded-full text-xs font-bold mr-4 ${getDeckUsageColor()}`}>
                                <span className="mr-1">🔥</span>
                                {isAdmin ? '無制限' : `デッキ: ${deckCount}/${maxDecks}`}
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="text-xs md:text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap px-2 py-1 bg-gray-100 rounded md:bg-transparent"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Usage Counter */}
            <div className="md:hidden bg-white border-b border-pink-100 px-4 py-2 flex justify-end">
                <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold ${getDeckUsageColor()}`}>
                    <span className="mr-1">🔥</span>
                    {isAdmin ? '無制限' : `デッキ: ${deckCount}/${maxDecks}`}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Invitation Banner (Shown only for Free Plan Users) */}
                        {userPlan === 'free' && (
                            <div className="bg-white rounded-xl p-4 border-2 border-purple-100 shadow-sm">
                                <InvitationCodeInput
                                    userId={userId}
                                    onSuccess={() => {
                                        // Update local state to reflect upgrade immediately
                                        setUserPlan('invited')
                                        setMaxDecks(20)
                                        setMaxMatches(500)
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'decks' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-pink-200 shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg md:text-xl font-bold text-gray-900">登録済みデッキ</h2>
                                        <button
                                            onClick={() => setIsAddDeckModalOpen(true)}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 mr-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
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
                                            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-200">
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
                                    userEmail === 'player2@pokeka.local' ||
                                    userEmail === 'player3@pokeka.local' ||
                                    isAdmin) && (
                                        <>
                                            <EnvironmentManager userEmail={userEmail} />
                                            <div className="bg-white rounded-2xl p-6 border-2 border-orange-100 shadow-sm mt-8">
                                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                                    <span className="bg-orange-100 p-2 rounded-lg mr-2">📊</span>
                                                    デッキ管理 (分析 & 参考デッキ)
                                                </h2>
                                                <AnalyticsManager userId={userId} />
                                            </div>
                                        </>
                                    )}

                                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-pink-200 shadow-sm">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">参考デッキ一覧</h2>
                                    <ReferenceDeckList userId={userId} userEmail={userEmail} />
                                </div>

                                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-orange-100 shadow-sm">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <span className="bg-orange-100 p-1.5 rounded-lg mr-2 text-base">🔑</span>
                                        キーカード採用率
                                    </h2>
                                    <KeyCardAdoptionList />
                                </div>
                            </div>
                        )}

                        {activeTab === 'articles' && isAdmin && (
                            <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-pink-200 shadow-sm">
                                <ArticleManager />
                            </div>
                        )}

                        {/* Mobile Ad Slot (Visible only on mobile) */}
                        <div className="lg:hidden mt-8 space-y-6">
                            {/* Mobile Article List */}
                            <div className="mb-6">
                                <a
                                    href="https://shopa.jp/9293M3MEXQ2Z"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full hover:opacity-90 transition-opacity mb-4"
                                >
                                    <img
                                        src="/ad_sponsor_toyger.png"
                                        alt="サプライ買うならTOYGER"
                                        className="w-full h-auto rounded-xl shadow-sm border border-gray-100"
                                        loading="lazy"
                                    />
                                </a>
                                <SideArticleList />
                            </div>
                            <AdPlaceholder slot="mobile-bottom" label="Sponsored" />
                        </div>
                    </div>

                    {/* Sidebar Column (Visible only on Desktop) */}
                    <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24">
                        {/* Sidebar Article List (Top Priority) */}
                        <div className="mb-6">
                            <a
                                href="https://shopa.jp/9293M3MEXQ2Z"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full hover:opacity-90 transition-opacity mb-4"
                            >
                                <img
                                    src="/ad_sponsor_toyger.png"
                                    alt="サプライ買うならTOYGER"
                                    className="w-full h-auto rounded-xl shadow-sm border border-gray-100"
                                    loading="lazy"
                                />
                            </a>
                            <SideArticleList />
                        </div>

                        <AdPlaceholder slot="sidebar-top" label="Sponsored" className="min-h-[300px]" />
                        <AdPlaceholder slot="sidebar-bottom" label="Sponsored" className="min-h-[300px]" />

                        <div className="bg-white rounded-xl p-4 border border-pink-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-2">お知らせ</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                ベータ版をご利用いただきありがとうございます。不具合やご要望は開発者までご連絡ください。
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
