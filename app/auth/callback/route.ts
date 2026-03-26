import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL after successful login
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data?.user) {
            // プロフィールの同期 (新規・既存の両方に対応)
            const { id, email, user_metadata } = data.user
            await supabase
                .from('users')
                .upsert({
                    id: id,
                    email: email || 'no-email@example.com',
                    nickname: user_metadata.nickname || 
                              user_metadata.full_name || 
                              user_metadata.name || 
                              user_metadata.user_name || 
                              email?.split('@')[0] || 
                              'User'
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
        } else if (error) {
            console.error('Auth error during code exchange:', error)
            return NextResponse.redirect(`${origin}/auth/auth-error?error=${encodeURIComponent(error.message)}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-error?error=missing_code`)
}
