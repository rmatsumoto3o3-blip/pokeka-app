'use client'

import { useState } from 'react'
import { redeemInviteCodeAction } from '@/app/actions'

interface InvitationCodeInputProps {
    userId: string
    onSuccess: () => void
}

export default function InvitationCodeInput({ userId, onSuccess }: InvitationCodeInputProps) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        setLoading(true)
        setError(null)

        try {
            const result = await redeemInviteCodeAction(userId, code.trim())
            if (result.success) {
                alert('招待コードが適用されました！制限が解除されました。')
                setCode('')
                onSuccess()
            } else {
                setError(result.error || 'エラーが発生しました')
            }
        } catch (err) {
            setError('通信エラーが発生しました')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">招待コードをお持ちですか？</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="コードを入力"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                    type="submit"
                    disabled={loading || !code}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50 transition"
                >
                    {loading ? '確認中...' : '適用'}
                </button>
            </div>
            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        </form>
    )
}
