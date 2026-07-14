'use client'

import { useState } from 'react'

// タイトル別デッキ用のアイコン表示。
// public/unionarena-icons/{deckCode}.png があればそれを表示し、
// 無ければ（404時に）従来の画像(fallbackUrl)に自動で切り替える。
// 静的ファイル配信なのでSupabaseの転送量は増えない。
interface UnionArenaDeckIconProps {
    deckCode: string | null | undefined
    fallbackUrl: string | null | undefined
    alt: string
    className?: string
}

export default function UnionArenaDeckIcon({ deckCode, fallbackUrl, alt, className }: UnionArenaDeckIconProps) {
    const iconPath = deckCode ? `/unionarena-icons/${deckCode}.png` : null
    const initial = iconPath || fallbackUrl || ''
    const [src, setSrc] = useState(initial)

    if (!src) return null

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={className}
            onError={() => {
                // アイコンが無ければ従来画像へ一度だけフォールバック
                if (fallbackUrl && src !== fallbackUrl) setSrc(fallbackUrl)
            }}
        />
    )
}
