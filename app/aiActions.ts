'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/app/actions'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
// 画像読み取り用。速度優先で 2.0-flash（枚数は人が補正する前提）。
// 精度が要る場合は 'gemini-2.5-flash' に戻す。
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

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

// ============================================================
// デッキ写真 → デッキリスト化（管理者専用）
//   Gemini Visionでカード名+枚数を抽出 → カードマスタ照合で
//   imageUrl/supertype/subtypes を補完し、cards_json形式で返す。
//   Supabaseへの書き込みは行わない（読み取り専用）。
// ============================================================
export interface ScannedCard {
    name: string
    quantity: number
    imageUrl: string | null
    supertype: string
    subtypes: string[]
    matched: boolean          // マスタと一致したか
    suggestion?: string       // あいまい一致で補正した場合の元名
}

function normalizeName(s: string): string {
    return s
        .replace(/\s|　/g, '')
        .replace(/[（(].*?[)）]/g, '') // (ACE SPEC)等の括弧を無視
        .replace(/ex|EX|ｅｘ/gi, 'ex')
        .toLowerCase()
}

function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
    for (let j = 0; j <= n; j++) dp[0][j] = j
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        }
    }
    return dp[m][n]
}

export async function scanDeckImageAction(imageBase64: string, mimeType: string) {
    const admin = await verifyAdminSession()
    if (!admin) return { success: false as const, error: '権限がありません', cards: [] }
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return { success: false as const, error: 'AI APIキーが未設定です', cards: [] }
    }

    try {
        const prompt = `この画像にはポケモンカードゲームのカードが並んでいます（デッキ全体ではなく一部＝分割撮影の場合もあります）。
各カードの「上部に印刷されたカード名」を最優先で読み取ってください。イラストではなく上端の名前の文字列で判断します。
同名カードが重ねて置かれている場合、その重なり枚数＝枚数です。基本エネルギーは1種類にまとめて数えます。
JSONで出力:
{"cards":[{"name":"日本語カード名","count":枚数}]}
- 同じnameは1エントリに合算。名前が読み取れないカードは name を "?" にする（省略しない）。JSONのみ出力。`

        const result = await visionModel.generateContent({
            contents: [{ role: 'user', parts: [
                { text: prompt },
                { inlineData: { data: imageBase64, mimeType } },
            ] }],
            generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        })
        const raw = result.response.text().replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(raw) as { cards?: { name: string; count: number }[] }
        const ocr = parsed.cards || []
        if (ocr.length === 0) return { success: false as const, error: 'カードを読み取れませんでした', cards: [] }

        // カードマスタ取得（名前→メタ情報）
        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const { data: master } = await supabase
            .from('global_card_stats')
            .select('card_name, image_url, supertype, subtypes')
            .eq('event_rank', 'ALL')
            .not('image_url', 'is', null)

        const byExact = new Map<string, any>()
        const byNorm = new Map<string, any>()
        ;(master || []).forEach(r => {
            if (!byExact.has(r.card_name)) byExact.set(r.card_name, r)
            const nk = normalizeName(r.card_name)
            if (!byNorm.has(nk)) byNorm.set(nk, r)
        })
        const masterNames = Array.from(byExact.keys())

        const cards: ScannedCard[] = ocr.map(c => {
            const name = (c.name || '').trim()
            const qty = Math.max(0, parseInt(String(c.count)) || 0)
            // ① 完全一致
            let hit = byExact.get(name)
            let suggestion: string | undefined
            // ② 正規化一致
            if (!hit) hit = byNorm.get(normalizeName(name))
            // ③ あいまい一致（編集距離）
            if (!hit && name && name !== '?') {
                let best: string | null = null, bestD = Infinity
                for (const mn of masterNames) {
                    const d = levenshtein(normalizeName(name), normalizeName(mn))
                    if (d < bestD) { bestD = d; best = mn }
                }
                if (best && bestD <= Math.max(1, Math.floor(normalizeName(best).length * 0.34))) {
                    hit = byExact.get(best); suggestion = name
                }
            }
            if (hit) {
                return {
                    name: hit.card_name, quantity: qty, imageUrl: hit.image_url,
                    supertype: hit.supertype || 'Pokémon',
                    subtypes: Array.isArray(hit.subtypes) ? hit.subtypes : [],
                    matched: true, suggestion,
                }
            }
            return { name, quantity: qty, imageUrl: null, supertype: 'Pokémon', subtypes: [], matched: false }
        })

        return { success: true as const, cards }
    } catch (e) {
        console.error('scanDeckImage error:', e)
        return { success: false as const, error: '画像の解析に失敗しました', cards: [] }
    }
}
