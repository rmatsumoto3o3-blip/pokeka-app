'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// お知らせバナー。数日掲示したら NOTICE_ENABLED を false にして再デプロイし、消すこと。
// メッセージを変えたら NOTICE_VERSION も上げると、閉じたユーザーにも再表示される。
const NOTICE_ENABLED = true
const NOTICE_VERSION = '2026-07-22-recovered'

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
        <div className="bg-emerald-50 border-b border-emerald-200">
            <div className="max-w-7xl mx-auto px-3 py-2 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <p className="flex-1 text-[12px] md:text-[13px] text-emerald-800 leading-relaxed">
                    環境デッキデータの表示は復旧しました。
                    <Link href="/" className="underline font-semibold">環境Tier表</Link>・
                    <Link href="/decks" className="underline font-semibold">環境デッキ</Link>
                    も通常どおりご覧いただけます。ご不便をおかけし申し訳ありませんでした。
                </p>
                <button onClick={close} aria-label="閉じる" className="shrink-0 text-emerald-600 hover:text-emerald-800 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    )
}
