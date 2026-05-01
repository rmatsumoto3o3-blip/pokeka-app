import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL after successful login
    // next パラメータは相対パスのみ許可（オープンリダイレクト対策）
    const rawNext = searchParams.get('next') ?? '/dashboard'
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
        console.error('Auth error from provider:', error, errorDescription)
        return NextResponse.redirect(`${origin}/auth/auth-error?error=auth_failed`)
    }

    if (code) {
        const supabase = await createClient()
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!exchangeError && data?.user) {
            // Update public.users profile with Discord ID if available
            const user = data.user
            const nickname = user.user_metadata?.nickname || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            const discord_id = user.user_metadata?.provider_id || (user.app_metadata?.provider === 'discord' ? user.identities?.[0]?.id : null)
            const avatar_url = user.user_metadata?.avatar_url || null

            const { error: upsertError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email,
                    nickname: nickname,
                    discord_id: discord_id,
                    discord_avatar: avatar_url
                }, { onConflict: 'id' })

            const forwardedHost = request.headers.get('x-forwarded-host') // Hello, Vercel
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else if (exchangeError) {
            console.error('Auth error during code exchange:', exchangeError)
            return NextResponse.redirect(`${origin}/auth/auth-error?error=exchange_failed`)
        }
    }

    // return the user to an error page with instructions
    console.error('Missing code param in auth callback')
    return NextResponse.redirect(`${origin}/auth/auth-error?error=missing_code`)
}
