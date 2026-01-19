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
import { CSS } from '@dnd-kit/utilities'

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
        const mode = searchParams.get('mode')
        const code1 = searchParams.get('code1')
        const code2 = searchParams.get('code2')

        const loadCustomDeck = () => {
            try {
                const customDeckJson = localStorage.getItem('pokeka_practice_custom_deck')
                if (customDeckJson) {
                    const cards = JSON.parse(customDeckJson)
                    // Validate card structure partially if needed, or rely on trust for local dev
                    // Build deck (expand quantities)
                    const fullDeck = buildDeck(cards)
                    if (fullDeck.length !== 60) {
                        setError(`カスタムデッキは60枚である必要があります（現在: ${fullDeck.length}枚）`)
                        return
                    }
                    setDeck1(shuffle(fullDeck))
                } else {
                    setError('カスタムデッキデータが見つかりませんでした')
                }
            } catch (e) {
                console.error('Failed to load custom deck', e)
                setError('カスタムデッキの読み込みに失敗しました')
            }
        }

        if (mode === 'custom') {
            loadCustomDeck()
            // If code2 is present, load it normally as opponent
            if (code2) {
                loadDecks(undefined, code2)
            }
        } else if (code1 && !deck1.length) {
            setDeckCode1(code1)
            loadDecks(code1, code2 || '')
        }
    }, [searchParams])

    const loadDecks = async (code1?: string, code2?: string) => {
        const targetCode1 = code1 || deckCode1
        const targetCode2 = code2 || deckCode2

        // If in custom mode, we might not have code1, so only skip if NEITHER exists and NOT custom mode
        // But simplified: just load what is requested.

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

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false)

    // Stadium Menu
    const [showStadiumMenu, setShowStadiumMenu] = useState(false)

    const handleStadiumClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setShowStadiumMenu(!showStadiumMenu)
    }

    const trashStadium = () => {
        if (stadium1) setStadium1(null)
        if (stadium2) setStadium2(null)
        setShowStadiumMenu(false)
    }

    useEffect(() => {
        const handleClickOutside = () => setShowStadiumMenu(false)
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div className="h-[100dvh] md:h-auto md:min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-1 sm:p-4 pb-[env(safe-area-inset-bottom)] overflow-y-auto md:overflow-auto flex flex-col">
            <div className="max-w-[1800px] mx-auto w-full">
                {/* Header - Hidden on mobile for space */}
                <div className="mb-2 md:mb-4 flex justify-between items-center hidden md:flex">
                    <div>
                        <h1 className="text-lg md:text-3xl font-bold text-gray-900">
                            🎮 1人回し練習
                        </h1>
                        <p className="text-xs md:text-sm text-gray-600 hidden md:block">
                            デッキコードを入力して、対戦練習を始めましょう
                        </p>
                    </div>
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
                            <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-1 sm:gap-4 w-full h-full max-w-[1400px]">
                                {/* Player 1 - Mobile Order 3 (Bottom) */}
                                {deck1.length > 0 && (
                                    <div className="order-3 md:order-none w-full">
                                        <DeckPractice
                                            ref={player1Ref}
                                            idPrefix="player1"
                                            deck={deck1}
                                            onReset={() => setDeck1([])}
                                            playerName="自分"
                                            compact={true}
                                            mobile={isMobile}
                                            stadium={stadium1}
                                            onStadiumChange={(card: Card | null) => {
                                                setStadium1(card)
                                                setStadium2(null)
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Center Column - Stadium & Tools */}
                                <div className="order-2 md:order-none w-full md:w-32 flex-shrink-0 flex flex-col items-center z-10">
                                    {/* Mobile: P2 - Stadium - Tools - P1 in a Row. */}
                                    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-1 sm:p-2 sticky top-4 md:top-24 w-full flex flex-col items-center justify-center gap-1 md:gap-0 border border-white/50">

                                        {/* Main Battle Row: Opponent - Stadium - Coin/Dmg - Self */}
                                        <div className="flex flex-row items-center justify-center gap-1 md:gap-0 w-full md:flex-col">
                                            {/* Mobile Portal Slot: Opponent Battle (P2) */}
                                            <div id="mobile-battle-p2" className="md:hidden w-[70px] h-[98px] flex-shrink-0 flex items-center justify-center"></div>

                                            {/* Stadium Zone */}
                                            <DroppableZone id="stadium-zone" className="w-[60px] sm:w-[120px] aspect-[5/7] rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] text-center p-0.5 sm:p-2 overflow-visible relative group bg-white/50 flex-shrink-0">
                                                {(stadium1 || stadium2) ? (
                                                    <div
                                                        onClick={(e) => {
                                                            handleStadiumClick(e)
                                                        }}
                                                        className="relative w-full h-full"
                                                    >
                                                        {(() => {
                                                            const activeStadium = stadium1 || stadium2;
                                                            return activeStadium ? (
                                                                <>
                                                                    <Image
                                                                        src={activeStadium.imageUrl}
                                                                        alt={activeStadium.name}
                                                                        fill
                                                                        className="rounded shadow-lg object-contain"
                                                                    />
                                                                    {/* Keep X button as quick shortcut */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setStadium1(null)
                                                                            setStadium2(null)
                                                                        }}
                                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600 z-10"
                                                                    >
                                                                        ×
                                                                    </button>

                                                                    {/* Stadium Action Menu - Absolute Positioned */}
                                                                    {showStadiumMenu && (
                                                                        <div
                                                                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[9999] bg-white rounded shadow-xl border overflow-hidden min-w-[120px]"
                                                                            onClick={e => e.stopPropagation()}
                                                                        >
                                                                            <button
                                                                                onClick={trashStadium}
                                                                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-bold transition-colors whitespace-nowrap"
                                                                            >
                                                                                トラッシュする
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-300">スタジアム</span>
                                                )}
                                            </DroppableZone>

                                            {/* Coin & Damage - Inserted Narrowly Between Stadium and P1 */}
                                            <div className="flex flex-row md:flex-col gap-1 items-center justify-center flex-shrink-0 w-auto h-full sm:w-full md:mt-4 mx-0.5">
                                                {/* Coin */}
                                                <div className="bg-gray-50 rounded p-0.5 text-center w-[40px] md:w-full">
                                                    <h3 className="text-[6px] sm:text-[8px] font-bold text-gray-500 mb-0.5 uppercase tracking-tight md:block hidden">Coin</h3>
                                                    <div className="flex justify-center mb-0.5">
                                                        <div
                                                            onClick={() => setCoinResult(Math.random() < 0.5 ? 'heads' : 'tails')}
                                                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 cursor-pointer transition-all duration-500 flex items-center justify-center text-[10px] font-bold ${coinResult === 'heads' ? 'bg-orange-400 border-orange-600 text-white' : coinResult === 'tails' ? 'bg-white border-gray-400 text-black' : 'bg-gray-200 border-gray-300'}`}
                                                        >
                                                            {/* Tiny indicator */}
                                                            {coinResult === 'heads' ? '表' : coinResult === 'tails' ? '裏' : ''}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Damage */}
                                                <div className="bg-gray-50 rounded p-0.5 text-center w-auto md:w-full grid grid-cols-2 place-items-center md:flex md:flex-col md:flex-wrap justify-center gap-0.5">
                                                    <DraggableDamageCounter amount={100} />
                                                    <DraggableDamageCounter amount={50} />
                                                    <DraggableDamageCounter amount={10} />
                                                    <DraggableDamageCounter amount={-999} />
                                                </div>
                                            </div>

                                            {/* Mobile Portal Slot: Self Battle (P1) */}
                                            <div id="mobile-battle-p1" className="md:hidden w-[70px] h-[98px] flex-shrink-0 flex items-center justify-center"></div>
                                        </div>

                                        {/* PC Only Tools Area (Hidden on Mobile) */}
                                        <div className="hidden md:flex flex-col gap-1 items-center justify-center w-full md:mt-4">
                                            {/* Standard PC Coin & Damage logic */}
                                        </div>
                                    </div>
                                </div>

                                {/* Player 2 - Mobile Order 1 (Top) */}
                                {deck2.length > 0 && (
                                    <div className="order-1 md:order-none w-full">
                                        <DeckPractice
                                            ref={player2Ref}
                                            idPrefix="player2"
                                            deck={deck2}
                                            onReset={() => setDeck2([])}
                                            playerName="相手"
                                            compact={true}
                                            mobile={isMobile}
                                            isOpponent={true}
                                            stadium={stadium2}
                                            onStadiumChange={(card: Card | null) => {
                                                setStadium2(card)
                                                setStadium1(null)
                                            }}
                                        />
                                    </div>
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
                                                        activeDragData.amount === -999 ? 'bg-white border-gray-400 text-black' :
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
                )
                }
            </div >
        </div >
    )
}

// Sub-components for D&D in Practice Page
function DraggableDamageCounter({ amount }: { amount: number }) {
    const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
        id: amount === -999 ? 'damage-counter-clr' : `damage-counter-${amount}`,
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
            ref={setDraggableRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                rounded-full shadow-md flex items-center justify-center font-black border-2 border-white cursor-move hover:scale-110 transition select-none touch-none
                ${amount === 100 ? 'w-10 h-10 bg-red-600 text-xs text-white' : ''}
                ${amount === 50 ? 'w-8 h-8 bg-orange-500 text-[10px] text-white' : ''}
                ${amount === 10 ? 'w-6 h-6 bg-yellow-500 text-black text-[9px]' : ''}
                ${amount === -999 ? 'w-8 h-8 bg-white text-black text-[8px] border-gray-200' : ''}
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
