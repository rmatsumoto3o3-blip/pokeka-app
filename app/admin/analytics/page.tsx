import { createClient } from '@/utils/supabase/server'
import AnalyticsManager from '@/components/AnalyticsManager'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/')
    }

    // Fetch all archetypes (folders) created by the user (admin)
    // Or fetch ALL archetypes if we want to manage global ones?
    // The user requirement said: "Admin screen only", and keys are "player1", "player2" etc.
    // We should probably fetch archetypes belonging to the current admin user first.
    // Or maybe fetch ALL archetypes in the system? 
    // Given the context ("manage deck types"), it's likely the admin manages their own defined archetypes.

    const { data: archetypes } = await supabase
        .from('user_deck_archetypes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('name', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        デッキ分析 & キーカード集計
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        公式デッキコードから採用率と平均枚数を自動集計します。
                    </p>
                </div>
            </div>

            <AnalyticsManager
                archetypes={archetypes || []}
                userId={session.user.id}
            />
        </div>
    )
}
