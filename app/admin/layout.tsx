import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyAdminSession } from '@/app/actions'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const admin = await verifyAdminSession()
    if (!admin) {
        redirect('/')
    }

    const navItems = [
        { href: '/admin', label: 'ダッシュボード' },
        { href: '/admin/weekly-report', label: '週間レポート' },
        { href: '/admin/seo-report', label: 'SEOレポート' },
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            管理者ダッシュボード
                        </h1>
                        <nav className="flex gap-1">
                            {navItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
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
