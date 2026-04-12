'use client'
import React from 'react'

export default function NumericalSidePrize({ count, isPlayer1, onClick }: { count: number, isPlayer1: boolean, onClick?: () => void }) {
    const themeColor = isPlayer1 ? 'rgba(56, 189, 248, 0.8)' : 'rgba(248, 113, 113, 0.8)' // Sky-400 or Red-400
    const shadowColor = isPlayer1 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(248, 113, 113, 0.4)'

    return (
        <div 
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-300 overflow-hidden relative group 
                ${onClick ? 'cursor-pointer hover:scale-[1.05] active:scale-95' : ''}
            `}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderColor: themeColor,
                boxShadow: `0 0 20px ${shadowColor}, inset 0 0 10px ${shadowColor}`,
                width: '100%',
                height: '100%'
            }}
        >
            {/* Pulsing Glow Animation for Clickable State */}
            {onClick && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:animate-pulse transition-opacity duration-300 pointer-events-none" />
            )}

            {/* Animated Background Accents */}
            <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-60 transition-opacity duration-700"
                style={{
                    background: `radial-gradient(circle at center, ${themeColor} 0%, transparent 70%)`
                }}
            />

            <span className="text-[8px] font-black text-white/40 mb-0.5 uppercase tracking-[0.2em] relative z-10 transition-colors group-hover:text-white">
                {count === 0 ? 'WINNER' : 'SIDE'}
            </span>
            
            <div className="relative">
                {/* Subtle Glow effect */}
                <div 
                    className="absolute inset-0 blur-lg opacity-30 transition-opacity group-hover:opacity-60"
                    style={{ backgroundColor: themeColor }}
                ></div>
                
                <div 
                    className={`text-3xl md:text-4xl font-black italic relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all
                        ${count === 0 ? 'text-yellow-400 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'text-white'}
                    `}
                    style={{ color: count === 0 ? '#fac015' : '#ffffff' }}
                >
                    {count}
                </div>
            </div>

            <div 
                className="mt-1 h-0.5 w-8 rounded-full relative z-10 overflow-hidden"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
                <div 
                    className="h-full transition-all duration-1000 ease-out"
                    style={{ 
                        width: `${(count / 6) * 100}%`,
                        backgroundColor: themeColor,
                        boxShadow: `0 0 10px ${themeColor}`
                    }}
                />
            </div>

            {/* Click to take hint (only if cards left) */}
            {onClick && count > 0 && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
                    <span className="text-[6px] font-black text-white/30 uppercase tracking-tighter">Click to Take</span>
                </div>
            )}
        </div>
    )
}
