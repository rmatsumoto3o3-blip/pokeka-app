import { createClient as createAdminClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 在席判定のしきい値（分）: この時間内に last_seen が更新されていればオンライン
// ハートビートが1時間間隔のため、少し余裕を持たせて65分に設定
const ONLINE_THRESHOLD_MIN = 65

type UserRow = {
    id: string
    nickname: string | null
    email: string | null
    discord_id: string | null
    created_at: string | null
    last_seen: string | null
}

function timeAgo(iso: string | null): string {
    if (!iso) return '—'
    const diffMs = Date.now() - new Date(iso).getTime()
    if (diffMs < 0) return 'たった今'
    const min = Math.floor(diffMs / 60000)
    if (min < 1) return 'たった今'
    if (min < 60) return `${min}分前`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}時間前`
    const day = Math.floor(hr / 24)
    return `${day}日前`
}

function fmtDate(iso: string | null): string {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export default async function AdminUsersPage() {
    // 管理者ガードは app/admin/layout.tsx（メール一致）で担保済み。
    // 一覧はサーバー側で service-role を使って取得し、非管理者のブラウザには一切渡さない。
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    let users: UserRow[] = []
    let errorMsg = ''

    if (!url || !key) {
        errorMsg = 'サーバー設定が不足しています（SUPABASE_SERVICE_ROLE_KEY）。'
    } else {
        const supabase = createAdminClient(url, key)
        const { data, error } = await supabase
            .from('users')
            .select('id, nickname, email, discord_id, created_at, last_seen')
        if (error) {
            errorMsg = error.message
        } else {
            users = (data || []) as UserRow[]
        }
    }

    const now = Date.now()
    const isOnline = (u: UserRow) =>
        !!u.last_seen && now - new Date(u.last_seen).getTime() < ONLINE_THRESHOLD_MIN * 60000

    // オンライン優先 → 最終アクセスが新しい順
    users.sort((a, b) => {
        const oa = isOnline(a) ? 1 : 0
        const ob = isOnline(b) ? 1 : 0
        if (oa !== ob) return ob - oa
        const ta = a.last_seen ? new Date(a.last_seen).getTime() : 0
        const tb = b.last_seen ? new Date(b.last_seen).getTime() : 0
        return tb - ta
    })

    const onlineCount = users.filter(isOnline).length

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        ユーザー在席状況
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        直近1時間以内にアクセスがあれば「オンライン」（負荷軽減のため在席の更新は1時間間隔）。この画面は管理者のみ閲覧できます。
                    </p>
                </div>
            </div>

            {errorMsg ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    取得に失敗しました: {errorMsg}
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-4">
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                            <div className="text-xs font-medium text-green-700">オンライン</div>
                            <div className="text-2xl font-bold text-green-800">
                                🟢 {onlineCount}
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                            <div className="text-xs font-medium text-gray-500">登録ユーザー総数</div>
                            <div className="text-2xl font-bold text-gray-800">{users.length}</div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs font-semibold text-gray-500">
                                    <th className="px-4 py-3">状態</th>
                                    <th className="px-4 py-3">ニックネーム</th>
                                    <th className="px-4 py-3">登録方法</th>
                                    <th className="px-4 py-3">最終アクセス</th>
                                    <th className="px-4 py-3">登録日</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((u) => {
                                    const online = isOnline(u)
                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-4 py-3">
                                                {online ? (
                                                    <span className="inline-flex items-center gap-1.5 font-medium text-green-700">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                                        オンライン
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-gray-400">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                                                        オフライン
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                                                {u.nickname || '（未設定）'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                {u.discord_id ? (
                                                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                                                        Discord
                                                    </span>
                                                ) : (
                                                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                                        メール
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                                                {timeAgo(u.last_seen)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                                                {fmtDate(u.created_at)}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                            ユーザーがいません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-xs text-gray-400">
                        ※ このページを再読み込みすると最新状態に更新されます。
                    </p>
                </>
            )}
        </div>
    )
}
