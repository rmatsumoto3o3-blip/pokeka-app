'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AddMatchFormProps {
    deckId: string
    userId: string
    onSuccess: () => void
    isLimitReached?: boolean
    matchCount?: number
    maxMatches?: number
}

export default function AddMatchForm({
    deckId,
    userId,
    onSuccess,
    isLimitReached = false,
    matchCount = 0,
    maxMatches = 100
}: AddMatchFormProps) {
    const [result, setResult] = useState<'win' | 'loss' | 'draw'>('win')
    const [goingFirst, setGoingFirst] = useState<'先攻' | '後攻' | null>(null)
    const [mySide, setMySide] = useState<number | null>(null)
    const [opponentSide, setOpponentSide] = useState<number | null>(null)
    const [opponentName, setOpponentName] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isLimitReached) return

        if (!goingFirst) {
            alert('先攻/後攻を選択してください')
            return
        }

        if (mySide === null || opponentSide === null) {
            alert('サイド枚数を選択してください')
            return
        }

        setLoading(true)

        try {
            const sideFormatted = `${mySide}-${opponentSide}`
            const { error } = await supabase
                .from('matches')
                .insert({
                    deck_id: deckId,
                    user_id: userId,
                    result,
                    opponent_name: opponentName || null,
                    date,
                    notes: notes || null,
                    side: sideFormatted,
                    going_first: goingFirst,
                })

            if (error) throw error

            // Reset form
            setGoingFirst(null)
            setMySide(null)
            setOpponentSide(null)
            setOpponentName('')
            setNotes('')
            setDate(new Date().toISOString().split('T')[0])
            onSuccess()
        } catch (err: any) {
            alert('試合の記録に失敗しました: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    if (isLimitReached) {
        return (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                <p className="font-bold">⚠️ 対戦履歴の上限 ({maxMatches}戦) に達しました</p>
                <p className="text-sm mt-1">
                    これ以上記録を追加できません。正式リリースをお待ちください。
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    結果 *
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setResult('win')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${result === 'win'
                            ? 'bg-green-600 text-white translate-y-[-2px] shadow-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'
                            }`}
                    >
                        勝ち
                    </button>
                    <button
                        type="button"
                        onClick={() => setResult('loss')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${result === 'loss'
                            ? 'bg-red-600 text-white translate-y-[-2px] shadow-red-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'
                            }`}
                    >
                        負け
                    </button>
                    <button
                        type="button"
                        onClick={() => setResult('draw')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${result === 'draw'
                            ? 'bg-gray-600 text-white translate-y-[-2px] shadow-gray-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'
                            }`}
                    >
                        引分
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    先攻/後攻 *
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setGoingFirst('先攻')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${goingFirst === '先攻'
                            ? 'bg-blue-600 text-white translate-y-[-2px] shadow-blue-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'
                            }`}
                    >
                        先攻
                    </button>
                    <button
                        type="button"
                        onClick={() => setGoingFirst('後攻')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all shadow-sm ${goingFirst === '後攻'
                            ? 'bg-purple-600 text-white translate-y-[-2px] shadow-purple-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'
                            }`}
                    >
                        後攻
                    </button>
                </div>
            </div>

            <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-sm font-bold text-gray-700">
                    サイド状況 (取った枚数) *
                </label>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 w-8">自分</span>
                        <div className="flex flex-wrap gap-1 flex-1">
                            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                    key={`my-${num}`}
                                    type="button"
                                    onClick={() => setMySide(num)}
                                    className={`w-9 h-9 rounded-lg font-bold text-sm transition-all border ${mySide === num
                                        ? 'bg-pink-500 text-white border-pink-600 shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-pink-300'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 w-8">相手</span>
                        <div className="flex flex-wrap gap-1 flex-1">
                            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                    key={`op-${num}`}
                                    type="button"
                                    onClick={() => setOpponentSide(num)}
                                    className={`w-9 h-9 rounded-lg font-bold text-sm transition-all border ${opponentSide === num
                                        ? 'bg-gray-700 text-white border-gray-800 shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">対戦相手のデッキ</label>
                    <input
                        type="text"
                        value={opponentName}
                        onChange={(e) => setOpponentName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="デカヌチャンex など"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">日付 *</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">メモ</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="試合の重要なポイントなど..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all disabled:opacity-50"
            >
                {loading ? '記録中...' : '試合を記録する'}
            </button>
        </form>
    )
}
