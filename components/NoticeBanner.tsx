'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// お知らせバナー。復旧したら NOTICE_ENABLED を false にして再デプロイすれば消える。
// メッセージを変えたら NOTICE_VERSION も上げると、閉じたユーザーにも再表示される。
const NOTICE_ENABLED = true
const NOTICE_VERSION = '2026-07-15-egress'

export default function NoticeBanner() {
    const [dismissed, setDismissed] = useState(true) // 初期はSSR一致のため非表示、マウント後に判定

    useEffect(() => {
        if (!NOTICE_ENABLED) return
        const stored = localStorage.getItem('pokelix-notice-dismissed')
        setDismissed(stored === NOTICE_VERSION)
    }, [])

    if (!NOTICE_ENABLED || dismissed) return null

    const close = () => {
        localStorage.setItem('pokelix-notice-dismissed', NOTICE_VERSION)
        setDismissed(true)
    }

    return (
        <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-3 py-2 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /></svg>
                <p className="flex-1 text-[12px] md:text-[13px] text-amber-800 leading-relaxed">
                    現在、環境デッキデータの表示に一時的な不具合が発生しています。
                    <Link href="/practice" className="underline font-semibold">一人回し</Link>・
                    <Link href="/simulator" className="underline font-semibold">確率シミュレーター</Link>
                    などの各種ツールは通常どおりご利用いただけます。ご不便をおかけします（7/21頃に復旧予定）。
                </p>
                <button onClick={close} aria-label="閉じる" className="shrink-0 text-amber-600 hover:text-amber-800 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    )
}
