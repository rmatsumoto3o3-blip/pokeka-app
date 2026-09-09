'use client'

import { useEffect, useState } from 'react'

// ツール本体は public/champions-tool.html（自己完結の静的アプリ）。
// iframe内から postMessage で高さを受け取り、二重スクロールを避けて全体を1スクロールにする。
export default function ChampionsTool() {
    const [height, setHeight] = useState(1400)
    useEffect(() => {
        const onMsg = (e: MessageEvent) => {
            const d = e.data as { champHeight?: number }
            if (d && typeof d.champHeight === 'number' && d.champHeight > 300 && d.champHeight < 30000) {
                setHeight(d.champHeight)
            }
        }
        window.addEventListener('message', onMsg)
        return () => window.removeEventListener('message', onMsg)
    }, [])
    return (
        <iframe
            src="/champions-tool.html"
            title="ポケモンチャンピオンズ 構築＆ダメージ計算ツール"
            style={{ width: '100%', height, border: 0, display: 'block', background: '#0f1218' }}
        />
    )
}
