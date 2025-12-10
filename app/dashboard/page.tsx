'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AddDeckForm from '@/components/AddDeckForm'
import AddMatchForm from '@/components/AddMatchForm'
import MatchHistory from '@/components/MatchHistory'
import DeckList from '@/components/DeckList'
import ReferenceDeckList from '@/components/ReferenceDeckList'
import ReferenceDeckManager from '@/components/ReferenceDeckManager'
import AdPlaceholder from '@/components/AdPlaceholder'
import Footer from '@/components/Footer'

export default function Dashboard() {
    const [userId, setUserId] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string>('')
    const [activeTab, setActiveTab] = useState('decks') // decks, history, add_deck, reference
    const [loading, setLoading] = useState(true)

    // Usage Limits
    const [deckCount, setDeckCount] = useState(0)
    const [matchCount, setMatchCount] = useState(0)
    const [isAdmin, setIsAdmin] = useState(false)
    const MAX_DECKS = 5
    const MAX_MATCHES = 100

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
                    if (['player1@pokeka.local', 'player2@pokeka.local', 'player3@pokeka.local'].includes(email)) {
                        setIsAdmin(true)
                    }

                    // Fetch Counts
                    const { count: dCount } = await supabase
                        .from('decks')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', session.user.id)

                    const { count: mCount } = await supabase
                        .from('matches')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', session.user.id)

                    setDeckCount(dCount || 0)
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
        const { count: dCount } = await supabase.from('decks').select('*', { count: 'exact', head: true }).eq('user_id', userId)
        const { count: mCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('user_id', userId)
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
    const isDeckLimitReached = !isAdmin && deckCount >= MAX_DECKS
    // const isMatchLimitReached = !isAdmin && matchCount >= MAX_MATCHES // Passed to children

    const getDeckUsageColor = () => {
        if (isAdmin) return 'text-purple-600 bg-purple-50'
        if (deckCount >= MAX_DECKS) return 'text-red-600 bg-red-50'
        if (deckCount >= MAX_DECKS - 1) return 'text-yellow-600 bg-yellow-50'
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
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`inline-flex items-center px-2 py-1 md:px-1 md:pt-1 border-b-2 text-xs md:text-sm font-medium transition ${activeTab === 'history'
                                        ? 'border-pink-500 text-gray-900 bg-pink-50 md:bg-transparent rounded-md md:rounded-none'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    戦績履歴
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
                            </div>
                        </div>
                        <div className="flex items-center ml-2 md:ml-4 flex-shrink-0">
                            {/* Usage Counter (Mobile/Desktop) */}
                            <div className={`hidden md:flex items-center px-3 py-1 rounded-full text-xs font-bold mr-4 ${getDeckUsageColor()}`}>
                                <span className="mr-1">🔥</span>
                                {isAdmin ? '無制限' : `デッキ: ${deckCount}/${MAX_DECKS}`}
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
                    {isAdmin ? '無制限' : `デッキ: ${deckCount}/${MAX_DECKS}`}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Main Content Column */}
                    <div className="lg:col-span-3 space-y-6">
                        {activeTab === 'decks' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-pink-200 shadow-sm">
                                    <AddDeckForm
                                        userId={userId}
                                        onSuccess={() => {
                                            setActiveTab('decks')
                                            refreshCounts()
                                        }}
                                        isLimitReached={isDeckLimitReached}
                                        deckCount={deckCount}
                                        maxDecks={MAX_DECKS}
                                    />
                                </div>
                                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-pink-200 shadow-sm">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">使用デッキ一覧</h2>
                                    <DeckList
                                        userId={userId}
                                        matchCount={matchCount}
                                        maxMatches={MAX_MATCHES}
                                        isMatchLimitReached={!isAdmin && matchCount >= MAX_MATCHES}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-pink-200 shadow-sm">
                                <MatchHistory userId={userId} />
                            </div>
                        )}

                        {activeTab === 'reference' && (
                            <div className="space-y-6">
                                {/* Admin Only: Manager Form */}
                                {(userEmail === 'player1@pokeka.local' ||
                                    userEmail === 'player2@pokeka.local' ||
                                    userEmail === 'player3@pokeka.local') && (
                                        <ReferenceDeckManager userEmail={userEmail} />
                                    )}

                                <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-pink-200 shadow-sm">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">参考デッキ一覧</h2>
                                    <ReferenceDeckList userId={userId} userEmail={userEmail} />
                                </div>
                            </div>
                        )}

                        {/* Mobile Ad Slot (Visible only on mobile) */}
                        <div className="lg:hidden mt-8">
                            <AdPlaceholder slot="mobile-bottom" label="Sponsored" />
                        </div>
                    </div>

                    {/* Sidebar Column (Visible only on Desktop) */}
                    <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24">
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
