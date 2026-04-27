import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import WeeklyReport from '@/components/WeeklyReport'

export const dynamic = 'force-dynamic'

export default async function WeeklyReportPage() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) redirect('/')

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">週間レポート</h2>
                <p className="mt-1 text-sm text-gray-500">前週比で優勝/準優勝数が伸びたデッキと注目カードの採用率変化</p>
            </div>
            <WeeklyReport />
        </div>
    )
}
