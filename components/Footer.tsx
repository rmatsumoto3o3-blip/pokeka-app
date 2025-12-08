export default function Footer() {
    return (
        <footer className="bg-black/20 border-t border-white/10 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-400 text-sm">
                        © 2025 ポケカ戦績管理. All rights reserved.
                    </div>

                    <div className="flex gap-6 text-sm">
                        <a
                            href="/privacy"
                            className="text-gray-400 hover:text-white transition"
                        >
                            プライバシーポリシー
                        </a>
                        <a
                            href="/contact"
                            className="text-gray-400 hover:text-white transition"
                        >
                            お問い合わせ
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
