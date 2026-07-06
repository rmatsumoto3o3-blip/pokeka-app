import { type RefObject, useEffect, useRef, useState } from 'react'
import { type DeckPracticeRef } from '@/components/DeckPractice'
import { runBasicCpuSetup, runBasicCpuTurn, type CpuDecisionLog } from '@/lib/cpu/basicCpu'

interface UseCpuOpponentParams {
    enabled: boolean
    activePlayer: 'player1' | 'player2'
    player1Ref: RefObject<DeckPracticeRef | null>
    player2Ref: RefObject<DeckPracticeRef | null>
}

export function useCpuOpponent({ enabled, activePlayer, player1Ref, player2Ref }: UseCpuOpponentParams) {
    const [isThinking, setIsThinking] = useState(false)
    const [logs, setLogs] = useState<CpuDecisionLog[]>([])
    const runningRef = useRef(false)

    useEffect(() => {
        if (!enabled || runningRef.current) return

        const cpu = player2Ref.current
        const needsSetup = Boolean(cpu && !cpu.getBattleField() && cpu.getHand().length > 0)
        const shouldPlayTurn = activePlayer === 'player2'
        if (!needsSetup && !shouldPlayTurn) return

        runningRef.current = true

        const timer = window.setTimeout(() => {
            setIsThinking(true)
            const task = needsSetup
                ? runBasicCpuSetup({ self: player2Ref, opponent: player1Ref })
                : runBasicCpuTurn({ self: player2Ref, opponent: player1Ref })

            task
                .then(result => setLogs(result.logs))
                .catch(error => {
                    console.error('CPU turn failed:', error)
                    setLogs([{ label: 'CPUエラー', detail: error instanceof Error ? error.message : String(error) }])
                })
                .finally(() => {
                    setIsThinking(false)
                    runningRef.current = false
                })
        }, 500)

        return () => {
            window.clearTimeout(timer)
            runningRef.current = false
        }
    }, [activePlayer, enabled, player1Ref, player2Ref])

    return { isThinking, logs }
}
