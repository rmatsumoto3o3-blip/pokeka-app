'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AddMatchFormProps {
    deckId: string
    userId: string
    onSuccess: () => void
}

export default function AddMatchForm({ deckId, userId, onSuccess }: AddMatchFormProps) {
    const [result, setResult] = useState<'win' | 'loss' | 'draw'>('win')
    const [opponentName, setOpponentName] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('matches')
                .insert({
                    deck_id: deckId,
                    user_id: userId,
                    result,
                    opponent_name: opponentName,
                    date,
                    notes: notes || null,
                })

            if (error) throw error

            // Reset form
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

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    結果 *
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setResult('win')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${result === 'win'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        勝ち
                    </button>
                    <button
                        type="button"
                        onClick={() => setResult('loss')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${result === 'loss'
                                ? 'bg-red-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        負け
                    </button>
                    <button
                        type="button"
                        onClick={() => setResult('draw')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${result === 'draw'
                                ? 'bg-gray-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        引き分け
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    対戦相手 *
                </label>
                <input
                    type="text"
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="対戦相手の名前"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    日付 *
                </label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    メモ
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="試合の詳細など..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
                {loading ? '記録中...' : '試合を記録'}
            </button>
        </form>
    )
}
