import { NextRequest, NextResponse } from 'next/server'

const CABT_BRIDGE_URL = process.env.CABT_BRIDGE_URL || 'http://127.0.0.1:8765'
const CABT_BRIDGE_TOKEN = process.env.CABT_BRIDGE_TOKEN || process.env.CPU_ENGINE_TOKEN
const CPU_BATTLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CPU_BATTLE === '1'

export async function GET() {
    if (!CPU_BATTLE_ENABLED) return disabledResponse()
    return proxy('/state', {}, 'GET')
}

export async function POST(request: NextRequest) {
    if (!CPU_BATTLE_ENABLED) return disabledResponse()

    const body = await request.json().catch(() => ({}))
    const command = typeof body.command === 'string' ? body.command : 'state'

    if (command === 'start') return proxy('/start', body)
    if (command === 'select') return proxy('/select', body)
    if (command === 'health') return proxy('/health', {}, 'GET')
    return proxy('/state', {}, 'GET')
}

async function proxy(path: string, body: Record<string, unknown>, method: 'GET' | 'POST' = 'POST') {
    try {
        const headers: Record<string, string> = {}
        if (method === 'POST') headers['content-type'] = 'application/json'
        if (CABT_BRIDGE_TOKEN) headers.authorization = `Bearer ${CABT_BRIDGE_TOKEN}`

        const response = await fetch(`${CABT_BRIDGE_URL}${path}`, {
            method,
            headers,
            body: method === 'POST' ? JSON.stringify(body) : undefined,
            cache: 'no-store',
        })
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        return NextResponse.json({
            ok: false,
            error: error instanceof Error ? error.message : String(error),
            hint: 'CPUエンジンに接続できません。ローカルならptcgabcで scripts/run_cabt_bridge.sh、公開環境ならCloud RunのCABT_BRIDGE_URLを確認してください。',
        }, { status: 503 })
    }
}

function disabledResponse() {
    return NextResponse.json({
        ok: false,
        error: 'CPU battle is disabled',
    }, { status: 403 })
}
