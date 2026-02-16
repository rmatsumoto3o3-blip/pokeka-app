import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-black/20 border-t border-white/10 mt-12">
            <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5 py-2.5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-600 text-sm font-medium">
                        © 株式会社3O3 / Rii
                    </div>

                    <div className="flex gap-6 text-sm">
                        <Link
                            href="/beta-terms"
                            className="text-gray-700 hover:text-gray-900 transition font-medium"
                        >
                            ベータテスター募集
                        </Link>
                        <Link
                            href="/guide"
                            className="text-gray-700 hover:text-gray-900 transition font-medium"
                        >
                            活用ガイド
                        </Link>
                        <Link
                            href="/terms"
                            className="text-gray-700 hover:text-gray-900 transition font-medium"
                        >
                            利用規約
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-gray-700 hover:text-gray-900 transition font-medium"
                        >
                            プライバシーポリシー
                        </Link>
                        <Link
                            href="/contact"
                            className="text-gray-700 hover:text-gray-900 transition flex items-center gap-1 font-medium"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            お問い合わせ
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
