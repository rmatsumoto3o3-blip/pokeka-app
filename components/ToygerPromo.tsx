import Link from 'next/link'

// TOYGER（カードサプライ）のアフィリエイト商品カード。1カード＝1商品。
// アフィリID 9293M3MEXQ2Z は公開前提のトラッキングID。
// ステマ規制（景表法）対応のため「PR」表記は必須。外すと違法になるので消さないこと。
// Googleのガイドライン上、アフィリリンクには rel="sponsored" が必要。
const AFFILIATE_BASE = 'https://c.affitch.com/9293M3MEXQ2Z/?url='

const PRODUCTS = {
    sleeve: {
        name: 'スリーブ',
        image: 'https://toyger.shop/cdn/shop/files/IMG_9153_3000x.jpg?v=1689919752',
        href: `${AFFILIATE_BASE}/collections/%E3%82%B9%E3%83%AA%E3%83%BC%E3%83%96/products/4580645821360?variant=44616898412842&utm_source=pokelix.jp`,
    },
    deckCase: {
        name: 'デッキケース',
        image: 'https://toyger.shop/cdn/shop/files/hj2_97816_3000x.jpg?v=1732685607',
        href: `${AFFILIATE_BASE}/collections/%E3%83%87%E3%83%83%E3%82%AD%E3%82%B1%E3%83%BC%E3%82%B9-%E3%82%AB%E3%83%BC%E3%83%89%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B8/products/4580645822053?variant=49514503143722&utm_source=pokelix.jp`,
    },
} as const

export default function ToygerPromo({ product }: { product: keyof typeof PRODUCTS }) {
    const item = PRODUCTS[product]

    return (
        <Link
            href={item.href}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="group block overflow-hidden rounded-lg border border-[#e2e8f0] bg-white transition hover:border-blue-400"
        >
            <div className="flex items-center justify-between bg-slate-800 px-3 py-2.5">
                <span className="text-xs font-semibold text-white">{item.name}</span>
                <span className="text-[10px] leading-none text-gray-300 border border-gray-500 rounded px-1.5 py-1">PR</span>
            </div>
            <div className="aspect-[4/3] overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
            </div>
            <div className="px-3 py-2 text-[11px] font-semibold text-blue-600">
                TOYGERで見る →
            </div>
        </Link>
    )
}
