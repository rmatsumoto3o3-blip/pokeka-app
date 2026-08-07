import Image from 'next/image'

// デッキアイコン表示。優先順: 管理画面で選んだカード2枚(icon_urls) → thumbnail_url → アーキタイプのカバー画像。
// 2枚のときは正方形枠に左右half幅で並べ、カード上部（キャラ）が見えるよう object-top で切り抜く。
export default function GundamDeckIcon({
    iconUrls,
    thumbnailUrl,
    fallbackUrl,
    alt,
}: {
    iconUrls?: unknown
    thumbnailUrl?: string | null
    fallbackUrl?: string | null
    alt: string
}) {
    const urls = Array.isArray(iconUrls) ? (iconUrls as unknown[]).filter((u): u is string => typeof u === 'string' && !!u).slice(0, 2) : []

    if (urls.length === 2) {
        return (
            <div className="absolute inset-0 flex">
                {urls.map((u, i) => (
                    <div key={i} className="relative w-1/2 h-full overflow-hidden">
                        <Image src={u} alt={alt} fill className="object-cover object-top" unoptimized />
                    </div>
                ))}
            </div>
        )
    }
    if (urls.length === 1) {
        return <Image src={urls[0]} alt={alt} fill className="object-contain" unoptimized />
    }
    if (thumbnailUrl) {
        return <Image src={thumbnailUrl} alt={alt} fill className="object-contain" unoptimized />
    }
    if (fallbackUrl) {
        return <Image src={fallbackUrl} alt={alt} fill className="object-contain p-2" unoptimized />
    }
    return null
}
