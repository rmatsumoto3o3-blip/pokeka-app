'use server'

import { fetchDeckData, type CardData } from '@/lib/deckParser'

export async function getDeckDataAction(deckCode: string): Promise<{ success: boolean, data?: CardData[], error?: string }> {
    try {
        const data = await fetchDeckData(deckCode)
        return { success: true, data }
    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

// --- Phase 26: Freemium Actions ---

import { createClient } from '@supabase/supabase-js'

// Service Role Client for Admin Operations (Bypass RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function getOrCreateProfileAction(userId: string) {
    try {
        // 1. Try to fetch existing profile (using admin to be safe, though public read is allowed for self)
        const { data: profile, error } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (profile) return { success: true, profile }

        // 2. If not found, create default profile
        // SMART CHECK: If user was created before today (Legacy User), give them Premium
        const { data: userAuth, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

        // Default to 'free'
        let initialPlan: 'free' | 'invited' = 'free'
        let initialMaxDecks = 3
        let initialMaxMatches = 100

        if (userAuth?.user?.created_at) {
            const createdAt = new Date(userAuth.user.created_at)
            const cutoffDate = new Date('2025-01-17T00:00:00Z') // Set to roughly now/tomorrow
            // If created before cutoff, they are a legacy user => Premium
            if (createdAt < cutoffDate) {
                initialPlan = 'invited'
                initialMaxDecks = 20
                initialMaxMatches = 500
            }
        }

        const newProfile = {
            user_id: userId,
            max_decks: initialMaxDecks,
            max_matches: initialMaxMatches,
            plan_type: initialPlan
        }

        const { data: created, error: createError } = await supabaseAdmin
            .from('user_profiles')
            .insert([newProfile])
            .select()
            .single()

        if (createError) throw createError
        return { success: true, profile: created }

    } catch (error) {
        console.error('Profile Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function redeemInviteCodeAction(userId: string, code: string) {
    try {
        // 1. Check code validity
        const { data: invite, error: inviteError } = await supabaseAdmin
            .from('invitation_codes')
            .select('*')
            .eq('code', code)
            .single()

        if (inviteError || !invite) {
            return { success: false, error: '無効な招待コードです' }
        }

        if (invite.is_used) {
            return { success: false, error: 'この招待コードは既に使用されています' }
        }

        // 2. Update Profile to Invited (Premium)
        const { error: updateProfileError } = await supabaseAdmin
            .from('user_profiles')
            .update({
                plan_type: 'invited',
                max_decks: 20,
                max_matches: 500
            })
            .eq('user_id', userId)

        if (updateProfileError) throw updateProfileError

        // 3. Mark Code as Used
        const { error: updateCodeError } = await supabaseAdmin
            .from('invitation_codes')
            .update({
                is_used: true,
                used_by_user_id: userId,
                used_at: new Date().toISOString()
            })
            .eq('code', code)

        if (updateCodeError) throw updateCodeError

        return { success: true }

    } catch (error) {
        console.error('Redeem Error:', error)
        return { success: false, error: '処理中にエラーが発生しました' }
    }
}
