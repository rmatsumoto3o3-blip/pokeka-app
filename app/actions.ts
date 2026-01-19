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

export async function createFolderAction(userId: string, folderName: string) {
    try {
        // 1. Get User Profile & Plan
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        const isInvited = profile?.plan_type === 'invited'
        const MAX_PARENTS = isInvited ? 5 : 3

        // 2. Count Parents
        const { count: folderCount, error: fErr } = await supabaseAdmin
            .from('user_deck_archetypes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
        if (fErr) throw fErr

        const { count: looseCount, error: lErr } = await supabaseAdmin
            .from('decks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .is('archetype_id', null)
        if (lErr) throw lErr

        const totalParents = (folderCount || 0) + (looseCount || 0)

        if (totalParents >= MAX_PARENTS) {
            return { success: false, error: `フォルダ/デッキの作成上限(${MAX_PARENTS}枠)に達しています。` }
        }

        // 3. Create Folder
        const { data: folder, error } = await supabaseAdmin
            .from('user_deck_archetypes')
            .insert([{ user_id: userId, name: folderName }])
            .select()
            .single()

        if (error) throw error
        return { success: true, data: folder }

    } catch (error) {
        console.error('Create Folder Error:', error)
        return { success: false, error: '作成に失敗しました' }
    }
}

export async function createDeckVariantAction(
    userId: string,
    archetypeId: string,
    deckCode: string,
    versionLabel: string,
    deckName: string
) {
    try {
        // 1. Get User Profile & Plan
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        const isInvited = profile?.plan_type === 'invited'
        const MAX_CHILDREN = isInvited ? 20 : 5

        // 2. Count Children in Folder
        const { count, error: cErr } = await supabaseAdmin
            .from('decks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('archetype_id', archetypeId)

        if (cErr) throw cErr

        if ((count || 0) >= MAX_CHILDREN) {
            return { success: false, error: `このフォルダ内のデッキ上限(${MAX_CHILDREN}個)に達しています。` }
        }

        // 3. Create Deck
        const { data: deck, error } = await supabaseAdmin
            .from('decks')
            .insert([{
                user_id: userId,
                archetype_id: archetypeId,
                deck_code: deckCode,
                version_label: versionLabel,
                deck_name: deckName,
                is_current: false
            }])
            .select()
            .single()

        if (error) throw error
        return { success: true, data: deck }

    } catch (error) {
        console.error('Create Deck Error:', error)
        return { success: false, error: '作成に失敗しました' }
    }
}

// --- Phase 34: Custom Deck Persistence & Limits ---

export async function saveDeckVersionAction(
    userId: string,
    archetypeId: string | null, // If null, it's a "Loose Deck" (Parent)
    cards: CardData[],
    versionLabel: string,
    memo: string,
    originalDeckId?: string // If cloning/versioning
) {
    try {
        // 1. Get User Profile & Plan Limits
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        const isInvited = profile?.plan_type === 'invited'
        const isAdmin = false // TODO: check admin logic if needed, but 'invited' is highest plan now

        const MAX_PARENTS = isInvited ? 5 : 3
        const MAX_CHILDREN = isInvited ? 20 : 5

        // 2. Limit Check Logic

        // Case A: Creating/Saving a Variant into a Folder (Child)
        if (archetypeId) {
            // Count existing children in this folder
            const { count, error } = await supabaseAdmin
                .from('decks')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('archetype_id', archetypeId)

            if (error) throw error

            if ((count || 0) >= MAX_CHILDREN) {
                return { success: false, error: `このフォルダのデッキ数上限(${MAX_CHILDREN}個)に達しています。` }
            }
        }
        // Case B: Creating a Loose Deck (Parent)
        else {
            // Count existing Parents (Folders + Loose Decks)

            // Count Folders
            const { count: folderCount, error: fErr } = await supabaseAdmin
                .from('user_deck_archetypes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
            if (fErr) throw fErr

            // Count Loose Decks
            const { count: looseCount, error: lErr } = await supabaseAdmin
                .from('decks')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .is('archetype_id', null)
            if (lErr) throw lErr

            const totalParents = (folderCount || 0) + (looseCount || 0)

            if (totalParents >= MAX_PARENTS) {
                return { success: false, error: `デッキ/フォルダの作成上限(${MAX_PARENTS}個)に達しています。フォルダを作成して整理するか、不要なものを削除してください。` }
            }
        }

        // 3. Prepare Data
        // If we are cloning from an original deck, get its code/image as base
        let baseData: any = {}
        if (originalDeckId) {
            const { data: original } = await supabaseAdmin.from('decks').select('*').eq('id', originalDeckId).single()
            if (original) {
                baseData = {
                    deck_code: original.deck_code,
                    deck_name: original.deck_name,
                    image_url: original.image_url,
                    sideboard_cards: original.sideboard_cards
                }
            }
        }

        // 4. Insert New Deck
        const { data: newDeck, error: insertError } = await supabaseAdmin
            .from('decks')
            .insert([{
                user_id: userId,
                archetype_id: archetypeId,

                // Base data (fallback)
                deck_code: baseData.deck_code || null,
                deck_name: baseData.deck_name || '名称未設定デッキ',
                image_url: baseData.image_url || ((cards.length > 0) ? cards[0].imageUrl : null),
                sideboard_cards: baseData.sideboard_cards || [],

                // Custom Data
                custom_cards: cards, // SAVE JSON
                version_label: versionLabel,
                memo: memo || 'Custom Edit',

                is_current: true // Make this the active one?
            }])
            .select()
            .single()

        if (insertError) throw insertError

        return { success: true, deck: newDeck }

    } catch (error) {
        console.error('Save Custom Deck Error:', error)
        return { success: false, error: (error as Error).message || '保存に失敗しました' }
    }
}
