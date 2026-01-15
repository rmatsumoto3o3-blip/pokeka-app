import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-black/20 border-t border-white/10 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                        <a
                            href="https://3o3.tech/?page_id=1581"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900 transition font-medium"
                        >
                            利用規約
                        </a>
                        <a
                            href="https://3o3.tech/?page_id=1575"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900 transition font-medium"
                        >
                            プライバシーポリシー
                        </a>
                        <a
                            href="https://x.com/sakuya_neouni"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900 transition flex items-center gap-1 font-medium"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            お問い合わせ
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
