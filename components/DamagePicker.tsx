'use client'
import React from 'react'

type Status = 'none' | 'poison' | 'burn' | 'confused' | 'asleep' | 'paralyzed'

export default function DamagePicker({ 
  onApply, 
  onReset, 
  onStatusChange,
  onClose 
}: { 
  onApply: (n: number) => void, 
  onReset: () => void, 
  onStatusChange?: (s: Status) => void,
  onClose: () => void 
}) {
  const statuses: { label: string, value: Status, color: string, glow: string }[] = [
    { label: 'どく', value: 'poison', color: 'bg-purple-600/80', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]' },
    { label: 'やけど', value: 'burn', color: 'bg-orange-600/80', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]' },
    { label: 'ねむり', value: 'asleep', color: 'bg-blue-600/80', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
    { label: 'マヒ', value: 'paralyzed', color: 'bg-yellow-500/80', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' },
    { label: 'こんらん', value: 'confused', color: 'bg-pink-600/80', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.5)]' },
    { label: '回復', value: 'none', color: 'bg-emerald-600/80', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' },
  ]

  return (
    <div 
      className="absolute inset-x-[-20px] inset-y-[-10px] z-[100] flex items-center justify-center bg-[#0a0a0c]/80 backdrop-blur-2xl rounded-3xl p-4 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300" 
      onClick={e => e.stopPropagation()}
    >
      <div className="flex flex-col gap-5 w-48">
        <div>
          <p className="text-[10px] text-white/30 font-black mb-3 uppercase text-center tracking-[0.3em]">Adjust Damage</p>
          <div className="grid grid-cols-2 gap-2">
            {[10, 50, 100].map(n => (
              <button 
                key={n} 
                onClick={() => { onApply(n); onClose(); }} 
                className="group relative p-3 bg-red-600/80 hover:bg-red-500 text-white text-xs font-black rounded-xl active:scale-90 transition-all shadow-[0_4px_15px_rgba(220,38,38,0.3)] border border-white/20"
              >
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity rounded-xl"></div>
                 +{n}
              </button>
            ))}
            <button 
                onClick={() => { onReset(); onClose(); }} 
                className="p-3 bg-slate-700/80 hover:bg-slate-600 text-white text-xs font-black rounded-xl active:scale-90 transition-all border border-white/10"
            >
                RESET
            </button>
          </div>
        </div>

        <div className="h-px bg-white/10"></div>

        <div>
           <p className="text-[10px] text-white/30 font-black mb-3 uppercase text-center tracking-[0.3em]">Status Effect</p>
           <div className="grid grid-cols-2 gap-2">
             {statuses.map(s => (
               <button 
                 key={s.value} 
                 onClick={() => { onStatusChange?.(s.value); onClose(); }} 
                 className={`p-2 ${s.color} ${s.glow} text-white text-[10px] font-bold rounded-lg active:scale-90 transition-all border border-white/10 hover:brightness-125`}
               >
                 {s.label}
               </button>
             ))}
           </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-full p-2.5 mt-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-black rounded-full uppercase tracking-widest transition-all border border-white/5 hover:border-white/20 active:scale-95"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
