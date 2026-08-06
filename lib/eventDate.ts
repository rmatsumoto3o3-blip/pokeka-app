// event_date は「6/28」「7/7」のような年なし文字列で保存されているため、
// そのままでは年跨ぎで正しくソートできない。同期時刻 created_at の年を基準に
// イベント年を推定して比較用のタイムスタンプ(ms)を返す。
//
// - 通常イベントは同期より前 or 同月なので created_at と同年。
// - イベント月が同期月より大きく先(>6ヶ月)なら、前年のイベントを年明けに同期したケース
//   （例: 12/30 のイベントを 1/2 に同期）とみなし1年引く。
// - event_date が解釈できない場合は created_at（無ければ0）にフォールバック。
export function eventDateSortKey(eventDate?: string | null, createdAt?: string | null): number {
    const base = createdAt ? new Date(createdAt) : new Date()
    const baseValid = !isNaN(base.getTime())
    const m = (eventDate || '').match(/(\d{1,2})\s*[/／]\s*(\d{1,2})/)
    if (!m) return baseValid ? base.getTime() : 0
    const mon = parseInt(m[1], 10) - 1
    const day = parseInt(m[2], 10)
    let year = baseValid ? base.getFullYear() : new Date().getFullYear()
    if (baseValid && mon - base.getMonth() > 6) year -= 1
    const d = new Date(year, mon, day)
    return d.getTime()
}

// 新しい順（降順）比較関数
export function byEventDateDesc<T extends { event_date?: string | null; created_at?: string | null }>(a: T, b: T): number {
    return eventDateSortKey(b.event_date, b.created_at) - eventDateSortKey(a.event_date, a.created_at)
}
