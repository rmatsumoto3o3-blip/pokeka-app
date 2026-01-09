'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { fetchDeckData, buildDeck, shuffle, type Card } from '@/lib/deckParser'
import { createStack } from '@/lib/cardStack'
import DeckPractice, { type DeckPracticeRef, CascadingStack } from '../../components/DeckPractice'
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragStartEvent,
    DragEndEvent,
    useDraggable,
    useDroppable,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'

function PracticeContent() {
    const searchParams = useSearchParams()
    const [deckCode1, setDeckCode1] = useState(searchParams.get('code1') || '')
    const [deckCode2, setDeckCode2] = useState(searchParams.get('code2') || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deck1, setDeck1] = useState<Card[]>([])
    const [deck2, setDeck2] = useState<Card[]>([])
    const [stadium1, setStadium1] = useState<Card | null>(null)
    const [stadium2, setStadium2] = useState<Card | null>(null)
    const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [activeDragData, setActiveDragData] = useState<any>(null)

    const player1Ref = useRef<DeckPracticeRef>(null)
    const player2Ref = useRef<DeckPracticeRef>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        })
    )

    // Auto-load if deck codes are in URL
    useEffect(() => {
        const code1 = searchParams.get('code1')
        const code2 = searchParams.get('code2')
        if (code1 && !deck1.length) {
            setDeckCode1(code1)
            loadDecks(code1, code2 || '')
        }
    }, [searchParams])

    const loadDecks = async (code1?: string, code2?: string) => {
        const targetCode1 = code1 || deckCode1
        const targetCode2 = code2 || deckCode2

        if (!targetCode1 && !targetCode2) return

        setLoading(true)
        setError(null)

        try {
            if (targetCode1) {
                const cards1 = await fetchDeckData(targetCode1)
                const fullDeck1 = buildDeck(cards1)
                if (fullDeck1.length !== 60) {
                    throw new Error(`デッキ1は60枚である必要があります（現在: ${fullDeck1.length}枚）`)
                }
                setDeck1(shuffle(fullDeck1))
            }

            if (targetCode2) {
                const cards2 = await fetchDeckData(targetCode2)
                const fullDeck2 = buildDeck(cards2)
                if (fullDeck2.length !== 60) {
                    throw new Error(`デッキ2は60枚である必要があります（現在: ${fullDeck2.length}枚）`)
                }
                setDeck2(shuffle(fullDeck2))
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'デッキの読み込みに失敗しました')
            console.error('Failed to load deck:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveDragId(active.id as string)
        setActiveDragData(active.data.current)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveDragId(null)
        setActiveDragData(null)

        if (!over) return

        const targetId = over.id as string
        if (targetId === 'stadium-zone') {
            const source = active.data.current as any
            if (source?.playerPrefix === 'player1') {
                player1Ref.current?.handleExternalDragEnd(event)
            } else if (source?.playerPrefix === 'player2') {
                player2Ref.current?.handleExternalDragEnd(event)
            }
        } else if (targetId.startsWith('player1-')) {
            player1Ref.current?.handleExternalDragEnd(event)
        } else if (targetId.startsWith('player2-')) {
            player2Ref.current?.handleExternalDragEnd(event)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-1 sm:p-4">
            <div className="max-w-[1800px] mx-auto">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        🎮 1人回し練習
                    </h1>
                    <p className="text-sm text-gray-600">
                        デッキコードを入力して、対戦練習を始めましょう
                    </p>
                </div>

                {/* Deck Code Input */}
                {(!deck1.length || !deck2.length) && (
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Deck 1 Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    デッキ1（自分）
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={deckCode1}
                                        onChange={(e) => setDeckCode1(e.target.value)}
                                        placeholder="デッキコードを入力"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Deck 2 Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    デッキ2（相手）
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={deckCode2}
                                        onChange={(e) => setDeckCode2(e.target.value)}
                                        placeholder="デッキコードを入力"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => loadDecks()}
                            disabled={loading || (!deckCode1 && !deckCode2)}
                            className="mt-4 w-full px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? '読み込み中...' : 'デッキを読み込む'}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {/* Practice Area - 3 Column Layout */}
                {(deck1.length > 0 || deck2.length > 0) && (
                    <DndContext
                        sensors={sensors}
                        modifiers={[snapCenterToCursor]}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="w-full overflow-x-auto pb-4">
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 w-full min-w-[1000px]">
                                {/* Player 1 */}
                                {deck1.length > 0 && (
                                    <DeckPractice
                                        ref={player1Ref}
                                        idPrefix="player1"
                                        deck={deck1}
                                        onReset={() => setDeck1([])}
                                        playerName="自分"
                                        compact={true}
                                        stadium={stadium1}
                                        onStadiumChange={(card: Card | null) => {
                                            setStadium1(card)
                                            setStadium2(null)
                                        }}
                                    />
                                )}

                                {/* Center Column - Stadium & Tools */}
                                <div className="w-24 sm:w-28 md:w-32 flex-shrink-0 flex flex-col items-center">
                                    <div className="bg-white rounded-lg shadow-lg p-2 sticky top-4 w-full flex flex-col items-center">
                                        <DroppableZone id="stadium-zone" className="w-[100px] sm:w-[120px] aspect-[5/7] rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] text-center p-2 mx-auto overflow-hidden relative group">
                                            {(stadium1 || stadium2) ? (
                                                <div className="relative group flex justify-center w-full h-full">
                                                    <Image
                                                        src={(stadium1 || stadium2)!.imageUrl}
                                                        alt={(stadium1 || stadium2)!.name}
                                                        fill
                                                        className="rounded shadow-lg object-contain"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setStadium1(null)
                                                            setStadium2(null)
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500/80 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition z-10"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ) : (
                                                <span>なし</span>
                                            )}
                                        </DroppableZone>

                                        {/* Future: Damage Counters & Coins */}
                                        <div className="mt-4 flex flex-col gap-4 w-full">
                                            {/* Coin Flip */}
                                            <div className="bg-gray-50 rounded p-2 text-center">
                                                <h3 className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tight">Coin</h3>
                                                <div className="flex justify-center mb-1">
                                                    <div className={`w-10 h-10 rounded-full border-4 shadow-inner flex items-center justify-center transition-all duration-500 ${coinResult === 'heads' ? 'bg-orange-400 border-orange-600' : coinResult === 'tails' ? 'bg-white border-gray-400' : 'bg-gray-200 border-gray-300'}`}>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-black text-black h-4 mb-2">
                                                    {coinResult === 'heads' ? 'オモテ' : coinResult === 'tails' ? 'ウラ' : '-'}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const result = Math.random() < 0.5 ? 'heads' : 'tails'
                                                        setCoinResult(result)
                                                    }}
                                                    className="w-full bg-gray-800 text-white text-[10px] py-1 rounded font-bold hover:bg-black transition uppercase"
                                                >
                                                    Flip
                                                </button>
                                            </div>

                                            {/* Damage Counters */}
                                            <div className="bg-gray-50 rounded p-2 text-center w-full">
                                                <h3 className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-tight">Damage</h3>
                                                <div className="flex flex-col items-center gap-2">
                                                    {[100, 50, 10].map((value) => (
                                                        <DraggableDamageCounter key={value} amount={value} />
                                                    ))}
                                                    <DraggableDamageCounter amount={-999} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Player 2 */}
                                {deck2.length > 0 && (
                                    <DeckPractice
                                        ref={player2Ref}
                                        idPrefix="player2"
                                        deck={deck2}
                                        onReset={() => setDeck2([])}
                                        playerName="相手"
                                        compact={true}
                                        stadium={stadium2}
                                        onStadiumChange={(card: Card | null) => {
                                            setStadium2(card)
                                            setStadium1(null)
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <DragOverlay dropAnimation={{
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: {
                                    active: {
                                        opacity: '0.4',
                                    },
                                },
                            }),
                        }}>
                            {activeDragId ? (
                                <div className="opacity-80 scale-105 pointer-events-none">
                                    {activeDragData && (
                                        <div className="pointer-events-none">
                                            {activeDragData.type === 'counter' ? (
                                                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xs sm:text-sm font-black shadow-2xl border-2 scale-125 ${activeDragData.amount === 10 ? 'bg-orange-500 border-orange-700 text-white' :
                                                    activeDragData.amount === 50 ? 'bg-red-500 border-red-700 text-white' :
                                                        activeDragData.amount === -999 ? 'bg-white border-gray-400 text-gray-500' :
                                                            'bg-red-700 border-red-900 text-white'
                                                    }`}>
                                                    {activeDragData.amount === -999 ? 'CLR' : activeDragData.amount}
                                                </div>
                                            ) : activeDragData.card ? (
                                                <CascadingStack
                                                    stack={activeDragData.card.cards ? activeDragData.card : createStack(activeDragData.card)}
                                                    width={120}
                                                    height={168}
                                                />
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>
        </div>
    )
}

// Sub-components for D&D in Practice Page
function DraggableDamageCounter({ amount }: { amount: number }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `damage-counter-${amount}-${Math.random()}`,
        data: {
            type: 'counter',
            amount: amount,
        },
    })

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 1000,
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                rounded-full shadow-md flex items-center justify-center font-black text-white border-2 border-white cursor-move hover:scale-110 transition select-none touch-none
                ${amount === 100 ? 'w-10 h-10 bg-red-600 text-xs' : ''}
                ${amount === 50 ? 'w-8 h-8 bg-orange-500 text-[10px]' : ''}
                ${amount === 10 ? 'w-6 h-6 bg-yellow-500 text-black text-[9px]' : ''}
                ${amount === -999 ? 'w-8 h-8 bg-white text-gray-400 text-[8px] border-gray-200' : ''}
                ${isDragging ? 'opacity-0' : ''}
            `}
        >
            {amount === -999 ? 'CLR' : amount}
        </div>
    )
}

function DroppableZone({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div
            ref={setNodeRef}
            className={`${className} ${isOver ? 'ring-4 ring-blue-300 bg-blue-50/50' : ''}`}
        >
            {children}
        </div>
    )
}

export default function PracticePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
            <PracticeContent />
        </Suspense>
    )
}

import { CSS } from '@dnd-kit/utilities'
