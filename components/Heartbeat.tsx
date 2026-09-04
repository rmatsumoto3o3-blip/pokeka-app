'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

// ログイン中の間だけ、60秒ごとに自分の在席を知らせる。
// 未ログインのユーザーは一切通信しない。
export default function Heartbeat() {
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | null = null
        let active = true

        const ping = () => {
            // タブが非表示のときは送らない（＝離席で自然にオフライン化）
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
            fetch('/api/heartbeat', { method: 'POST', keepalive: true }).catch(() => {})
        }

        const start = async () => {
            try {
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()
                if (!active || !session) return // 未ログインなら何もしない
                ping()
                timer = setInterval(ping, 60_000)
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
