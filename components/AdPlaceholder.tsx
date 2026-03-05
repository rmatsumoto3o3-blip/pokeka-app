import React, { useEffect } from 'react'

interface AdPlaceholderProps {
    slot?: string
    format?: 'rectangle' | 'horizontal' | 'vertical' | 'responsive'
    label?: string
    className?: string
}

declare global {
    interface Window {
        adsbygoogle: any[]
    }
}

export default function AdPlaceholder({
    slot = '0000000000',
    format = 'responsive',
    label = 'スポンサーリンク',
    className = ''
}: AdPlaceholderProps) {
    return null;
}
