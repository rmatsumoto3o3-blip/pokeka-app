'use client'
// 一人回しの匿名ログ（軽量版）。
// 目的を「人気デッキの把握」に限定し、セッション開始時に 1P/2P のデッキコードだけを1件送信する。
// 旧・詳細操作ログ（ドロー/場出し/盤面スナップショット等）は廃止：
//   CPU学習用途が無くなり、スプレッドシートの肥大要因にもなっていたため。
// これで 1セッション=1行 となり負荷・行数ともに最小。個人情報は扱わない。

let sessionId = ''

// 送信先＝自サイトの中立エンドポイント（実保存先のGAS URLはサーバー側に隠す）。
const ENDPOINT = '/api/pt'

function rid() {
    try { return crypto.randomUUID() } catch { return 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36) }
}

function send(body: string, useBeacon = false) {
    try {
        // GASのプレフライト回避のため text/plain（CORS単純リクエスト化）
        if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=UTF-8' }))
        } else {
            fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8' }, body, keepalive: true, mode: 'no-cors' }).catch(() => { })
        }
    } catch { /* ログ送信失敗は無視 */ }
}

// セッション開始：1P(code) と 2P(meta.code2) のデッキコードだけを1件記録して即送信。
export function startPracticeLog(code: string | null, meta?: Record<string, unknown>) {
    if (typeof window === 'undefined') return
    sessionId = rid()
    const body = JSON.stringify({
        s: sessionId,
        d: code || null, // 1P デッキコード
        e: [{ t: 'session_start', ts: 0, ...(meta || {}) }], // meta.code2 に 2P デッキコード
        m: { w: window.innerWidth },
    })
    send(body)
}

// 詳細ログは廃止。既存の呼び出し箇所を壊さないための no-op。
export function logEvent(_t: string, _payload?: Record<string, unknown>) { /* no-op（軽量版） */ }
