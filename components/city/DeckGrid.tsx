import type { Card } from '@/lib/city'
import { deckUrl } from '@/lib/city'

const ORDER = ['Pokémon', 'Item', 'Pokémon Tool', 'Supporter', 'Stadium', 'Energy']

// 1デッキの一覧グリッド。公式カード画像を直リンク＋遅延読み込み（サーバー負荷ゼロ）。
export default function DeckGrid({ cards, deckId }: { cards: Card[] | null | undefined; deckId: string }) {
    if (!cards) {
        return (
            <div className="text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-4 text-center">
                デッキ構成を解決中です。
                <a href={deckUrl(deckId)} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold ml-1">公式で見る ↗</a>
            </div>
        )
    }
    const sorted = [...cards].sort(
        (a, b) => ORDER.indexOf(a.supertype) - ORDER.indexOf(b.supertype) || b.quantity - a.quantity,
    )
    return (
        <div className="flex flex-wrap gap-1">
            {sorted.map((c, i) => (
                <div key={i} className="relative w-[42px] sm:w-[52px]">
                    {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt={c.name} title={`${c.name} ×${c.quantity}`} loading="lazy"
                            className="w-full aspect-[63/88] object-cover rounded border border-gray-200 bg-white" />
                    ) : (
                        <div className="w-full aspect-[63/88] rounded border border-dashed border-gray-300 bg-white flex items-center justify-center text-[8px] text-gray-500 p-0.5 text-center leading-tight">{c.name}</div>
                    )}
                    <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow">{c.quantity}</span>
                </div>
            ))}
        </div>
    )
}
