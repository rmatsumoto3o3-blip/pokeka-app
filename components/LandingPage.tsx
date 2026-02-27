'use client'

// useState removed as unused per lint
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import ReferenceDeckList from '@/components/ReferenceDeckList'
import KeyCardAdoptionList from '@/components/KeyCardAdoptionList'
import DeckDistributionChart from '@/components/DeckDistributionChart'
import FeaturedCardTrends from '@/components/FeaturedCardTrends'
import CardSearchAnalysis from '@/components/CardSearchAnalysis'
import type { ReferenceDeck, DeckArchetype, Article } from '@/lib/supabase'

import PublicHeader from '@/components/PublicHeader'

interface LandingPageProps {
    decks: ReferenceDeck[]
    archetypes: DeckArchetype[]
    articles: Article[]
}

export default function LandingPage({ decks, archetypes, articles }: LandingPageProps) {
    const router = useRouter()

    // Color Change Only: White base, Pop borders
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative pt-2.5 pb-2.5 md:pt-2.5 md:pb-2.5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-purple-100/50 to-blue-100/50 z-0" />
                <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5 relative z-10 text-center">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white border border-pink-200 text-pink-600 text-sm font-semibold shadow-sm animate-fade-in-up">
                        ✨ 勝つための情報が集まる場所
                    </div>
                    <h1 className="font-extrabold text-gray-900 tracking-tight mb-6 animate-fade-in-up delay-100">
                        <span className="block text-base sm:text-xl md:text-2xl mb-2 text-gray-600">ポケモンカード情報局</span>
                        <div className="flex items-center justify-center gap-2 md:gap-4 py-2">
                            <span className="text-4xl sm:text-5xl md:text-7xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 font-[family-name:var(--font-press-start-2p)]">
                                PokéLix
                            </span>
                            <Image
                                src="/genger.png"
                                alt="Gengar"
                                width={60}
                                height={60}
                                className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain -mb-2"
                            />
                        </div>
                    </h1>
                    <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200 px-2">
                        環境考察、優勝デッキ情報。<br className="hidden sm:block" />
                        あなたのポケカライフを充実させる機能がここに。<br className="hidden sm:block" />
                        <span className="font-bold text-pink-600 block sm:inline mt-1 sm:mt-0">シミュレーションでデッキを分析</span>
                    </p>
                    <div className="flex flex-col items-center gap-4 animate-fade-in-up delay-300">
                        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl px-2 sm:px-0">
                            {/* Row 1 */}
                            <a
                                href="#key-card-adoption"
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm sm:text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center py-4"
                            >
                                カード採用率
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </a>
                            <a
                                href="#reference-decks"
                                className="bg-white text-gray-700 font-bold text-sm sm:text-lg border-2 border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all duration-200 shadow-sm rounded-xl flex items-center justify-center py-4"
                            >
                                参考デッキを探す
                            </a>

                            {/* Row 2 */}
                            <Link
                                href="/practice"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-sm sm:text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 py-4"
                            >
                                <Image
                                    src="/Lucario.png"
                                    alt="Practice"
                                    width={24}
                                    height={24}
                                    className="w-5 h-5 sm:w-6 sm:h-6 filter brightness-0 invert"
                                />
                                一人回し
                            </Link>
                            <Link
                                href="/simulator"
                                className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold text-sm sm:text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 py-4"
                            >
                                <Image
                                    src="/king.png"
                                    alt="Simulator"
                                    width={24}
                                    height={24}
                                    className="w-5 h-5 sm:w-6 sm:h-6 filter brightness-0 invert"
                                />
                                確率シミュ
                            </Link>

                            {/* Row 3 */}
                            <Link
                                href="/global-simulator"
                                className="px-4 py-2.5 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl font-bold text-xs sm:text-sm shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-1"
                            >
                                🌎 Global Sim
                            </Link>
                            <Link
                                href="/practice/prize-trainer"
                                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-slate-800 transition-all duration-200 flex items-center justify-center gap-1"
                            >
                                🏆 サイド推論
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference Decks Section (Public Preview) */}
            <section className="py-2.5 bg-white">
                <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        {/* TOYGER Ad */}
                        <div className="flex flex-col items-center w-full max-w-sm">
                            <span className="text-xs text-gray-400 mb-1">PR: サプライ買うならTOYGER</span>
                            <a
                                href="https://shopa.jp/9293M3MEXQ2Z"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full hover:opacity-90 transition-opacity"
                            >
                                <Image
                                    src="/ad_sponsor_toyger.png"
                                    alt="サプライ買うならTOYGER"
                                    width={400}
                                    height={150}
                                    className="w-full h-auto rounded-lg shadow-sm border border-gray-100"
                                />
                            </a>
                        </div>
                        {/* Dot Picture Promotion */}
                        <div className="flex flex-col items-center w-full max-w-sm">
                            <span className="text-xs text-gray-400 mb-1">PR: ドット絵ご提供者様(下記タップでXへ)</span>
                            <a
                                href="https://twitter.com/komori541milk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-[94%] hover:opacity-90 transition-opacity cursor-pointer mx-auto"
                            >
                                <Image
                                    src="/dotpicture.png"
                                    alt="ドット絵ご提供者様"
                                    width={1715}
                                    height={589}
                                    className="w-full h-auto rounded-lg shadow-sm border border-gray-100"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reference Decks Section (Public Preview) */}
            <section id="reference-decks" className="py-2.5 md:py-2.5 bg-white">
                <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5">
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Image
                                src="/victory.png"
                                alt="victory"
                                width={36}
                                height={36}
                                className="w-7 h-7 md:w-9 md:h-9"
                            />
                            環境・優勝デッキ集
                        </h2>
                        <p className="text-gray-600 mt-2">大会で結果を残している強力なデッキレシピをチェック</p>
                    </div>
                    {/* Unified Reference Deck List */}
                    <div className="bg-white rounded-2xl border-2 border-pink-100 shadow-sm p-2.5 md:p-2.5">
                        <ReferenceDeckList
                            initialDecks={decks}
                            initialArchetypes={archetypes}
                        />
                    </div>

                    {/* Featured Card Trends (Mid-Section) */}
                    <div className="mt-8">
                        <FeaturedCardTrends />
                    </div>

                    {/* Environment Analytics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {/* Deck Distribution Chart */}
                        <div id="deck-distribution">
                            <div className="mb-4">
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Image
                                        src="/Alakazam.png"
                                        alt="Alakazam"
                                        width={36}
                                        height={36}
                                        className="w-7 h-7 md:w-9 md:h-9"
                                    />
                                    環境デッキ分布
                                </h3>
                                <p className="text-gray-600 mt-1">登録されている参考デッキのシェア率</p>
                            </div>
                            <div className="bg-white rounded-2xl border-2 border-purple-100 shadow-sm p-2.5 md:p-2.5">
                                <DeckDistributionChart decks={decks} archetypes={archetypes} />
                            </div>
                        </div>

                        {/* Card Search Analysis [NEW] */}
                        <div className="h-full">
                            <CardSearchAnalysis initialArchetypes={archetypes} />
                        </div>
                    </div>

                    <div className="mt-8" id="key-card-adoption">
                        <div className="mb-4">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Image
                                    src="/Klefki.png"
                                    alt="Klefki"
                                    width={36}
                                    height={36}
                                    className="w-7 h-7 md:w-9 md:h-9"
                                />
                                キーカード採用率
                            </h3>
                            <p className="text-gray-600 mt-1">環境デッキで採用されているカードの採用枚数を確認</p>
                        </div>
                        <div className="bg-white rounded-2xl border-2 border-pink-100 shadow-sm p-2.5 md:p-2.5">
                            <KeyCardAdoptionList initialArchetypes={archetypes} />
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Usage Guide Section */}
            <section className="py-2.5 bg-pink-50/50 overflow-hidden border-t border-b border-pink-100">
                <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5">
                    <div className="text-center mb-12">
                        <span className="text-pink-500 font-bold tracking-wider uppercase text-sm">How to Use</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
                            PokeLixの活用方法
                        </h2>
                        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                            デッキの登録から戦績管理まで、3ステップであなたのポケカライフをサポートします。
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 transform -translate-y-1/2 z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            {/* Step 1 */}
                            <div className="bg-white p-2.5 rounded-2xl border-2 border-pink-100 shadow-lg hover:shadow-xl transition-shadow text-center group">
                                <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                    📋
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">1. デッキを登録</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    公式のエディタで作成した「デッキコード」を入力するだけ。<br />
                                    カード画像ごと一瞬で保存できます。
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white p-2.5 rounded-2xl border-2 border-purple-100 shadow-lg hover:shadow-xl transition-shadow text-center group">
                                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Image
                                        src="/Alakazam.png"
                                        alt="Alakazam"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">2. 分析・カスタマイズ</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    「キーカード採用率」を見ながらデッキを調整。<br />
                                    自分だけの最強構築を作り上げましょう。
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white p-2.5 rounded-2xl border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow text-center group">
                                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                    ⚔️
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3. 戦績を記録</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    対戦結果をサクサク記録。<br />
                                    「どのデッキに勝てるか」がグラフで可視化されます。
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-10">
                            <Link
                                href="/guide"
                                className="inline-flex items-center text-purple-600 font-bold hover:text-purple-800 transition-colors text-lg"
                            >
                                詳しい使い方はこちら <span className="ml-2">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Articles Carousel Section */}
            <section className="py-2.5 bg-white">
                <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                            🔥 最新のピックアップ記事
                        </h2>
                        <Link href="/articles" className="text-pink-600 font-semibold hover:underline">
                            すべて見る &rarr;
                        </Link>
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="flex overflow-x-auto pb-8 -mx-4 px-4 space-x-6 no-scrollbar snap-x snap-mandatory">
                        {articles.map((article) => (
                            <Link
                                href={`/articles/${article.slug}`}
                                key={article.id}
                                className="flex-none snap-center w-[300px] md:w-[350px] bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                            >
                                <div className="aspect-video w-full relative">
                                    {article.thumbnail_url ? (
                                        <Image
                                            src={article.thumbnail_url}
                                            alt={article.title}
                                            width={350}
                                            height={197}
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-4xl">
                                            📝
                                        </div>
                                    )}
                                </div>
                                <div className="p-2.5">
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {article.excerpt}
                                    </p>
                                    <div className="mt-4 flex items-center text-xs text-gray-500">
                                        <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                                        <span className="mx-2">•</span>
                                        <span className="text-pink-500 font-medium">読む</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>



            {/* NEW: Environment Commentary Section for SEO/Value */}
            <section className="py-16 bg-gradient-to-b from-white to-pink-50/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-8 md:p-12 rounded-3xl border border-pink-100 shadow-sm">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-pink-100 pb-4">
                            なぜ今、ポケカに「データ分析」が必要なのか？
                        </h2>

                        <div className="space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
                            <div className="space-y-4">
                                <p>
                                    ポケモンカードゲームの魅力は、単なる運だけでなく、緻密なリソース管理とプレイング、<br />
                                    そして何より「デッキ構築の深さ」にあります。<br />
                                    しかし、現代のポケカシーンでは、<br />
                                    SNS上で「Tier 1」とされる有力なデッキレシピが一瞬で拡散され、<br />
                                    誰もが同じ結論に辿り着きやすい状況（環境の固定化）が生まれています。
                                </p>
                                <p>
                                    このような情報過多の時代において、<br />
                                    他のプレイヤーと差をつけるために必要なのは、<br />他人のレシピをコピーすることではなく、<br />
                                    「なぜその60枚なのか」を自分自身のデータで裏付けることです。<br />
                                    真似することが悪いのではなく、<br />
                                    そのデッキの強さの根拠を理解することが勝利の鍵であると<br />
                                    私は思います。
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                                    <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded text-sm">Case 1</span>
                                    「感覚的相性」を「数値的根拠」へ
                                </h3>
                                <p>
                                    「このデッキ相手は少し不利かも…」という曖昧な感覚。<br />
                                    これを具体的なデータに変えるのが分析の第一歩です。<br />
                                    PokéLixで対戦記録を積み重ねることで、<br />
                                    「後攻時の勝率は40%だが、先攻なら55%ある」<br />
                                    「特定のサブアタッカーを引けた試合の勝率は70%を超える」といった事実が見えてきます。<br />
                                    「なんとなく」を「確信」に変えることで、<br />
                                    大会当日の緊張感の中でも迷いのないプレイングが可能になります。
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                                    <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded text-sm">Case 2</span>
                                    0.1%の事故率を削り出す、数学的アプローチ
                                </h3>
                                <p>
                                    「なかよしポフィン」や「ネストボール」の枚数、あるいはエネルギーの枚数。<br />
                                    これらを1枚増減させることが、初手の展開率にどれだけ影響するか。<br />
                                    直感に頼らず「確率シミュレーション」を活用したデッキチューニングを推奨しています。<br />
                                    例えば、60枚デッキに特定のカードを4枚採用した場合、<br />
                                    初手7枚（＋最初のドロー1枚）の中にそのカードが含まれる確率は約44.5%です。<br />
                                    これを「サイド落ち」まで考慮して計算し、<br />
                                    プランを構築できるかどうかが、トッププレイヤーへの分かれ道となります。<br />
                                    「理想盤面の完成確率」を1%でも高める努力。<br />
                                    その積み重ねが、大型大会での予選突破を左右する大きな一歩となります。
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-sm">Case 3</span>
                                    練習を「効率化」し、時間を資産に変える
                                </h3>
                                <p>
                                    仕事や学業で忙しいプレイヤーにとって、物理的なカードを広げて対戦する時間は限られています。<br />
                                    PokéLixの「一人回しシミュレーター」や「採用率分析」は、<br />
                                    隙間時間での「脳内対戦」を強力にサポートします。<br />
                                    統計的に正しい「キーカード採用率」を参考にしながら、<br />
                                    メタゲームに合わせた自分だけの60枚を組み上げる。<br />
                                    「思考の量」を「勝利の質」へ直結させるためのプラットフォームが、ここにあります。
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 md:p-8 rounded-2xl border border-pink-100 mt-12">
                                <p className="text-pink-900 font-bold mb-4">
                                    「勝てる喜びを、もっと理論的に。」
                                </p>
                                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                                    PokéLixは、データに基づき勝利を目指すすべてのトレーナーに伴走します。<br />
                                    あなたが積み上げる対戦記録の一行一行が、明日のポケカ文化を形作り、勝利へ導く地図となります。<br />
                                    さあ、あなたのポケカライフに「分析」という新たな武器を取り入れてみませんか？
                                </p>
                            </div>
                        </div>
                    </div>
                </div >
            </section >
            {/* NEW: Prize Trainer Usage Guide */}
            <section className="py-20 bg-slate-900 overflow-hidden relative">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-pink-500/20 px-4 py-2 rounded-full border border-pink-500/30 mb-6">
                            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                            <span className="text-pink-400 font-black tracking-widest uppercase text-xs">New Practice Tool</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mt-2 tracking-tight">
                            サイド確認練習ツール<br className="md:hidden" /> (Prize Trainer) の使い方
                        </h2>
                        <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            「サイド落ち」の把握はトッププレイヤーへの必須条件。<br />
                            山札と手札から、サイドにある6枚を瞬時に見抜く力を養いましょう。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {/* Step 1 */}
                        <div className="bg-slate-800/40 backdrop-blur-md p-10 rounded-[40px] border border-slate-700/50 hover:border-pink-500/50 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-8xl font-black text-slate-700/10 pointer-events-none">1</div>
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500 shadow-xl">
                                ⌨️
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">デッキコードを入力</h3>
                            <p className="text-slate-400 leading-relaxed">
                                公式デッキエディタのコードを入力して開始。<br />
                                自分の今のデッキを使って、実戦さながらのサイド落ちを再現します。
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-slate-800/40 backdrop-blur-md p-10 rounded-[40px] border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-8xl font-black text-slate-700/10 pointer-events-none">2</div>
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 shadow-xl">
                                🔍
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">サイド落ちを推論</h3>
                            <p className="text-slate-400 leading-relaxed">
                                山札・手札を確認し、サイドにある6枚を予想。モバイルでも使いやすい「なぞり拡大操作」で、素早くカードを確認できます。
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-slate-800/40 backdrop-blur-md p-10 rounded-[40px] border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-8xl font-black text-slate-700/10 pointer-events-none">3</div>
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-xl">
                                ⏱️
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">スコアとタイムを計測</h3>
                            <p className="text-slate-400 leading-relaxed">
                                正解率だけでなく「回答時間」も記録。<br />
                                精度とスピードを同時に磨くことで、限られた対戦時間内の判断力を最大化します。
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/practice/prize-trainer"
                            className="inline-flex items-center px-12 py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-black text-xl hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                        >
                            特訓を開始する
                            <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            <section id="features" className="py-2.5 md:py-2.5 bg-pink-50"> <div className="max-w-7xl mx-auto px-2 sm:px-2.5 lg:px-2.5">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">充実の戦績管理機能</h2>
                    <p className="text-gray-600">シンプルで使いやすい機能が揃っています</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {[
                        {
                            icon: <Image
                                src="/Alakazam.png"
                                alt="Alakazam"
                                width={48}
                                height={48}
                                className="w-12 h-12 mx-auto"
                            />,
                            title: "勝率を自動計算",
                            description: "デッキごとの勝率を自動で計算。相性の良いデッキ、悪いデッキが一目でわかります。"
                        },
                        {
                            icon: "📝",
                            title: "詳細な対戦記録",
                            description: "先攻・後攻、対戦相手のデッキタイプ、サイド差など、細かいデータまで記録可能。"
                        },
                        {
                            icon: "🔍",
                            title: "参考デッキ閲覧",
                            description: "強いプレイヤーのデッキ構築をチェックして、自分のデッキ作りの参考に。"
                        }
                    ].map((feature, index) => (
                        <div key={index} className="bg-white rounded-2xl p-2.5 md:p-2.5 border-2 border-white hover:border-pink-200 transition-all duration-300 shadow-md hover:shadow-xl">
                            <div className="text-4xl md:text-5xl mb-4 md:mb-6">{feature.icon}</div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button
                        onClick={() => router.push('/auth?mode=signup')}
                        className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg rounded-lg font-bold transition shadow-lg hover:shadow-xl"
                    >
                        無料で戦績管理を始める
                    </button>
                </div>

                {/* Global Presence Section */}
                <div className="mt-20 pt-16 border-t border-pink-100">
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
                                <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                                Global Support
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                PokéLixは世界でも活躍
                            </h2>

                            <div className="grid md:grid-cols-2 gap-10 items-center">
                                <div className="space-y-6 text-indigo-100 leading-relaxed">
                                    <p>
                                        現在、PokéLixは日本国内の対戦環境をメインとして、日本語を中心に情報を掲載しています。<br />
                                        しかし、近年では海外からのアクセスも急速に増加しており、世界中のトレーナーから注目を集めるプラットフォームへと進化しています。
                                    </p>
                                    <p>
                                        こうした需要に応えるため、当サイトの「初手確率シミュレーター」は、海外で主流な形式である**PTCGL（Pokémon TCG Live）のテキストデッキコード**を直接読み込み、瞬時に算出できる機能を搭載しました。
                                    </p>
                                    <p>
                                        私たちは、言語の壁を超えて誰もが最高のデータ分析に触れられる環境を目指しています。今後は、海外プレイヤー向けに多言語対応を進め、世界中のポケカファンの架け橋となるサイトを目指してまいります。
                                    </p>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                    <div className="flex items-center gap-3 mb-4 text-pink-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-bold tracking-wider uppercase">Future Vision</span>
                                    </div>
                                    <div className="space-y-4 text-sm italic text-indigo-200/80 leading-relaxed border-l-2 border-pink-500/50 pl-4">
                                        <p>
                                            "While PokéLix currently focuses on the Japanese competitive scene, we have seen a significant increase in international traffic. To support our global community, our simulator is fully compatible with PTCGL deck codes. We are committed to expanding our multi-language support to empower trainers worldwide."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </section>

            <Footer />
        </div>
    )
}
