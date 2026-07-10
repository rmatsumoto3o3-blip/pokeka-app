import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
    title: '管理者の遊び場 | PokéLix',
    description: '管理者が作ったゲームを公開しています。',
}

const games = [
    {
        title: '将棋 - SHOGI PROTOCOL',
        description: '5×5盤によるスピード感あふれる超高速対局に、一発逆転を可能にする「電脳スキル（ハック）」を融合。瞬時の判断と大逆転の駆け引きを楽しめます。',
        href: 'https://shogi.pokelix.jp/',
        thumbnail: '/shogi-thumbnail.png',
    },
    {
        title: 'Dungeon Run',
        description: '死ぬまで階層を登り続けるエンドレス型のドット絵ダンジョン探索ゲーム。鍵を持つモンスターを倒して次の階層へ進み、宝箱やGoldを集めながらどこまで深く進めるかを競います。',
        href: 'https://dungeon.pokelix.jp/',
        thumbnail: '/dungeonrun.png',
    },
    {
        title: 'O-TCG Pocket',
        description: 'ポケカポケットの情報サイト',
        href: 'https://otcg.pokelix.jp/',
        thumbnail: null,
    },
]

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <PublicHeader />
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">管理者の遊び場</h1>
                <p className="text-gray-500 text-sm mb-10">管理者が作ったゲームを公開しています。</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {games.map((game) => (
                        <a
                            key={game.href}
                            href={game.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                            {game.thumbnail && (
                                <div className="relative w-full aspect-video">
                                    <Image src={game.thumbnail} alt={game.title} fill className="object-cover" unoptimized />
                                </div>
                            )}
                            <div className="p-5">
                                <div className="font-bold text-gray-900 mb-1">{game.title}</div>
                                <div className="text-sm text-gray-500">{game.description}</div>
                            </div>
                        </a>
                    ))}
                </div>
                <div className="mt-10">
                    <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition">← TOPに戻る</Link>
                </div>
            </div>
            <Footer />
        </div>
    )
}
