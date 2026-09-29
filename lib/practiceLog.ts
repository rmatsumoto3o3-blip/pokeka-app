'use client'
// 一人回しの匿名プレイログ（クライアント）。
// セッション中はバッファに溜め、チャンク単位（40件 / 90秒 / 離脱時）で /api/practice/log へ送信。
// 全操作ごとに書かないので Supabase 負荷は最小。個人情報は扱わない。

type Ev = { t: string; ts: number } & Record<string, unknown>

let sessionId = ''
let deckCode: string | null = null
let startedAt = 0
let buffer: Ev[] = []
let timer: ReturnType<typeof setInterval> | null = null
let listenersBound = false

// 送信先＝自サイトの中立エンドポイント（実際の保存先GAS URLはサーバー側に隠す）。
// クライアントの通信は pokelix.jp/api/pt のみ見え、Googleスプレッドシートとは分かりにくい。
const ENDPOINT = '/api/pt'
const FLUSH_AT = 40

function rid() {
    try { return crypto.randomUUID() } catch { return 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36) }
}

function payload() {
    // action は付けない（サーバー側で付与）。クライアントのペイロードを中立的に保つ。
    return {
        s: sessionId,
        d: deckCode,
        e: buffer,
        m: { w: typeof window !== 'undefined' ? window.innerWidth : 0 },
    }
}

function flush(useBeacon = false) {
    if (!ENDPOINT || !sessionId || buffer.length === 0) return
    const body = JSON.stringify(payload())
    buffer = []
    try {
        // GASはプレフライトを避けるため text/plain で送る（CORSの単純リクエスト化）
        if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=UTF-8' }))
        } else {
            fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8' }, body, keepalive: true, mode: 'no-cors' }).catch(() => { })
        }
    } catch { /* ログ送信失敗は無視 */ }
}

function bindListeners() {
    if (listenersBound || typeof document === 'undefined') return
    listenersBound = true
    const onHide = () => { if (document.visibilityState === 'hidden') flush(true) }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', () => flush(true))
    timer = setInterval(() => flush(false), 90000)
}

// セッション開始（デッキ読込時などに呼ぶ）。既存バッファは送ってから開始。
export function startPracticeLog(code: string | null, meta?: Record<string, unknown>) {
    if (typeof window === 'undefined') return
    if (buffer.length) flush(false)
    sessionId = rid()
    deckCode = code || null
    startedAt = Date.now()
    bindListeners()
    logEvent('session_start', meta || {})
}

// 要点イベントを1件記録。
export function logEvent(t: string, payload?: Record<string, unknown>) {
    if (typeof window === 'undefined' || !sessionId) return
    buffer.push({ t, ts: Date.now() - startedAt, ...(payload || {}) })
    if (buffer.length >= FLUSH_AT) flush(false)
}
