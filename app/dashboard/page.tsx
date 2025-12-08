'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AddDeckForm from '@/components/AddDeckForm'
import AddMatchForm from '@/components/AddMatchForm'
import MatchHistory from '@/components/MatchHistory'
import DeckList from '@/components/DeckList'
import ReferenceDeckList from '@/components/ReferenceDeckList'
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
            {/* Header / Navigation */}
            <nav className="bg-white border-b-2 border-pink-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-gray-900">
                                <span className="text-pink-500">⚡</span> ポケカ戦績
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 hidden sm:block">
                                {userEmail}
                            </span>
                            <button
                                onClick={handleSignOut}
                                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: 'decks', label: 'デッキ一覧', icon: '🎴' },
                            { id: 'add_deck', label: 'デッキ登録', icon: '➕' },
                            { id: 'history', label: '戦績履歴', icon: '📊' },
                            { id: 'reference', label: '参考デッキ', icon: '📚' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                    flex items-center px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap
                    ${activeTab === tab.id
                                        ? 'bg-pink-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-pink-50 hover:text-pink-500'
                                    }
                  `}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'decks' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 border-2 border-pink-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">使用デッキ一覧</h2>
                            <DeckList userId={userId} />
                        </div>
                    </div>
                )}

                {activeTab === 'add_deck' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl p-6 border-2 border-pink-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">新しいデッキを登録</h2>
                            <AddDeckForm
                                userId={userId}
                                onSuccess={() => setActiveTab('decks')}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">戦績履歴</h2>
                            <MatchHistory userId={userId} />
                        </div>
                    </div>
                )}

                {activeTab === 'reference' && (
                    <div className="space-y-6">
                        <ReferenceDeckList userId={userId} userEmail={userEmail} />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
