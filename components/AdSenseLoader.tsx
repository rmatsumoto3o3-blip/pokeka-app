'use client'

import { useEffect } from 'react'

export default function AdSenseLoader() {
    useEffect(() => {
        // ページが完全に読み込まれてから2秒後にAdSenseを読み込む
        const timer = setTimeout(() => {
            const script = document.createElement('script')
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2951381820280282'
            script.async = true
            script.crossOrigin = 'anonymous'
            document.head.appendChild(script)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    return null
}
