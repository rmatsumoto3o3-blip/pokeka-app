'use client'

import Image from 'next/image'
import { type CardStack, isEnergy, isTool, isPokemon } from '@/lib/cardStack'

export function CascadingStack({ stack, width, height, onDamageChange, onDamageClick }: { stack: CardStack, width: number, height: number, onDamageChange?: (delta: number) => void, onDamageClick?: () => void }) {
    const cardOffset = 15 // pixels to show of card below
    const maxVisible = 5

    // Find the index of the top-most Pokemon (the operational active card)
    let topPokemonIndex = -1
    for (let i = stack.cards.length - 1; i >= 0; i--) {
        if (isPokemon(stack.cards[i])) {
            topPokemonIndex = i
            break
        }
    }
    if (topPokemonIndex === -1 && stack.cards.length > 0) topPokemonIndex = 0

    // Status configurations with intensified glows
    const statusConfig: Record<string, { label: string, color: string, glow: string }> = {
        poison: { label: 'どく', color: 'bg-purple-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.9),0_0_40px_rgba(168,85,247,0.4)]' },
        burn: { label: 'やけど', color: 'bg-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.9),0_0_40px_rgba(249,115,22,0.4)]' },
        asleep: { label: 'ねむり', color: 'bg-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.9),0_0_40px_rgba(59,130,246,0.4)]' },
        paralyzed: { label: 'マヒ', color: 'bg-yellow-400', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.9),0_0_40px_rgba(234,179,8,0.4)]' },
        confused: { label: 'こんらん', color: 'bg-pink-500', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.9),0_0_40px_rgba(236,72,153,0.4)]' },
    }

    return (
        <div
            className="relative"
            style={{
                width: width,
                height: height
            }}
        >
            {stack.cards.map((card, i) => {
                const isEnergyCard = isEnergy(card)
                const isToolCard = isTool(card)
                const isTopPokemon = i === topPokemonIndex

                const hideFromStack = (isEnergyCard || isToolCard)
                if (hideFromStack) return null

                const zIndexValue = isTopPokemon ? (stack.cards.length + 10) : (stack.cards.length - i)
                const currentStatus = stack.status && stack.status !== 'none' ? statusConfig[stack.status] : null

                return (
                    <div
                        key={i}
                        className="absolute left-0 transition-all duration-500"
                        style={{
                            bottom: 0,
                            marginBottom: 0,
                            zIndex: zIndexValue
                        }}
                    >
                        <Image
                            src={card.imageUrl}
                            alt={card.name}
                            width={width}
                            height={height}
                            className={`rounded-lg shadow-2xl bg-[#0a0a0c] no-touch-menu no-select no-tap-highlight ring-1 ring-white/10 transition-shadow duration-500 ${isTopPokemon && currentStatus ? currentStatus.glow : 'shadow-black/50'}`}
                            draggable={false}
                            unoptimized
                        />
                        {/* Dramatic Inner Shadow for Depth */}
                        {isTopPokemon && (
                            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20 pointer-events-none"></div>
                        )}
                    </div>
                )
            })}

            {/* Attached Energy Icons Layer (Bottom Left) */}
            {stack.cards.filter(c => isEnergy(c)).map((card, i) => (
                <div
                    key={`energy-${i}`}
                    className="absolute z-[100] drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] hover:scale-150 transition-transform origin-bottom-left"
                    style={{
                        bottom: 4 + (i * 8),
                        left: -4,
                        width: width / 3.5,
                        height: height / 3.5,
                    }}
                >
                    <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={width / 3.5}
                        height={height / 3.5}
                        className="rounded-full border-2 border-white/40 bg-black/50 backdrop-blur-sm"
                        unoptimized
                    />
                </div>
            ))}

            {/* Attached Tool Icons Layer (Top Left) */}
            {stack.cards.filter(c => isTool(c)).map((card, i) => (
                <div
                    key={`tool-${i}`}
                    className="absolute z-[100] drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] hover:scale-150 transition-transform origin-top-left"
                    style={{
                        top: 25 + (i * 8),
                        left: -4,
                        width: width / 3.5,
                        height: height / 3.5,
                    }}
                >
                    <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={width / 3.5}
                        height={height / 3.5}
                        className="rounded-lg border-2 border-white/40 bg-black/50 backdrop-blur-sm"
                        unoptimized
                    />
                </div>
            ))}

            {/* Status & Damage Badges Row */}
            <div className="absolute bottom-1 right-1 z-[200] flex gap-1.5 items-end justify-end pointer-events-auto">
                {/* Status Badge - Luxury Style */}
                {stack.status && stack.status !== 'none' && (
                    <div
                        className={`${statusConfig[stack.status]?.color || 'bg-gray-600'} text-white px-2 py-0.5 rounded-md text-[9px] font-black shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/50 backdrop-blur-md animate-pulse cursor-pointer transition-transform active:scale-90`}
                        onClick={(e) => { e.stopPropagation(); onDamageClick?.(); }}
                        style={{ boxShadow: `0 0 10px ${statusConfig[stack.status]?.color.replace('bg-', '')}` }}
                    >
                        {statusConfig[stack.status]?.label}
                    </div>
                )}

                {/* Damage Counter Badge - Professional Neumorphic/Neon */}
                {stack.damage > 0 && (
                    <div
                        className="bg-red-600 text-white px-2.5 py-1 rounded-xl text-[11px] font-black shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-white/60 backdrop-blur-md animate-pulse-subtle cursor-pointer transition-all active:scale-90 flex items-center justify-center min-w-[28px]"
                        onClick={(e) => {
                            if (onDamageClick) {
                                e.stopPropagation();
                                onDamageClick();
                            }
                        }}
                    >
                        <span className="text-center drop-shadow-sm">{stack.damage}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
