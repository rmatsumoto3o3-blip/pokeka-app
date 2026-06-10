import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PublicHeader />

            <main className="flex-grow flex items-center justify-center px-4 py-20">
                <div className="text-center max-w-lg w-full">
                    <div className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                        404
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                        ページが見つかりませんでした
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base mb-8 leading-relaxed">
                        お探しのページは削除されたか、URLが変更された可能性があります。<br className="hidden sm:inline" />
                        下のメニューから目的のページをお探しください。
                    </p>

                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                        <Link
                            href="/"
                            className="col-span-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-lg hover:scale-[1.02] transition-all"
                        >
                            トップページへ戻る
                        </Link>
                        <Link
                            href="/simulator"
                            className="py-3 rounded-xl font-bold text-sm text-gray-700 bg-white border-2 border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all"
                        >
                            確率シミュレーター
                        </Link>
                        <Link
                            href="/practice"
                            className="py-3 rounded-xl font-bold text-sm text-gray-700 bg-white border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
                        >
                            一人回し
                        </Link>
                        <Link
                            href="/#deck-pages"
                            className="py-3 rounded-xl font-bold text-sm text-gray-700 bg-white border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                        >
                            環境デッキ一覧
                        </Link>
                        <Link
                            href="/articles"
                            className="py-3 rounded-xl font-bold text-sm text-gray-700 bg-white border-2 border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-all"
                        >
                            コラム・記事
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
