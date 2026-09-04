'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

// ログイン中の間だけ、1時間ごとに自分の在席を知らせる。
// 未ログインのユーザーは一切通信しない。負荷を抑えるため送信は間引く。
const PING_INTERVAL_MS = 60 * 60 * 1000 // 1時間
const MIN_GAP_MS = 30 * 60 * 1000 // 直近30分以内に送っていたら再送しない（連打防止）

export default function Heartbeat() {
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | null = null
        let active = true
        let lastPing = 0

        const ping = () => {
            // タブが非表示のときは送らない
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
            const now = Date.now()
            if (now - lastPing < MIN_GAP_MS) return // 間引き
            lastPing = now
            fetch('/api/heartbeat', { method: 'POST', keepalive: true }).catch(() => {})
        }

        const start = async () => {
            try {
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()
                if (!active || !session) return // 未ログインなら何もしない
                ping()
                timer = setInterval(ping, PING_INTERVAL_MS)
                document.addEventListener('visibilitychange', ping)
            } catch {
                // 何もしない
            }
        }

        start()

        return () => {
            active = false
            if (timer) clearInterval(timer)
            document.removeEventListener('visibilitychange', ping)
        }
    }, [])

    return null
}
