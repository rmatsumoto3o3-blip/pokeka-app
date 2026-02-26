'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function analyzeDeckDangerAction(
    myBoard: { battle: any; bench: any[]; handCount: number; prizeRemaining: number },
    opponentArchetype: string,
    turn: number
) {
    try {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            throw new Error('AI APIキーが設定されていません。')
        }

        const prompt = `
あなたはポケモンカードゲームのトッププレイヤー兼統計アナリストです。
以下の状況において、次の相手のターンに自分が受ける「詰み」や「崩壊」の危険度（Danger Level）を冷静に分析してください。

## 自分の盤面
- バトル場: ${JSON.stringify(myBoard.battle)}
- ベンチ: ${JSON.stringify(myBoard.bench)}
- 手札枚数: ${myBoard.handCount}
- 残りサイド: ${myBoard.prizeRemaining}

## 相手の想定デッキ
- ${opponentArchetype}

## 状況
- 経過ターン: ${turn}

## 返答形式（JSONのみ）
{
  "dangerLevel": 0から100の数値,
  "reason": "なぜその数値なのか、具体的なリスクを1〜2文で",
  "advice": "今すべきプレイング上の短い助言",
  "nextTurnPrediction": "相手が狙ってくるであろう動きの予測"
}
`

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('Invalid AI response format')

        return { success: true, analysis: JSON.parse(jsonMatch[0]) }
    } catch (error) {
        console.error('AI Analysis Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function getPrizeTrainerFeedbackAction(
    guesses: Record<string, number>,
    actualPrizes: Record<string, number>
) {
    try {
        let matchedSlots = 0
        const cardAnalysis: { name: string; guessed: number; actual: number; status: string }[] = []

        // Create a set of all unique names from both guesses and actual
        const allNames = new Set([...Object.keys(guesses), ...Object.keys(actualPrizes)])

        allNames.forEach(name => {
            const guessed = guesses[name] || 0
            const actual = actualPrizes[name] || 0
            const matched = Math.min(guessed, actual)
            matchedSlots += matched

            let status = 'Mismatch'
            if (guessed === actual) status = 'Perfect'
            else if (matched > 0) status = 'Partial'

            cardAnalysis.push({ name, guessed, actual, status })
        })

        const accuracyScore = Math.round((matchedSlots / 6) * 100)

        const prompt = `
あなたはポケモンカードの熟練ジャッジです。サイド落ち推論トレーニングのフィードバックを行ってください。

## 分析データ
- 正解率: ${accuracyScore}%
- サイドのカード構成 (実際 vs ユーザー予想):
${cardAnalysis.map(a => `- ${a.name}: 実際 ${a.actual}枚 / 予想 ${a.guessed}枚 (${a.status})`).join('\n')}

## 依頼事項
1. スコアに基づいてユーザーを評価（80%以上なら絶賛、50-79%なら具体的アドバイス、それ以下なら励まし）してください。
2. 同名カードが複数サイド落ちしていた場合の指摘や、重要カード（ACE SPECや特定のアタッカー）の有無に言及してください。
3. 2〜3文で、親しみやすくかつプロフェッショナルなトーンで回答してください。
`

        const result = await model.generateContent(prompt)
        return {
            success: true,
            message: result.response.text(),
            accuracyScore
        }
    } catch (error) {
        console.error('AI Feedback Error:', error)
        return { success: false, error: (error as Error).message }
    }
}
