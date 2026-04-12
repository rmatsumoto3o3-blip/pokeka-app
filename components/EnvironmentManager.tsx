'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { GameEnvironment } from '@/lib/supabase'

interface EnvironmentManagerProps {
    userEmail: string
}

// userEmail removed as unused per lint
export default function EnvironmentManager({ }: EnvironmentManagerProps) {
    const supabase = createClient()
    const [environments, setEnvironments] = useState<GameEnvironment[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        description: ''
    })

    useEffect(() => {
        fetchEnvironments()
    }, [])

    const fetchEnvironments = async () => {
        try {
            const { data, error } = await supabase
                .from('game_environments')
                .select('*')
                .order('start_date', { ascending: false })

            if (error) throw error
            setEnvironments(data || [])
        } catch (err) {
            console.error('Error fetching environments:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('game_environments')
                    .update({
                        name: formData.name,
                        start_date: formData.start_date,
                        end_date: formData.end_date || null,
                        description: formData.description || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingId)

                if (error) throw error
            } else {
                // Insert
                const { error } = await supabase
                    .from('game_environments')
                    .insert({
                        name: formData.name,
                        start_date: formData.start_date,
                        end_date: formData.end_date || null,
                        description: formData.description || null
                    })

                if (error) throw error
            }

            // Reset form
            setFormData({ name: '', start_date: '', end_date: '', description: '' })
            setIsAdding(false)
            setEditingId(null)
            fetchEnvironments()
        } catch (err) {
            alert('保存に失敗しました: ' + (err instanceof Error ? err.message : String(err)))
        }
    }

    const handleEdit = (env: GameEnvironment) => {
        setFormData({
            name: env.name,
            start_date: env.start_date,
            end_date: env.end_date || '',
            description: env.description || ''
        })
        setEditingId(env.id)
        setIsAdding(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('この環境を削除しますか？')) return

        try {
            const { error } = await supabase
                .from('game_environments')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchEnvironments()
        } catch (err) {
            alert('削除に失敗しました: ' + (err instanceof Error ? err.message : String(err)))
        }
    }

    const cancelEdit = () => {
        setFormData({ name: '', start_date: '', end_date: '', description: '' })
        setIsAdding(false)
        setEditingId(null)
    }

    if (loading) {
        return <div className="text-gray-600">読み込み中...</div>
    }

    return (
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="text-2xl mr-2">🌍</span>
                    環境管理
                </h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                    >
                        + 新しい環境を追加
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-4">
                        {editingId ? '環境を編集' : '新しい環境を追加'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                環境名 *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="例: Hレギュ"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                開始日 *
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                終了日（任意）
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">空欄の場合は現在進行中</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                説明（任意）
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="例: Hレギュレーション開始"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                        >
                            {editingId ? '更新' : '追加'}
                        </button>
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                        >
                            キャンセル
                        </button>
                    </div>
                </form>
            )}

            {/* Environment List */}
            <div className="space-y-3">
                {environments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        環境が登録されていません
                    </div>
                ) : (
                    environments.map((env) => (
                        <div
                            key={env.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg">{env.name}</h4>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium">開始:</span> {env.start_date}
                                        {env.end_date && (
                                            <>
                                                {' '}→ <span className="font-medium">終了:</span> {env.end_date}
                                            </>
                                        )}
                                        {!env.end_date && (
                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                進行中
                                            </span>
                                        )}
                                    </div>
                                    {env.description && (
                                        <p className="text-sm text-gray-500 mt-1">{env.description}</p>
                                    )}
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(env)}
                                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition"
                                    >
                                        編集
                                    </button>
                                    <button
                                        onClick={() => handleDelete(env.id)}
                                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition"
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
