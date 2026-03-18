import MathLearningTool from '@/components/MathLearningTool'
import Link from 'next/link'

export default function KidsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-orange-600 mb-4 drop-shadow-sm">
                        ポケカで算数
                    </h1>
                    <p className="text-lg md:text-xl text-orange-800 font-bold opacity-80">
                        ポケモンの パワーで、<br className="sm:hidden" />さんすうを もっと たのしく！
                    </p>
                </div>

                <div className="relative">
                    {/* 装飾用の浮遊物 */}
                    <div className="absolute -top-10 -left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-20 blur-xl animate-pulse" />
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-300 rounded-full opacity-20 blur-xl animate-pulse" />
                    
                    <MathLearningTool />
                </div>

                <div className="mt-16 text-center">
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-orange-600 font-black hover:text-orange-700 transition group"
                    >
                        トップページに もどる
                    </Link>
                </div>
            </div>
        </main>
    )
}
