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
import Footer from '@/components/Footer'

export default function Dashboard() {
    const [userId, setUserId] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string>('')
    const [activeTab, setActiveTab] = useState('decks') // decks, history, add_deck, reference
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            try {
                // Initial session check
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    setUserId(session.user.id)
                    setUserEmail(session.user.email || '')
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
                // If we are logged in, make sure we are not redirected away (unless logic dictates)
            } else {
                setUserId(null)
                setUserEmail('')
                // Only redirect if we finished loading and found no user
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <div className="text-gray-600 text-xl font-medium">読み込み中...</div>
            </div>
        )
    }

    if (!userId) return null

    // Color Change: White base
    return (
        <div className="min-h-screen bg-pink-50">
            <nav className="bg-white border-b-2 border-pink-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex overflow-x-auto">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 mr-4 md:mr-8 whitespace-nowrap">
                                    ポケカ戦績
                                </span>
                            </div>
                            <div className="flex space-x-2 md:space-x-8 items-center whitespace-nowrap">
                                <button
                                    onClick={() => setActiveTab('decks')}
                                    className={`inline-flex items-center px-3 py-2 md:px-1 md:pt-1 border-b-2 text-sm font-medium transition ${activeTab === 'decks'
                                        ? 'border-pink-500 text-gray-900 bg-pink-50 md:bg-transparent rounded-md md:rounded-none'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    デッキ管理
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`inline-flex items-center px-3 py-2 md:px-1 md:pt-1 border-b-2 text-sm font-medium transition ${activeTab === 'history'
                                        ? 'border-pink-500 text-gray-900 bg-pink-50 md:bg-transparent rounded-md md:rounded-none'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    戦績履歴
                                </button>
                                <button
                                    onClick={() => setActiveTab('reference')}
                                    className={`inline-flex items-center px-3 py-2 md:px-1 md:pt-1 border-b-2 text-sm font-medium transition ${activeTab === 'reference'
                                        ? 'border-pink-500 text-gray-900 bg-pink-50 md:bg-transparent rounded-md md:rounded-none'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    参考デッキ
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center ml-4">
                            <span className="hidden md:inline-block text-sm text-gray-500 mr-4">{userEmail}</span>
                            <button
                                onClick={handleSignOut}
                                className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {activeTab === 'decks' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-pink-200 shadow-sm">
                            <AddDeckForm userId={userId} onSuccess={() => setActiveTab('decks')} />
                        </div>
                        <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-pink-200 shadow-sm">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">使用デッキ一覧</h2>
                            <DeckList userId={userId} />
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
            </main>

            <Footer />
        </div>
    )
}
