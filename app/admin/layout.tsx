import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const ADMIN_EMAILS = [
        'player1@pokeka.local',
        'player2@pokeka.local',
        'player3@pokeka.local',
        'r.matsumoto.3o3@gmail.com',
        'nexpure.event@gmail.com',
        'admin@pokeka.local'
    ]

    if (!session || !session.user || !session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        管理者ダッシュボード
                    </h1>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
