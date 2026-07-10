import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'PokéLix（ポケリス）'
  const desc = searchParams.get('desc') || 'ポケカ環境分析・確率シミュレーター'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 装飾：背景の光彩 */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '200px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '150px',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)',
          }}
        />

        {/* バッジ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(99,102,241,0.2)',
            border: '1px solid rgba(99,102,241,0.5)',
            borderRadius: '100px',
            padding: '8px 24px',
            marginBottom: '32px',
          }}
        >
          <span style={{ color: '#a5b4fc', fontSize: '18px', fontWeight: 600, letterSpacing: '2px' }}>
            🎴 POKÉMON TCG ANALYTICS
          </span>
        </div>

        {/* メインタイトル */}
        <div
          style={{
            fontSize: title.length > 20 ? '52px' : '68px',
            fontWeight: 900,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '20px',
            textShadow: '0 0 40px rgba(99,102,241,0.8)',
            maxWidth: '1000px',
            padding: '0 40px',
          }}
        >
          {title}
        </div>

        {/* サブタイトル */}
        <div
          style={{
            fontSize: '28px',
            color: '#c7d2fe',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '900px',
          }}
        >
          {desc}
        </div>

        {/* 機能タグ */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['初手確率', 'サイド落ち', '一人回し', '環境デッキ'].map((tag) => (
            <div
              key={tag}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '10px 20px',
                color: '#e0e7ff',
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* ドメイン */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            right: '48px',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '18px',
          }}
        >
          pokelix.jp
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
