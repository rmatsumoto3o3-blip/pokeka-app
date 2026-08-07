import Link from 'next/link'

// ツール間の内部リンク導線。評価が集まりにくい /simulator 等へ相互リンクを通す（SEO内部リンク強化）。
const TOOLS = [
    { href: '/practice', emoji: '🎴', title: 'ポケカ 一人回し練習', desc: 'デッキを実戦形式で回して事故率・展開をチェック' },
    { href: '/simulator', emoji: '🔢', title: '初手確率シミュレーター', desc: '初手・サイド落ち確率を10万回シミュレーション' },
    { href: '/decks', emoji: '🏆', title: '環境・優勝デッキ一覧', desc: '大会入賞デッキのレシピとデッキコード' },
    { href: '/archetypes', emoji: '📊', title: '採用率ランキング', desc: '環境デッキの使用率と採用カードを集計' },
]

export default function RelatedTools({ exclude, className = '' }: { exclude?: string; className?: string }) {
    const items = TOOLS.filter(t => t.href !== exclude)
    return (
        <section className={`max-w-4xl mx-auto px-4 mt-12 ${className}`}>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-500 rounded-full" />関連ツール
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(t => (
                    <Link
                        key={t.href}
                        href={t.href}
                        className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition"
                    >
                        <span className="text-2xl leading-none">{t.emoji}</span>
                        <div>
                            <p className="font-bold text-gray-900">{t.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
