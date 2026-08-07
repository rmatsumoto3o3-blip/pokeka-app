import Image from 'next/image'

// ガンダムのアーキタイプ名は色（例: 青紫 / 白赤）。名前から色を取り出して2色スウォッチで表示する。
const COLOR_HEX: Record<string, string> = {
    '白': '#e5e7eb',
    '青': '#2563eb',
    '赤': '#dc2626',
    '緑': '#16a34a',
    '紫': '#7c3aed',
    '黒': '#374151',
    '黄': '#eab308',
}

export default function GundamColorIcon({
    name,
    fallbackUrl,
    className = '',
}: {
    name: string
    fallbackUrl?: string | null
    className?: string
}) {
    const colors = Array.from(name || '').filter(ch => COLOR_HEX[ch]).slice(0, 2)

    if (colors.length > 0) {
        return (
            <div className={`flex overflow-hidden ${className}`} title={name}>
                {colors.map((c, i) => (
                    <div
                        key={i}
                        style={{ backgroundColor: COLOR_HEX[c] }}
                        className={colors.length === 2 ? 'w-1/2 h-full' : 'w-full h-full'}
                    />
                ))}
            </div>
        )
    }
    // 色名でないアーキタイプはカバー画像→無ければグレー
    if (fallbackUrl) {
        return (
            <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
                <Image src={fallbackUrl} alt={name} fill className="object-contain p-0.5" unoptimized />
            </div>
        )
    }
    return <div className={`bg-gray-200 ${className}`} />
}
