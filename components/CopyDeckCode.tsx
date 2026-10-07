'use client'
import { useState } from 'react'

// デッキコードをクリックでコピーできる小部品（/env・/city で共用）。
export default function CopyDeckCode({ code, className }: { code: string; className?: string }) {
    const [copied, setCopied] = useState(false)
    const copy = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation()
        const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500) }
        try {
            await navigator.clipboard.writeText(code); done()
        } catch {
            try {
                const ta = document.createElement('textarea')
                ta.value = code; ta.style.position = 'fixed'; ta.style.opacity = '0'
                document.body.appendChild(ta); ta.focus(); ta.select()
                document.execCommand('copy'); document.body.removeChild(ta); done()
            } catch { /* コピー不可環境は無視 */ }
        }
    }
    return (
        <button
            type="button"
            onClick={copy}
            title="デッキコードをコピー"
            className={`inline-flex items-center gap-1 min-w-0 font-mono hover:text-blue-600 transition ${copied ? 'text-blue-600' : ''} ${className || ''}`}
        >
            <span className="truncate">{code}</span>
            <span className="shrink-0 text-[10px] font-sans font-bold">{copied ? 'コピーしました' : 'コピー'}</span>
        </button>
    )
}
