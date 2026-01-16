'use client'

import { useState } from 'react'

// Mock Data Types
type Card = { name: string, count: number, type: 'pokemon' | 'trainer' | 'energy' }
type Variant = { id: string, name: string, cards: Card[], sideboard: Card[] }
type History = { date: string, action: string, version: string }

// Mock Data: Charizard ex Archetype
const MOCK_ARCHETYPE = {
    name: "リザードンex",
    variants: [
        {
            id: 'v1',
            name: "標準構築 (ピジョット型)",
            cards: [
                { name: "リザードンex", count: 3, type: 'pokemon' },
                { name: "ヒトカゲ", count: 4, type: 'pokemon' },
                { name: "ピジョットex", count: 2, type: 'pokemon' },
                { name: "ポッポ", count: 2, type: 'pokemon' },
                { name: "かがやくリザードン", count: 1, type: 'pokemon' },
                { name: "ナンジャモ", count: 4, type: 'trainer' },
                { name: "ペパー", count: 4, type: 'trainer' },
                // ... abbreviated for mock
                { name: "基本炎エネルギー", count: 6, type: 'energy' }
            ] as Card[],
            sideboard: [
                { name: "マナフィ", count: 1, type: 'pokemon' },
                { name: "ロストスイーパー", count: 1, type: 'trainer' },
                { name: "崩れたスタジアム", count: 1, type: 'trainer' }
            ] as Card[]
        },
        {
            id: 'v2',
            name: "ビーダル型 (検討中)",
            cards: [
                { name: "リザードンex", count: 3, type: 'pokemon' },
                { name: "ヒトカゲ", count: 4, type: 'pokemon' },
                { name: "ビーダル", count: 2, type: 'pokemon' },
                { name: "ビッパ", count: 2, type: 'pokemon' },
                // ...
                { name: "ジェットエネルギー", count: 1, type: 'energy' }
            ] as Card[],
            sideboard: [
                { name: "ピジョットex", count: 2, type: 'pokemon' },
                { name: "ふしぎなアメ", count: 1, type: 'trainer' }
            ] as Card[]
        }
    ],
    history: [
        { date: '2024/01/15 10:00', action: 'デッキ作成', version: 'v1.0' },
        { date: '2024/01/16 09:30', action: 'ビーダル型を派生作成', version: 'v1.1' },
        { date: '2024/01/16 14:00', action: 'サイドボードにマナフィを追加', version: 'v1.1' }
    ] as History[]
}

export default function DeckDetailMock({ onClose }: { onClose: () => void }) {
    const [currentVariantId, setCurrentVariantId] = useState('v1')
    const currentVariant = MOCK_ARCHETYPE.variants.find(v => v.id === currentVariantId) || MOCK_ARCHETYPE.variants[0]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex justify-between items-start">
                    <div>
                        <div className="text-xs font-bold opacity-80 mb-1">デッキアーキタイプ</div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            🔥 {MOCK_ARCHETYPE.name}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">×</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main Deck Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Variant Selector */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <label className="block text-sm font-bold text-gray-500 mb-2">現在の構築パターン (バリエーション)</label>
                                <div className="flex gap-2">
                                    {MOCK_ARCHETYPE.variants.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => setCurrentVariantId(v.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex-1 text-left flex justify-between items-center ${currentVariantId === v.id
                                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                                }`}
                                        >
                                            {v.name}
                                            {currentVariantId === v.id && <span>✓</span>}
                                        </button>
                                    ))}
                                    <button className="px-3 py-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 font-bold">+</button>
                                </div>
                            </div>

                            {/* Deck Content Mock */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between">
                                    <span>メインデッキ</span>
                                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm">60枚</span>
                                </h3>
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                    {currentVariant.cards.map((card, i) => (
                                        <div key={i} className="aspect-[2/3] bg-gray-200 rounded flex items-center justify-center relative group cursor-pointer hover:ring-2 ring-blue-400">
                                            <div className="text-[10px] text-center p-1 leading-tight">{card.name}</div>
                                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">{card.count}</div>
                                        </div>
                                    ))}
                                    {/* Fillers to look like 60 cards */}
                                    {[...Array(10)].map((_, i) => (
                                        <div key={`filler-${i}`} className="aspect-[2/3] bg-gray-100 rounded border border-gray-200"></div>
                                    ))}
                                </div>
                                <div className="mt-4 text-center text-gray-400 text-xs">(他 {60 - currentVariant.cards.length - 10} 枚省略)</div>
                            </div>
                        </div>

                        {/* Sideboard & History Column */}
                        <div className="space-y-6">

                            {/* Sideboard */}
                            <div className="bg-orange-50 p-4 rounded-lg shadow-sm border-2 border-orange-100">
                                <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                                    <span>🗂️</span> サイドボード (採用検討)
                                </h3>

                                <div className="mb-4">
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="デッキコードから候補を追加"
                                            className="w-full text-xs px-2 py-1.5 rounded border border-orange-200 focus:outline-none focus:border-orange-400"
                                        />
                                        <button className="whitespace-nowrap px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded hover:bg-orange-600">
                                            取込
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-orange-400">
                                        ※公式プレイヤーズクラブで作った「候補カードリスト」のコードを入力
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {currentVariant.sideboard.map((card, i) => (
                                        <div key={i} className="aspect-[2/3] bg-white rounded flex items-center justify-center relative cursor-grab active:cursor-grabbing border border-orange-200 shadow-sm hover:scale-105 transition">
                                            <div className="text-[9px] text-center p-1 leading-tight">{card.name}</div>
                                            <div className="absolute bottom-0 right-0 bg-orange-500 text-white text-[10px] px-1 rounded-tl">{card.count}</div>
                                        </div>
                                    ))}
                                    {/* Empty Slot Placeholder */}
                                    {[...Array(Math.max(0, 6 - currentVariant.sideboard.length))].map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-[2/3] bg-orange-100/30 rounded border border-dashed border-orange-200"></div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-orange-600 mt-3 leading-relaxed">
                                    ここにカードを置いておくと、<br />
                                    デッキの枠を消費せずにメモできます。<br />
                                    ドラッグ＆ドロップでメインと入替可能です(予定)。
                                </p>
                            </div>

                            {/* History */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span>📜</span> 更新履歴
                                </h3>
                                <div className="space-y-3 relative">
                                    <div className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-gray-100"></div>
                                    {MOCK_ARCHETYPE.history.map((h, i) => (
                                        <div key={i} className="relative pl-5 text-sm">
                                            <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-gray-300 border-2 border-white"></div>
                                            <div className="text-xs text-gray-400 font-mono mb-0.5">{h.date} <span className="text-gray-300"> | {h.version}</span></div>
                                            <div className="text-gray-700">{h.action}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
                                <button className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">保存する</button>
                                <button className="w-full py-2 bg-white text-gray-600 border border-gray-300 rounded font-bold hover:bg-gray-50">複製して新規バリエーション作成</button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
