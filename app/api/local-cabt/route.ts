import { NextRequest, NextResponse } from 'next/server'

const CABT_BRIDGE_URL = process.env.CABT_BRIDGE_URL || 'http://127.0.0.1:8765'

export async function GET() {
    return proxy('/state', {}, 'GET')
}

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}))
    const command = typeof body.command === 'string' ? body.command : 'state'

    if (command === 'start') return proxy('/start', body)
    if (command === 'select') return proxy('/select', body)
    if (command === 'health') return proxy('/health', {}, 'GET')
    return proxy('/state', {}, 'GET')
}

async function proxy(path: string, body: Record<string, unknown>, method: 'GET' | 'POST' = 'POST') {
    try {
        const response = await fetch(`${CABT_BRIDGE_URL}${path}`, {
            method,
            headers: method === 'POST' ? { 'content-type': 'application/json' } : undefined,
            body: method === 'POST' ? JSON.stringify(body) : undefined,
            cache: 'no-store',
        })
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        return NextResponse.json({
            ok: false,
            error: error instanceof Error ? error.message : String(error),
            hint: 'ローカルcabtブリッジが起動していません。ptcgabcで scripts/run_cabt_bridge.sh を起動してください。',
        }, { status: 503 })
    }
}
