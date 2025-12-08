'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import DeckList from '@/components/DeckList'
import AddDeckForm from '@/components/AddDeckForm'
import MatchHistory from '@/components/MatchHistory'
import ReferenceDeckManager from '@/components/ReferenceDeckManager'
import ReferenceDeckList from '@/components/ReferenceDeckList'
import Footer from '@/components/Footer'

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'register' | 'decks' | 'history' | 'reference'>('decks')
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth')
            } else {
                setUser(session.user)
            }
            setLoading(false)
        }

        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/auth')
            } else {
                setUser(session.user)
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <div className="text-white text-xl">読み込み中...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">⚡ ポケカ戦績</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-300">{user?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg border border-red-500/30 transition"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'register'
                            ? 'bg-white text-purple-900 shadow-lg'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        デッキ登録
                    </button>
                    <button
                        onClick={() => setActiveTab('decks')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'decks'
                            ? 'bg-white text-purple-900 shadow-lg'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        デッキ一覧
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'history'
                            ? 'bg-white text-purple-900 shadow-lg'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        戦績履歴
                    </button>
                    <button
                        onClick={() => setActiveTab('reference')}
                        className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'reference'
                            ? 'bg-white text-purple-900 shadow-lg'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        参考デッキ
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'register' ? (
                    <AddDeckForm userId={user?.id || ''} />
                ) : activeTab === 'decks' ? (
                    <DeckList userId={user?.id || ''} />
                ) : activeTab === 'history' ? (
                    <MatchHistory userId={user?.id || ''} />
                ) : (
                    <div className="space-y-6">
                        <ReferenceDeckManager userEmail={user?.email || ''} />
                        <ReferenceDeckList userId={user?.id || ''} userEmail={user?.email || ''} />
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
