import { Dispatch, SetStateAction } from 'react'
import { type Card } from '@/lib/deckParser'
import { isEnergy } from '@/lib/cardStack'
import {
    type AkamatsuState,
    type DawnState,
    type FanCallState,
    type GlassTrumpetState,
    type TeraOrbState,
    type BrocksScoutState,
    type RagingBoltState,
    type NoctowlState,
    type PoffinState,
} from '@/components/practice/types'

export interface MenuBuilderParams {
    // State values
    remaining: Card[]
    trash: Card[]
    fanCallUsedThisTurn: boolean

    // State setters
    setAkamatsuState: Dispatch<SetStateAction<AkamatsuState | null>>
    setDawnState: Dispatch<SetStateAction<DawnState | null>>
    setFanCallState: Dispatch<SetStateAction<FanCallState | null>>
    setFanCallUsedThisTurn: Dispatch<SetStateAction<boolean>>
    setGlassTrumpetState: Dispatch<SetStateAction<GlassTrumpetState | null>>
    setTeraOrbState: Dispatch<SetStateAction<TeraOrbState | null>>
    setBrocksScoutState: Dispatch<SetStateAction<BrocksScoutState | null>>
    setRagingBoltState: Dispatch<SetStateAction<RagingBoltState | null>>
    setNoctowlState: Dispatch<SetStateAction<NoctowlState | null>>
    setPokePadState: Dispatch<SetStateAction<Card[] | null>>

    // Local utility functions
    closeMenu: () => void
    moveToTrash: (index: number) => void

    // Handler functions from useCardEffectHandlers
    useLillie: (handIndex?: number) => void
    useAthena: (handIndex?: number) => void
    useApollo: (handIndex?: number) => void
    useJudge: (handIndex?: number) => void
    useCarmine: (handIndex?: number) => void
    usePoffin: (handIndex: number) => void
    useBossOrders: (handIndex: number) => void
    useTouko: (handIndex: number) => void
    useFightGong: (handIndex: number) => void
    useUnfairStamp: (handIndex?: number) => void
    usePokegear: () => void
    useTatsugiri: () => void
    useOgerpon: (source: string, index: number) => void
    useZoroark: () => void
    useFezandipiti: () => void
    useDudunsparce: (source: 'battle' | 'bench', index: number) => void
    useMeowthEX: (handIndex: number) => void
    useBugCatchingSet: (handIndex: number) => void
    useEnergySwitch: (handIndex: number) => void
    useEnergyRetrieval: (handIndex: number) => void
    useNoctowl: (handIndex: number) => void
    useMegaLucarioEX: (source: 'battle' | 'bench', index: number) => void
    useKangaskhanEX: (source: 'battle' | 'bench', index: number) => void
    useGenesectEX: () => void
    useArchaludonEX: (handIndex?: number) => void
    useLunaCycle: (source: 'battle' | 'bench', index: number) => void
    useNPointUp: (handIndex: number) => void
    useCyano: (handIndex: number) => void
    useOgerponWellspring: (source: 'battle' | 'bench', index: number) => void
    usePreciousCarrier: (handIndex: number) => void
    usePrimeCatcher: (handIndex: number) => void
    usePokemonSwitch: (handIndex: number) => void
    usePecharuntChainOfCommand: (index: number, source: 'battle' | 'bench') => void
    useFlareonBurningCharge: (source: 'battle' | 'bench', index: number) => void
    useMunkidoriAdrenalBrain: (index: number, source: 'battle' | 'bench') => void
    useUltraBall: (handIndex: number) => void
    useTeisatsuShirei: () => void
    useNightStretcher: (handIndex?: number) => void
    useLambda: (handIndex?: number) => void
    handleCursedBomb: (source: 'battle' | 'bench', index: number, damage: number) => void
    handlePsychicDraw: (drawCount: number) => void
    handleBurstingRoar: () => void

    // Effect callbacks
    onEffectTrigger?: (effect: 'judge' | 'apollo' | 'unfair_stamp' | 'boss_orders' | 'special_red_card' | 'xerosic', amount?: number) => void
}

export function useMenuBuilder(params: MenuBuilderParams) {
    const {
        remaining,
        trash,
        fanCallUsedThisTurn,
        setAkamatsuState,
        setDawnState,
        setFanCallState,
        setFanCallUsedThisTurn,
        setGlassTrumpetState,
        setTeraOrbState,
        setBrocksScoutState,
        setRagingBoltState,
        setNoctowlState,
        setPokePadState,
        closeMenu,
        moveToTrash,
        useLillie,
        useAthena,
        useApollo,
        useJudge,
        useCarmine,
        usePoffin,
        useBossOrders,
        useTouko,
        useFightGong,
        useUnfairStamp,
        usePokegear,
        useTatsugiri,
        useOgerpon,
        useZoroark,
        useFezandipiti,
        useDudunsparce,
        useMeowthEX,
        useBugCatchingSet,
        useEnergySwitch,
        useEnergyRetrieval,
        useNoctowl,
        useMegaLucarioEX,
        useKangaskhanEX,
        useGenesectEX,
        useArchaludonEX,
        useLunaCycle,
        useNPointUp,
        useCyano,
        useOgerponWellspring,
        usePreciousCarrier,
        usePrimeCatcher,
        usePokemonSwitch,
        usePecharuntChainOfCommand,
        useFlareonBurningCharge,
        useMunkidoriAdrenalBrain,
        useUltraBall,
        useTeisatsuShirei,
        useNightStretcher,
        useLambda,
        handleCursedBomb,
        handlePsychicDraw,
        handleBurstingRoar,
        onEffectTrigger,
    } = params

    const getCardSpecificActions = (card: Card, index: number, source: string): { label: string; action: () => void; color: string }[] => {
        const name = card.name
        const actions: { label: string; action: () => void; color: string }[] = []

        if (name === 'リーリエの決心') {
            actions.push({
                label: 'リーリエの決心を使用',
                action: () => {
                    useLillie(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-pink-100 text-pink-700 hover:bg-pink-200'
            })
        }

        if (name === 'アカマツ') {
            actions.push({
                label: 'アカマツを使用',
                action: () => {
                    const energies = remaining.filter(c => isEnergy(c))
                    if (energies.length === 0) {
                        alert("山札にエネルギーがありません")
                        return
                    }
                    if (source === 'hand') moveToTrash(index)
                    // Show full deck but highlight energies
                    setAkamatsuState({
                        step: 'select_two',
                        candidates: [...remaining],
                        selectedIndices: [],
                        forHandIndex: null
                    })
                    closeMenu()
                },
                color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            })
        }


        if (name === 'ロケット団のアテナ') {
            actions.push({
                label: 'アテナを使用',
                action: () => {
                    useAthena(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }

        if (name === 'スペシャルレッドカード') {
            actions.push({
                label: '使用する',
                action: () => {
                    // Actual check happens in parent via onEffectTrigger
                    onEffectTrigger?.('special_red_card')
                    if (source === 'hand') moveToTrash(index)
                    closeMenu()
                },
                color: 'bg-red-100 text-red-700 hover:bg-red-200'
            })
        }

        if (name === 'ロケット団のアポロ') {
            actions.push({
                label: 'アポロを使用',
                action: () => {
                    useApollo(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }


        if (name === 'ジャッジマン') {
            actions.push({
                label: 'ジャッジマンを使用',
                action: () => {
                    useJudge(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            })
        }

        if (name === 'ゼイユ') {
            actions.push({
                label: 'ゼイユを使用',
                action: () => {
                    useCarmine(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }

        if (name === 'クセロシキのたくらみ') {
            actions.push({
                label: '使用する',
                action: () => {
                    onEffectTrigger?.('xerosic')
                    if (source === 'hand') moveToTrash(index)
                    closeMenu()
                },
                color: 'bg-red-100 text-red-700 hover:bg-red-200'
            })
        }


        if (name === 'サマヨール' || name === 'ヨノワール') {
            const damage = name === 'ヨノワール' ? 13 : 5
            actions.push({
                label: `カースドボムを使用 (${damage}個)`,
                action: () => {
                    handleCursedBomb(source as 'battle' | 'bench', index, damage)
                    closeMenu()
                },
                color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            })
        }

        if (name === 'フーディン' || name === 'ユンゲラー') {
            const drawCount = name === 'フーディン' ? 3 : 2
            actions.push({
                label: `サイコドロー (${drawCount}枚)`,
                action: () => {
                    handlePsychicDraw(drawCount)
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            })
        }

        if (name === 'ポケパッド') {
            actions.push({
                label: 'ポケパッドを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    setPokePadState([...remaining])
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            })
        }

        if (name === 'ハイパーボール') {
            actions.push({
                label: 'ハイパーボールを使用',
                action: () => {
                    if (source === 'hand') {
                        useUltraBall(index)
                    } else {
                        // If not from hand (e.g. from deck/trash usage), just shuffle?
                        // But normally these are only played from hand.
                        alert("手札から使用してください")
                    }
                    closeMenu()
                },
                color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            })
        }

        if (name === 'ヒカリ') {
            actions.push({
                label: 'ヒカリを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    setDawnState({
                        step: 'search',
                        candidates: [...remaining],
                        selectedIndices: []
                    })
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            })
        }

        if (name === 'スピンロトム') {
            actions.push({
                label: 'ファンコールを使用',
                action: () => {
                    if (fanCallUsedThisTurn) {
                        alert("この番、すでに別の「ファンコール」を使っています")
                        return
                    }
                    setFanCallState({
                        step: 'search',
                        candidates: [...remaining],
                        selectedIndices: []
                    })
                    setFanCallUsedThisTurn(true)
                    closeMenu()
                },
                color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            })
        }

        if (name === 'タケルライコex') {
            actions.push({
                label: 'はじけるほうこう (ワザ)',
                action: () => {
                    handleBurstingRoar()
                    closeMenu()
                },
                color: 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
            })
            actions.push({
                label: 'きょくらいごう (ワザ)',
                action: () => {
                    setRagingBoltState({
                        step: 'select_energy',
                        selectedEnergies: []
                    })
                    closeMenu()
                },
                color: 'bg-red-50 text-red-800 hover:bg-red-100'
            })
        }

        if (name === 'ガラスのラッパ') {
            actions.push({
                label: 'ガラスのラッパを使用',
                action: () => {
                    const basicEnergies = trash.filter(c => isEnergy(c) && (c.subtypes?.includes('Basic') || !c.subtypes?.includes('Special')))
                    if (basicEnergies.length === 0) {
                        alert("トラッシュに基本エネルギーがありません")
                        return
                    }
                    if (source === 'hand') moveToTrash(index)
                    setGlassTrumpetState({
                        step: 'select_energy',
                        candidates: basicEnergies,
                        selectedEnergyIndices: [],
                        targetBenchIndices: []
                    })
                    closeMenu()
                },
                color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
            })
        }

        if (name === 'テラスタルオーブ') {
            actions.push({
                label: 'テラスタルオーブを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    setTeraOrbState({
                        step: 'search',
                        candidates: [...remaining],
                        selectedIndex: null
                    })
                    closeMenu()
                },
                color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            })
        }

        if (name === 'タケシのスカウト') {
            actions.push({
                label: 'タケシのスカウトを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    setBrocksScoutState({
                        step: 'search',
                        candidates: [...remaining],
                        selectedIndices: []
                    })
                    closeMenu()
                },
                color: 'bg-stone-200 text-stone-800 hover:bg-stone-300'
            })
        }

        if (name.includes('なかよしポフィン')) {
            actions.push({
                label: 'なかよしポフィンを使用',
                action: () => {
                    if (source === 'hand') {
                        usePoffin(index)
                    } else {
                        alert("手札から使用してください")
                    }
                    closeMenu()
                },
                color: 'bg-pink-50 text-pink-600 hover:bg-pink-100'
            })
        }

        if (name === 'ボスの指令') {
            actions.push({
                label: 'ボスの指令を使用',
                action: () => {
                    if (source === 'hand') useBossOrders(index)
                    closeMenu()
                },
                color: 'bg-red-100 text-red-700 hover:bg-red-200'
            })
        }

        if (name === 'トウコ') {
            actions.push({
                label: 'トウコを使用',
                action: () => {
                    if (source === 'hand') useTouko(index)
                    closeMenu()
                },
                color: 'bg-green-100 text-green-700 hover:bg-green-200'
            })
        }

        if (name === 'ファイトゴング') {
            actions.push({
                label: 'ファイトゴングを使用',
                action: () => {
                    if (source === 'hand') useFightGong(index)
                    closeMenu()
                },
                color: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
            })
        }

        if (name === 'アポロ') {
            actions.push({
                label: 'アポロを使用',
                action: () => {
                    useApollo(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            })
        }

        if (name === 'アテナ') {
            actions.push({
                label: 'アテナを使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    useAthena()
                    closeMenu()
                },
                color: 'bg-green-100 text-green-700 hover:bg-green-200'
            })
        }

        if (name === 'ロケット団のラムダ') {
            actions.push({
                label: 'ラムダを使用',
                action: () => {
                    useLambda(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }

        if (name === '夜のタンカ') {
            actions.push({
                label: '夜のタンカを使用',
                action: () => {
                    useNightStretcher(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            })
        }

        if (name === 'ドロンチ' && (source === 'bench' || source === 'battle')) {
            actions.push({
                label: '特性: ていさつしれい',
                action: () => {
                    useTeisatsuShirei()
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            })
        }

        if (name.includes('アンフェアスタンプ')) {
            actions.push({
                label: 'アンフェアスタンプを使用',
                action: () => {
                    useUnfairStamp(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-red-100 text-red-700 hover:bg-red-200'
            })
        }

        if (name.includes('ポケギア3.0')) {
            actions.push({
                label: 'ポケギア3.0を使用',
                action: () => {
                    if (source === 'hand') moveToTrash(index)
                    usePokegear()
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        // Add more here (e.g., Pokegear logic, etc.)


        if (name === 'シャリタツ' && source === 'battle') {
            actions.push({
                label: '特性: きゃくよせ',
                action: () => {
                    useTatsugiri()
                    closeMenu()
                },
                color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            })
        }

        if (name === 'オーガポン みどりのめんex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: みどりのまい',
                action: () => {
                    useOgerpon(source, index)
                    closeMenu()
                },
                color: 'bg-green-100 text-green-700 hover:bg-green-200'
            })
        }

        if (name === 'Nのゾロアークex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: とりひき',
                action: () => {
                    useZoroark()
                    closeMenu()
                },
                color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            })
        }

        if (name === 'キチキギスex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: さかてにとる',
                action: () => {
                    useFezandipiti()
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }

        if (name === 'ノココッチ' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: にげあしドロー',
                action: () => {
                    useDudunsparce(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            })
        }

        if (name === 'ニャースex' && source === 'hand') {
            actions.push({
                label: 'ベンチに出して特性を使用',
                action: () => {
                    useMeowthEX(index)
                    closeMenu()
                },
                color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            })
        }

        if (name === 'むしとりセット' && source === 'hand') {
            actions.push({
                label: '使用: むしとりセット',
                action: () => {
                    useBugCatchingSet(index)
                    closeMenu()
                },
                color: 'bg-green-50 text-green-700 hover:bg-green-100'
            })
        }

        if (name === 'エネルギーつけかえ' && source === 'hand') {
            actions.push({
                label: '使用: エネルギーつけかえ',
                action: () => {
                    useEnergySwitch(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'エネルギー回収' && source === 'hand') {
            actions.push({
                label: '使用: エネルギー回収',
                action: () => {
                    useEnergyRetrieval(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'ヨルノズク' && (source === 'hand' || source === 'bench')) {
            actions.push({
                label: '特性: ほうせきさがし',
                action: () => {
                    if (source === 'hand') {
                        useNoctowl(index)
                    } else {
                        // If already on bench, just trigger the search part
                        setNoctowlState({
                            step: 'search',
                            candidates: [...remaining],
                            selectedIndices: []
                        })
                    }
                    closeMenu()
                },
                color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            })
        }

        if (name === 'メガルカリオex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: 'ワザ: はどうづき',
                action: () => {
                    useMegaLucarioEX(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            })
        }

        if (name === 'メガガルーラex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: おつかいダッシュ',
                action: () => {
                    useKangaskhanEX(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            })
        }

        if (name === 'ゲノセクトex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: メタルシグナル',
                action: () => {
                    useGenesectEX()
                    closeMenu()
                },
                color: 'bg-red-50 text-red-700 hover:bg-red-100'
            })
        }

        if (name === 'ブリジュラスex' && (source === 'hand' || source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: ごうきんビルド',
                action: () => {
                    useArchaludonEX(source === 'hand' ? index : undefined)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'ルナトーン' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: ルナサイクル',
                action: () => {
                    useLunaCycle(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold'
            })
        }

        if (name === 'Nのポイントアップ' && source === 'hand') {
            actions.push({
                label: 'Nのポイントアップを使用',
                action: () => {
                    useNPointUp(index)
                    closeMenu()
                },
                color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            })
        }

        if (name === 'シアノ' && source === 'hand') {
            actions.push({
                label: 'シアノを使用',
                action: () => {
                    useCyano(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'オーガポン いどのめんex' && source === 'battle') {
            actions.push({
                label: 'ワザ: げきりゅうポンプ',
                action: () => {
                    useOgerponWellspring(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-blue-100 text-blue-900 border-2 border-blue-300 font-black'
            })
        }

        if (name.includes('プレシャスキャリー') && source === 'hand') {
            actions.push({
                label: 'プレシャスキャリーを使用',
                action: () => {
                    usePreciousCarrier(index)
                    closeMenu()
                },
                color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            })
        }

        if (name.includes('プライムキャッチャー') && source === 'hand') {
            actions.push({
                label: 'プライムキャッチャーを使用',
                action: () => {
                    usePrimeCatcher(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'ポケモンいれかえ' && source === 'hand') {
            actions.push({
                label: 'ポケモンいれかえを使用',
                action: () => {
                    usePokemonSwitch(index)
                    closeMenu()
                },
                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            })
        }

        if (name === 'モモワロウex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: しはいのくさり',
                action: () => {
                    usePecharuntChainOfCommand(index, source as 'battle' | 'bench')
                    closeMenu()
                },
                color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            })
        }

        if (name === 'ブースターex' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: 'ワザ: バーニングチャージ',
                action: () => {
                    useFlareonBurningCharge(source as 'battle' | 'bench', index)
                    closeMenu()
                },
                color: 'bg-red-50 text-red-700 hover:bg-red-100'
            })
        }

        if (name === 'マシマシラ' && (source === 'battle' || source === 'bench')) {
            actions.push({
                label: '特性: アドレナブレイン',
                action: () => {
                    useMunkidoriAdrenalBrain(index, source as 'battle' | 'bench')
                    closeMenu()
                },
                color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            })
        }

        return actions
    }

    return { getCardSpecificActions }
}
