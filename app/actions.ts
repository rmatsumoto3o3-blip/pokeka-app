'use server'

import { fetchDeckData, parsePTCGLFormat, type CardData } from '@/lib/deckParser'

export async function getDeckDataAction(deckCode: string): Promise<{ success: boolean, data?: CardData[], error?: string }> {
    try {
        const data = await fetchDeckData(deckCode)
        return { success: true, data }
    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function getPTCGLDeckDataAction(text: string): Promise<{ success: boolean, data?: CardData[], error?: string }> {
    try {
        const data = parsePTCGLFormat(text)
        if (data.length === 0) {
            throw new Error('Could not parse any cards from the provided text. Please check the format.')
        }
        return { success: true, data }
    } catch (error) {
        console.error('PTCGL Parse Action Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

// --- Phase 26: Freemium Actions ---

import { createClient } from '@supabase/supabase-js'

// Service Role Client for Admin Operations (Bypass RLS)
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    let key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to ANON key. Private writes will fail.')
        key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
    if (!url || !key) {
        throw new Error('Supabase URL or Key is missing. Please check your environment variables.')
    }
    return createClient(url, key)
}

// Public Client for Read Operations (Standard RLS)
function getSupabasePublic() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
        throw new Error('Supabase URL or Anon Key is missing. Please check your environment variables.')
    }
    return createClient(url, key)
}

// --- Constants ---
const ADMIN_EMAILS = ['r.matsumoto.3o3@gmail.com', 'nexpure.event@gmail.com', 'admin@pokeka.local', 'player1@pokeka.local']

// Filter for aggregate analysis (Phase 48 Request) - Adjusted to include older data
const ANALYTICS_START_DATE = '2024-01-01T00:00:00Z'

export async function getOrCreateProfileAction(userId: string) {
    try {
        // 1. Try to fetch existing profile (using admin to be safe, though public read is allowed for self)
        const { data: profile, error } = await getSupabaseAdmin()
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        // Admin Check & Legacy User Check for existing profile (Auto-Upgrade if needed)
        const { data: userAuth } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        const email = userAuth?.user?.email
        const isAdmin = email && ADMIN_EMAILS.includes(email)

        let isLegacy = false
        if (userAuth?.user?.created_at) {
            const createdAt = new Date(userAuth.user.created_at)
            const cutoffDate = new Date('2025-01-17T00:00:00Z')
            if (createdAt < cutoffDate) {
                isLegacy = true
            }
        }

        if (profile) {
            // Fix: If admin is on 'free' plan, upgrade them silently
            if (isAdmin && profile.plan_type !== 'invited') {
                const { data: updated } = await getSupabaseAdmin()
                    .from('user_profiles')
                    .update({ plan_type: 'invited', max_decks: 999, max_matches: 9999 })
                    .eq('user_id', userId)
                    .select().single()
                return { success: true, profile: updated || profile }
            }

            // Fix: If LEGACY user is on 'free' plan, upgrade them silently (They assume they are premium)
            if (isLegacy && profile.plan_type !== 'invited') {
                const { data: updated } = await getSupabaseAdmin()
                    .from('user_profiles')
                    .update({ plan_type: 'invited', max_decks: 1000, max_matches: 500 })
                    .eq('user_id', userId)
                    .select().single()
                return { success: true, profile: updated || profile }
            }

            // GLOBAL UNLOCK: Upgrade everyone to 1000 decks if they have less
            if (profile.max_decks < 1000) {
                const { data: updated } = await getSupabaseAdmin()
                    .from('user_profiles')
                    .update({ max_decks: 1000 })
                    .eq('user_id', userId)
                    .select().single()
                return { success: true, profile: updated || profile }
            }

            return { success: true, profile }
        }

        // 2. If not found, create default profile
        // SMART CHECK: If user was created before today (Legacy User), give them Premium
        // const { data: userAuth, error: userError } = await getSupabaseAdmin().auth.admin.getUserById(userId) // Already fetched above

        // Default to 'free'
        let initialPlan: 'free' | 'invited' = 'free'
        let initialMaxDecks = 1000 // Default Unrestricted
        let initialMaxMatches = 100

        if (userAuth?.user?.created_at) {
            const createdAt = new Date(userAuth.user.created_at)
            const cutoffDate = new Date('2025-01-17T00:00:00Z') // Set to roughly now/tomorrow
            // If created before cutoff, they are a legacy user => Premium
            if (createdAt < cutoffDate) {
                initialPlan = 'invited'
                initialMaxDecks = 1000 // Global High Limit
                initialMaxMatches = 500
            }
        }

        // Override for Admin
        if (isAdmin) {
            initialPlan = 'invited'
            initialMaxDecks = 999
            initialMaxMatches = 9999
        }

        const newProfile = {
            user_id: userId,
            max_decks: initialMaxDecks,
            max_matches: initialMaxMatches,
            plan_type: initialPlan
        }

        const { data: created, error: createError } = await getSupabaseAdmin()
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
        const { data: invite, error: inviteError } = await getSupabaseAdmin()
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
        const { error: updateProfileError } = await getSupabaseAdmin()
            .from('user_profiles')
            .update({
                plan_type: 'invited',
                max_decks: 20,
                max_matches: 500
            })
            .eq('user_id', userId)

        if (updateProfileError) throw updateProfileError

        // 3. Mark Code as Used
        const { error: updateCodeError } = await getSupabaseAdmin()
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
        const { data: profile } = await getSupabaseAdmin()
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        // Check Admin Status directly
        const { data: userAuth } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        const isAdmin = userAuth?.user?.email && ADMIN_EMAILS.includes(userAuth.user.email)

        const isInvited = profile?.plan_type === 'invited'
        const MAX_PARENTS = isAdmin ? 9999 : 1000 // Global High Limit

        // 2. Count Parents
        const { count: folderCount, error: fErr } = await getSupabaseAdmin()
            .from('user_deck_archetypes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
        if (fErr) throw fErr

        const { count: looseCount, error: lErr } = await getSupabaseAdmin()
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
        const { data: folder, error } = await getSupabaseAdmin()
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
        const { data: profile } = await getSupabaseAdmin()
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        // Check Admin Status directly
        const { data: userAuth } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        const isAdmin = userAuth?.user?.email && ADMIN_EMAILS.includes(userAuth.user.email)

        const isInvited = profile?.plan_type === 'invited'
        const MAX_CHILDREN = isAdmin ? 9999 : (isInvited ? 20 : 5)

        // 2. Count Children in Folder
        const { count, error: cErr } = await getSupabaseAdmin()
            .from('decks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('archetype_id', archetypeId)

        if (cErr) throw cErr

        if ((count || 0) >= MAX_CHILDREN) {
            return { success: false, error: `このフォルダ内のデッキ上限(${MAX_CHILDREN}個)に達しています。` }
        }

        // 3. Create Deck
        const { data: deck, error } = await getSupabaseAdmin()
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
        const { data: profile } = await getSupabaseAdmin()
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        // Check Admin Status directly
        const { data: userAuth } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        const isAdmin = userAuth?.user?.email && ADMIN_EMAILS.includes(userAuth.user.email)

        const isInvited = profile?.plan_type === 'invited'
        // const isAdmin = false // Removed placeholder

        const MAX_PARENTS = isAdmin ? 9999 : (isInvited ? 5 : 3)
        const MAX_CHILDREN = isAdmin ? 9999 : (isInvited ? 20 : 5)

        // 2. Limit Check Logic

        // Case A: Creating/Saving a Variant into a Folder (Child)
        if (archetypeId) {
            // Count existing children in this folder
            const { count, error } = await getSupabaseAdmin()
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
            const { count: folderCount, error: fErr } = await getSupabaseAdmin()
                .from('user_deck_archetypes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
            if (fErr) throw fErr

            // Count Loose Decks
            const { count: looseCount, error: lErr } = await getSupabaseAdmin()
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
            const { data: original } = await getSupabaseAdmin().from('decks').select('*').eq('id', originalDeckId).single()
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
        const { data: newDeck, error: insertError } = await getSupabaseAdmin()
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
// --- Phase 36: Deck Analytics Automation ---

/**
 * Helper to detect event rank from deck name
 */
export async function detectRankFromName(name: string): Promise<'優勝' | '準優勝' | 'TOP4' | 'TOP8' | null> {
    if (!name) return null
    if (name.includes('準優勝')) return '準優勝' // Check 준優勝 (Runner-Up) first
    if (name.includes('優勝')) return '優勝'
    if (name.match(/ベスト4|TOP4|Top 4/i)) return 'TOP4'
    if (name.match(/ベスト8|TOP8|Top 8/i)) return 'TOP8'
    return null
}

export async function addDeckToAnalyticsAction(
    deckCode: string,
    archetypeId: string,
    userId: string,
    customDeckName?: string,
    customImageUrl?: string,
    syncReference: boolean = true,
    eventRank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8'
) {
    try {
        // 1. Check permissions (Admin only)

        const { data: user, error: userError } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        if (userError || !user.user || !user.user.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        // 2. Fetch Deck Data from Official Site
        // Reuse the existing fetchDeckData logic which parses the HTML
        let cards: CardData[] = []
        try {
            cards = await fetchDeckData(deckCode)
        } catch (e) {
            console.error("Fetch Error", e)
            return { success: false, error: 'デッキデータの取得に失敗しました。コードを確認してください。' }
        }

        if (cards.length === 0) {
            return { success: false, error: 'カード情報を取得できませんでした。' }
        }

        // 3. Save to DB
        // Check for duplicate deck_code in this archetype to prevent double counting? 
        // Or allow it? Let's check duplicate deck_code globally/per archetype.
        // Usually duplicate codes are bad for analytics.
        const { data: existing } = await getSupabaseAdmin()
            .from('analyzed_decks')
            .select('id')
            .eq('deck_code', deckCode)
            .eq('archetype_id', archetypeId)
            .single()

        if (existing) {
            return { success: false, error: 'このデッキコードは既にこのデッキタイプに登録されています。' }
        }

        // Auto-detect rank if not provided
        const rank = eventRank || (customDeckName ? await detectRankFromName(customDeckName) : null)

        const { error: insertError } = await getSupabaseAdmin()
            .from('analyzed_decks')
            .insert([{
                user_id: userId,
                deck_code: deckCode,
                archetype_id: archetypeId,
                cards_json: cards,
                event_rank: rank
            }])

        if (insertError) throw insertError

        // 4. [Sync] Add to reference_decks for Top Page Display (CONDITIONAL)
        if (syncReference) {
            // Fetch archetype name for deck_name
            const { data: archetypeData } = await getSupabaseAdmin()
                .from('deck_archetypes')
                .select('name')
                .eq('id', archetypeId)
                .single()

            const deckName = customDeckName || archetypeData?.name || 'New Deck'

            // Use custom image if provided, otherwise fallback to first card
            const imageUrl = customImageUrl || (cards.length > 0 ? cards[0].imageUrl : null)

            const { error: refError } = await getSupabaseAdmin()
                .from('reference_decks')
                .insert([{
                    deck_name: deckName,
                    deck_code: deckCode,
                    deck_url: `https://www.pokemon-card.com/deck/confirm.html/deckID/${deckCode}`,
                    image_url: imageUrl,
                    archetype_id: archetypeId,
                    event_rank: rank
                }])

            if (refError) {
                console.warn('Reference Deck Sync Failed:', refError)
                // Do not fail the whole action, just log it. The analytics part succeeded.
            }
        }

        return { success: true }

    } catch (error) {
        console.error('Add Analytics Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function removeDeckFromAnalyticsAction(id: string, userId: string) {
    try {
        // Admin permission check
        const { data: user } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        const { data: targetDeck } = await getSupabaseAdmin()
            .from('analyzed_decks')
            .select('deck_code, archetype_id')
            .eq('id', id)
            .single()

        if (targetDeck) {
            // Delete from Reference Decks first (or parallel)
            await getSupabaseAdmin()
                .from('reference_decks')
                .delete()
                .eq('deck_code', targetDeck.deck_code)
                .eq('archetype_id', targetDeck.archetype_id)
        }

        const { error } = await getSupabaseAdmin()
            .from('analyzed_decks')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { success: true }

    } catch (error) {
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteArchetypeAction(archetypeId: string, userId: string) {
    try {
        // Admin permission check
        const { data: user } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        const supabaseAdmin = getSupabaseAdmin()

        // 1. Delete from reference_decks (Top page)
        await supabaseAdmin
            .from('reference_decks')
            .delete()
            .eq('archetype_id', archetypeId)

        // 2. Delete from analyzed_decks (Analytics)
        await supabaseAdmin
            .from('analyzed_decks')
            .delete()
            .eq('archetype_id', archetypeId)

        // 3. Delete from deck_archetypes (The category itself)
        const { error } = await supabaseAdmin
            .from('deck_archetypes')
            .delete()
            .eq('id', archetypeId)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Delete Archetype Error:', error)
        return { success: false, error: (error as Error).message }
    }
}



export async function getAllReferenceDecksAction() {
    try {
        let allDecks: any[] = []
        let from = 0
        const step = 1000
        const supabasePublic = getSupabasePublic()

        while (true) {
            const { data, error } = await supabasePublic
                .from('reference_decks')
                .select('*')
                .range(from, from + step - 1)
                .order('created_at', { ascending: false })

            if (error) throw error
            if (!data || data.length === 0) break

            allDecks = allDecks.concat(data)
            if (data.length < step) break
            from += step
        }

        return { success: true, data: allDecks }
    } catch (error) {
        console.error('Fetch Reference Decks Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function getDeckAnalyticsAction(archetypeId: string, eventRank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8') {
    try {
        // 1. Fetch all decks for this archetype with pagination
        // 1. Fetch recent analyzed decks for UI list (NO cards_json!)
        let query = getSupabaseAdmin()
            .from('analyzed_decks')
            .select('id, deck_code, event_rank, archetype_id, created_at')
            .eq('archetype_id', archetypeId)
            .gte('created_at', ANALYTICS_START_DATE)
        
        if (eventRank) {
            query = query.eq('event_rank', eventRank)
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(1000)

        if (error) throw error
        const decks = data || []

        let totalDecks = decks.length

        // 1.5 Fetch Reference Metadata
        let enrichedDecks: any[] = []
        if (decks.length > 0) {
            const deckCodes = decks.map(d => d.deck_code)
            const { data: refDecks } = await getSupabaseAdmin()
                .from('reference_decks')
                .select('deck_code, deck_name, event_type, image_url, id')
                .in('deck_code', deckCodes)
                .eq('archetype_id', archetypeId)

            enrichedDecks = decks.map(deck => {
                const ref = refDecks?.find(r => r.deck_code === deck.deck_code)
                return {
                    ...deck,
                    deck_name: ref?.deck_name || '名称未設定',
                    event_type: ref?.event_type || 'Unknown',
                    image_url: ref?.image_url || null,
                    reference_id: ref?.id
                }
            })
        }

        // 2. Fetch Pre-Calculated Data
        let statsQuery = getSupabaseAdmin()
            .from('archetype_card_stats')
            .select('card_name, supertype, subtypes, image_url, adoption_count, total_qty, total_decks')
            .eq('archetype_id', archetypeId)
            
        if (eventRank) {
            statsQuery = statsQuery.eq('event_rank', eventRank)
        } else {
            statsQuery = statsQuery.eq('event_rank', 'ALL') // Match "ALL" ranks
        }

        const { data: statsData, error: statsError } = await statsQuery
        if (statsError) throw statsError

        if (statsData && statsData.length > 0) {
            // Use the aggregated denominator
            totalDecks = statsData[0].total_decks
        }

        // 3. Format Result
        const analytics = (statsData || []).map(stat => ({
            name: stat.card_name,
            imageUrl: stat.image_url,
            supertype: stat.supertype,
            subtypes: stat.subtypes,
            adoptionRate: stat.total_decks > 0 ? (stat.adoption_count / stat.total_decks) * 100 : 0,
            avgQuantity: stat.adoption_count > 0 ? (stat.total_qty / stat.adoption_count) : 0
        })).sort((a, b) => b.adoptionRate - a.adoptionRate)

        return { success: true, decks: enrichedDecks, analytics, totalDecks }

    } catch (error) {
        console.error('Get Analytics Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

// Simple server-side cache for archetype win stats (10 minutes)
let archetypeWinStatsCache: { data: any, timestamp: number } | null = null
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export async function getArchetypeWinStatsAction() {
    try {
        const now = Date.now()
        if (archetypeWinStatsCache && (now - archetypeWinStatsCache.timestamp < CACHE_DURATION)) {
            return { success: true, data: archetypeWinStatsCache.data }
        }

        const supabaseAdmin = getSupabaseAdmin()
        let allRawStats: { archetype_id: string, event_rank: string | null }[] = []
        let from = 0
        const step = 1000

        // 1. Fetch total counts and win counts per archetype with PAGINATION
        while (true) {
            const { data, error } = await supabaseAdmin
                .from('analyzed_decks')
                .select('archetype_id, event_rank')
                .gte('created_at', ANALYTICS_START_DATE)
                .range(from, from + step - 1)

            if (error) throw error
            if (!data || data.length === 0) break

            allRawStats = allRawStats.concat(data)
            if (data.length < step) break
            from += step
        }

        // 2. Aggregate counts in memory
        const counts: Record<string, { total: number, wins: number }> = {}
        allRawStats.forEach(deck => {
            const id = deck.archetype_id
            if (!id) return
            if (!counts[id]) counts[id] = { total: 0, wins: 0 }
            counts[id].total++
            if (deck.event_rank === '優勝') counts[id].wins++
        })

        // 3. Fetch Archetype names
        const { data: archetypes, error: archError } = await supabaseAdmin
            .from('deck_archetypes')
            .select('id, name')
            .order('display_order', { ascending: true })

        if (archError) throw archError

        // 4. Combine
        const result = archetypes.map(arch => ({
            id: arch.id,
            name: arch.name,
            total: counts[arch.id]?.total || 0,
            wins: counts[arch.id]?.wins || 0
        })).filter(item => item.total > 0) // Only show archetypes with at least 1 deck analyzed
        .sort((a, b) => b.wins - a.wins || b.total - a.total)

        // Store in cache
        archetypeWinStatsCache = { data: result, timestamp: Date.now() }

        return { success: true, data: result }

    } catch (error) {
        console.error('Get Archetype Win Stats Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function updateAnalyzedDeckAction(
    deckCode: string,
    archetypeId: string,
    userId: string,
    updates: { name: string, imageUrl?: string, eventRank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8' }
) {
    try {
        // Admin Check
        const { data: user } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        // 1. Update Reference Deck (Name, Rank, Image)
        const refUpdates: any = {
            deck_name: updates.name,
            image_url: updates.imageUrl,
            event_rank: updates.eventRank
        }
        
        const { error: refError } = await getSupabaseAdmin()
            .from('reference_decks')
            .update(refUpdates)
            .eq('deck_code', deckCode)
            .eq('archetype_id', archetypeId)

        if (refError) throw refError

        // 2. Update Analyzed Deck (Rank)
        if (updates.eventRank !== undefined) {
            const { error: anaError } = await getSupabaseAdmin()
                .from('analyzed_decks')
                .update({ event_rank: updates.eventRank })
                .eq('deck_code', deckCode)
                .eq('archetype_id', archetypeId)
            if (anaError) throw anaError
        }

        return { success: true }
    } catch (e) {
        return { success: false, error: (e as Error).message }
    }
}

export interface GlobalAnalyticsResult {
    success: boolean
    analyticsByArchetype?: Record<string, any[]>
    globalAnalytics?: any[]
    error?: string
}

export async function getGlobalDeckAnalyticsAction(
    startDateStr?: string, // format: "MM/DD"
    endDateStr?: string,   // format: "MM/DD"
    eventRank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8'
): Promise<GlobalAnalyticsResult> {
    try {
        // Parse dates into comparable numbers (e.g., "03/14" -> 314)
        let startNum: number | null = null
        let endNum: number | null = null
        if (startDateStr) {
            const [m, d] = startDateStr.split('/').map(Number)
            startNum = m * 100 + d
        }
        if (endDateStr) {
            const [m, d] = endDateStr.split('/').map(Number)
            endNum = m * 100 + d
        }

        // Fast Path: If no date filter, use pre-calculated stats to save Egress
        if (startNum === null && endNum === null) {
            let gQuery = getSupabaseAdmin().from('global_card_stats').select('*')
            if (eventRank) gQuery = gQuery.eq('event_rank', eventRank)
            else gQuery = gQuery.eq('event_rank', 'ALL')
            
            const { data: globalData } = await gQuery
            const totalDecksGlobal = globalData && globalData.length > 0 ? globalData[0].total_decks : 1
            
            const globalAnalytics = (globalData || []).map(stat => ({
                id: stat.card_name,
                card_name: stat.card_name,
                image_url: stat.image_url,
                category: mapSupertypeToCategory(stat.supertype, stat.subtypes),
                adoption_quantity: stat.adoption_count > 0 ? (stat.total_qty / stat.adoption_count).toFixed(1) : "0.0",
                adoption_rate: ((stat.adoption_count / totalDecksGlobal) * 100).toFixed(1)
            })).sort((a, b) => Number(b.adoption_rate) - Number(a.adoption_rate))

            let aQuery = getSupabaseAdmin().from('archetype_card_stats').select('*')
            if (eventRank) aQuery = aQuery.eq('event_rank', eventRank)
            else aQuery = aQuery.eq('event_rank', 'ALL')
            
            const { data: archData } = await aQuery
            const analyticsByArchetype: Record<string, any[]> = {}
            if (archData) {
                archData.forEach(stat => {
                    if (!analyticsByArchetype[stat.archetype_id]) analyticsByArchetype[stat.archetype_id] = []
                    analyticsByArchetype[stat.archetype_id].push({
                        id: stat.card_name,
                        card_name: stat.card_name,
                        image_url: stat.image_url,
                        category: mapSupertypeToCategory(stat.supertype, stat.subtypes),
                        adoption_quantity: stat.adoption_count > 0 ? (stat.total_qty / stat.adoption_count).toFixed(1) : "0.0",
                        adoption_rate: stat.total_decks > 0 ? ((stat.adoption_count / stat.total_decks) * 100).toFixed(1) : "0.0"
                    })
                })
                // Sort each archetype's cards by adoption rate
                Object.keys(analyticsByArchetype).forEach(archId => {
                    analyticsByArchetype[archId].sort((a, b) => Number(b.adoption_rate) - Number(a.adoption_rate))
                })
            }

            return { success: true, analyticsByArchetype, globalAnalytics }
        }

        // 1. Fetch recent analyzed decks (limit to 500 to save bandwidth for custom date)
        const { data: decksData, error: dErr } = await getSupabaseAdmin()
            .from('analyzed_decks')
            .select('deck_code, cards_json, archetype_id, created_at')
            .order('created_at', { ascending: false })
            .limit(500)

        if (dErr) throw dErr
        let decks = decksData || []

        if (decks.length === 0) return { success: true, analyticsByArchetype: {} }

        // 1.5 Fetch Reference Decks to get deck names (for date extraction)
        const deckCodes = [...new Set(decks.map(d => d.deck_code))]
        let refDecks: any[] = []
        // Fetch reference decks in chunks to avoid URL size limits if too many
        for (let i = 0; i < deckCodes.length; i += 500) {
            const chunk = deckCodes.slice(i, i + 500)
            const { data: refData } = await getSupabaseAdmin()
                .from('reference_decks')
                .select('deck_code, deck_name')
                .in('deck_code', chunk)
            if (refData) refDecks = refDecks.concat(refData)
        }

        // Map deck_code to deck_name
        const deckNameMap = new Map<string, string>()
        refDecks.forEach(ref => deckNameMap.set(ref.deck_code, ref.deck_name))

        // 1.6 Filter decks based on extracted date
        const isFiltering = startNum !== null && endNum !== null
        let filteredDecks = decks

        if (isFiltering) {
            filteredDecks = decks.filter(deck => {
                const deckName = deckNameMap.get(deck.deck_code)
                if (!deckName) return false // No name, ignore when filtering

                // Regex to match "M/D" or "MM/DD" at the beginning of the string
                const match = deckName.match(/^(\d{1,2})\/(\d{1,2})/)
                if (!match) return false // No date found

                const m = parseInt(match[1], 10)
                const d = parseInt(match[2], 10)
                const deckDateNum = m * 100 + d

                // Handle year wrap-around logic (e.g., standard comparison within same year assumption)
                // If startNum > endNum (e.g., 12/01 to 01/15), handle it as OR condition
                if (startNum! > endNum!) {
                    return deckDateNum >= startNum! || deckDateNum <= endNum!
                } else {
                    return deckDateNum >= startNum! && deckDateNum <= endNum!
                }
            })
        }

        if (filteredDecks.length === 0) return { success: true, analyticsByArchetype: {} }

        // 2. Aggregate per Archetype
        const analyticsByArchetype: Record<string, any[]> = {}
        const deckCountsByArchetype: Record<string, number> = {}

        // Group decks by archetype
        filteredDecks.forEach(deck => {
            if (!deckCountsByArchetype[deck.archetype_id]) deckCountsByArchetype[deck.archetype_id] = 0
            deckCountsByArchetype[deck.archetype_id]++
        })

        // Temporary storage for stats per archetype
        const statsByArchetype: Record<string, Record<string, any>> = {}

        filteredDecks.forEach(deck => {
            const archId = deck.archetype_id
            if (!statsByArchetype[archId]) statsByArchetype[archId] = {}

            const cards = deck.cards_json as CardData[]
            const seenInThisDeck = new Set<string>()

            cards.forEach(card => {
                const key = card.name
                if (!statsByArchetype[archId][key]) {
                    statsByArchetype[archId][key] = {
                        name: card.name,
                        imageUrl: card.imageUrl,
                        supertype: card.supertype,
                        subtypes: card.subtypes,
                        totalQty: 0,
                        adoptionCount: 0
                    }
                }
                statsByArchetype[archId][key].totalQty += card.quantity
                if (!seenInThisDeck.has(key)) {
                    statsByArchetype[archId][key].adoptionCount += 1
                    seenInThisDeck.add(key)
                }
            })
        })

        // 3. Aggregate Global Stats
        const globalStats: Record<string, any> = {}
        const totalDecksGlobal = filteredDecks.length

        filteredDecks.forEach(deck => {
            const cards = deck.cards_json as CardData[]
            const seenInThisDeckGlobal = new Set<string>()

            cards.forEach(card => {
                const name = card.name
                if (!globalStats[name]) {
                    globalStats[name] = {
                        name: card.name,
                        imageUrl: card.imageUrl,
                        supertype: card.supertype,
                        subtypes: card.subtypes,
                        totalQty: 0,
                        adoptionCount: 0
                    }
                }
                globalStats[name].totalQty += card.quantity
                if (!seenInThisDeckGlobal.has(name)) {
                    globalStats[name].adoptionCount += 1
                    seenInThisDeckGlobal.add(name)
                }
            })
        })

        const globalAnalytics = Object.values(globalStats).map(stat => ({
            id: stat.name,
            card_name: stat.name,
            image_url: stat.imageUrl,
            category: mapSupertypeToCategory(stat.supertype, stat.subtypes),
            adoption_quantity: (stat.totalQty / stat.adoptionCount).toFixed(1),
            adoption_rate: ((stat.adoptionCount / totalDecksGlobal) * 100).toFixed(1)
        })).sort((a, b) => Number(b.adoption_rate) - Number(a.adoption_rate))

        // 4. Format Archetype Stats
        Object.keys(statsByArchetype).forEach(archId => {
            const totalDecks = deckCountsByArchetype[archId]
            if (!totalDecks) return

            analyticsByArchetype[archId] = Object.values(statsByArchetype[archId]).map(stat => ({
                id: stat.name,
                card_name: stat.name,
                image_url: stat.imageUrl,
                category: mapSupertypeToCategory(stat.supertype, stat.subtypes),
                adoption_quantity: (stat.totalQty / stat.adoptionCount).toFixed(1),
                adoption_rate: ((stat.adoptionCount / totalDecks) * 100).toFixed(0)
            })).sort((a, b) => Number(b.adoption_rate) - Number(a.adoption_rate))
        })

        return { success: true, analyticsByArchetype, globalAnalytics }

    } catch (error) {
        console.error('Global Analytics Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

function mapSupertypeToCategory(supertype: string, subtypes?: string[]): string {
    if (supertype === 'Pokémon') return 'Pokemon'
    if (supertype === 'Energy') return 'Energy'
    if (supertype === 'Trainer') {
        if (subtypes?.includes('Item')) return 'Goods'
        if (subtypes?.includes('Pokémon Tool')) return 'Tool'
        if (subtypes?.includes('Supporter')) return 'Supporter'
        if (subtypes?.includes('Stadium')) return 'Stadium'
        return 'Goods' // Fallback
    }
    return 'Goods'
}

export async function syncAnalyzedDecksToReferencesAction(userId: string) {
    try {
        // 1. Admin Check
        const { data: user } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        // 2. Fetch all analyzed decks
        const { data: analyzedDecks, error: fetchError } = await getSupabaseAdmin()
            .from('analyzed_decks')
            .select('*')

        if (fetchError) throw fetchError
        if (!analyzedDecks) return { success: true, count: 0 }

        // 3. Sync Loop
        let addedCount = 0
        for (const deck of analyzedDecks) {
            // Check existence
            const { data: existing } = await getSupabaseAdmin()
                .from('reference_decks')
                .select('id')
                .eq('deck_code', deck.deck_code)
                .single()

            if (!existing) {
                // Fetch archetype name
                const { data: arch } = await getSupabaseAdmin()
                    .from('deck_archetypes')
                    .select('name')
                    .eq('id', deck.archetype_id)
                    .single()

                const deckName = arch?.name || 'Analyzed Deck'

                // Parse cards to get image
                const cards = deck.cards_json as CardData[] // Cast safely
                const imageUrl = (cards && cards.length > 0) ? cards[0].imageUrl : null

                // Insert
                await getSupabaseAdmin()
                    .from('reference_decks')
                    .insert([{
                        deck_name: deckName,
                        deck_code: deck.deck_code,
                        deck_url: `https://www.pokemon-card.com/deck/confirm.html/deckID/${deck.deck_code}`,
                        image_url: imageUrl,
                        event_type: 'Gym Battle',
                        archetype_id: deck.archetype_id
                    }])
                addedCount++
            }
        }

        return { success: true, count: addedCount }

    } catch (error) {
        console.error('Sync Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

/**
 * Backfill event_rank for all existing decks based on their names
 */
export async function backfillEventRanksAction(userId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin()
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        let updatedCount = 0

        // 1. Update reference_decks
        let refFrom = 0
        const step = 200
        while (true) {
            const { data: refDecks, error: fetchError } = await supabaseAdmin
                .from('reference_decks')
                .select('id, deck_name, event_rank')
                .range(refFrom, refFrom + step - 1)

            if (fetchError) throw fetchError
            if (!refDecks || refDecks.length === 0) break

            for (const deck of refDecks) {
                const detected = await detectRankFromName(deck.deck_name)
                // Update if: 1. No rank yet, OR 2. Detected rank is different from current rank
                if (detected && detected !== deck.event_rank) {
                    await supabaseAdmin
                        .from('reference_decks')
                        .update({ event_rank: detected })
                        .eq('id', deck.id)
                    updatedCount++
                }
            }

            if (refDecks.length < step) break
            refFrom += step
        }

        // 2. Update analyzed_decks directly (sync from reference_decks)
        let anaFrom = 0
        while (true) {
            const { data: analyzedDecks, error: analyzedError } = await supabaseAdmin
                .from('analyzed_decks')
                .select('id, deck_code, event_rank')
                .range(anaFrom, anaFrom + step - 1)

            if (analyzedError) throw analyzedError
            if (!analyzedDecks || analyzedDecks.length === 0) break

            const deckCodes = [...new Set(analyzedDecks.map((d: any) => d.deck_code))]
            const { data: refs } = await supabaseAdmin
                .from('reference_decks')
                .select('deck_code, event_rank')
                .in('deck_code', deckCodes)

            const rankMap = new Map()
            refs?.forEach(r => rankMap.set(r.deck_code, r.event_rank))

            for (const deck of analyzedDecks) {
                const detected = rankMap.get(deck.deck_code)
                if (detected && detected !== deck.event_rank) {
                    await supabaseAdmin
                        .from('analyzed_decks')
                        .update({ event_rank: detected })
                        .eq('id', deck.id)
                    updatedCount++
                }
            }
            if (analyzedDecks.length < step) break
            anaFrom += step
        }

        return { success: true, count: updatedCount }
    } catch (error) {
        console.error('Backfill Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

// --- Phase 44: Deck Scraper Automation ---

export async function scrapePokecabookAction(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })
        if (!response.ok) {
            return { success: false, error: 'ページの取得に失敗しました' }
        }
        const html = await response.text()

        // Regex to extract figcaption content and deck link
        // Pattern logic:
        // 1. Find <figcaption ...> ... </figcaption>
        // 2. Extract text (Deck Name)
        // 3. Extract href with deckID (Deck Code)

        const deckList: { name: string, code: string }[] = []

        // Simple regex to find blocks. Note: HTML parsing with Regex is fragile but efficient for specific structures.
        // We look for the distinct structure provided by the user:
        // <figcaption class="wp-element-caption">NAME <a ... href=".../deckID/CODE">...</a></figcaption>

        // Split by figcaption to make it easier
        const parts = html.split('<figcaption class="wp-element-caption">')

        for (let i = 1; i < parts.length; i++) {
            const part = parts[i]
            const endIdx = part.indexOf('</figcaption>')
            if (endIdx === -1) continue

            const captionContent = part.substring(0, endIdx)

            // Extract Code
            const codeMatch = captionContent.match(/deckID\/([a-zA-Z0-9-]+)/)
            if (!codeMatch) continue
            const code = codeMatch[1]

            // Extract Name (Remove tags)
            // Remove <a> tags to get pure text. 
            // The structure is usually "Text <a...>Link</a>"
            // We want "Text" + "Link Text" or just the raw text content.
            // Let's strip all headers/tags.
            let name = captionContent.replace(/<[^>]+>/g, '').replace(/【[月火水木金土日]】/g, '').trim()

            // Filter out "Averaged" decks (Noise)
            if (name.includes('平均化') || name.includes('平均レシピ') || name.includes('平均')) {
                continue
            }

            // Allow duplicates within the page? Yes, let user decide.
            deckList.push({ name, code })
        }

        return { success: true, decks: deckList }

    } catch (e) {
        console.error('Scrape Error:', e)
        return { success: false, error: 'スクレイピング中にエラーが発生しました' }
    }
}

// --- Phase 47: Featured Card Trends ---

interface FeaturedCardStat {
    id: string
    card_name: string
    current_adoption_rate: number
    trend_history: { date: string, dateLabel: string, rate: number }[]
    image_url: string | null
    top_archetype?: { name: string, rate: number }
    archetype_stats?: { name: string, rate: number }[]
}

export async function getFeaturedCardsWithStatsAction(
    startDateStr?: string, // format: "MM/DD"
    endDateStr?: string,   // format: "MM/DD"
    eventRank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8'
): Promise<{ success: boolean, data?: FeaturedCardStat[], error?: string }> {
    try {
        // Parse dates into comparable numbers (e.g., "03/14" -> 314)
        let startNum: number | null = null
        let endNum: number | null = null
        if (startDateStr) {
            const [m, d] = startDateStr.split('/').map(Number)
            startNum = m * 100 + d
        }
        if (endDateStr) {
            const [m, d] = endDateStr.split('/').map(Number)
            endNum = m * 100 + d
        }

        // 1. Get Featured Cards
        const { data: featured, error: fErr } = await getSupabaseAdmin()
            .from('featured_cards')
            .select('*')
            .order('display_order', { ascending: true })

        if (fErr) throw fErr
        if (!featured || featured.length === 0) return { success: true, data: [] }

        // 2. Get Snapshots for these cards (Last 90 days?)
        const names = featured.map(f => f.card_name)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const { data: history, error: hErr } = await getSupabaseAdmin()
            .from('card_trend_snapshots')
            .select('*')
            .in('card_name', names)
            .gte('recorded_at', ninetyDaysAgo.toISOString())
            .order('recorded_at', { ascending: true })

        if (hErr) throw hErr

        // 3. Fast Path: Use Pre-calculated stats if no custom date filter
        const isFiltering = startNum !== null && endNum !== null

        if (!isFiltering) {
            let gQuery = getSupabaseAdmin()
                .from('global_card_stats')
                .select('card_name, adoption_count, total_decks, image_url')
                .in('card_name', names)
            
            if (eventRank) gQuery = gQuery.eq('event_rank', eventRank)
            else gQuery = gQuery.eq('event_rank', 'ALL')
            
            const { data: gData } = await gQuery

            let aQuery = getSupabaseAdmin()
                .from('archetype_card_stats')
                .select('card_name, archetype_id, adoption_count, total_decks')
                .in('card_name', names)
            
            if (eventRank) aQuery = aQuery.eq('event_rank', eventRank)
            else aQuery = aQuery.eq('event_rank', 'ALL')

            const { data: aData } = await aQuery

            // Fetch Archetype Names
            const { data: archetypeNames } = await getSupabaseAdmin()
                .from('deck_archetypes')
                .select('id, name')
            const archNameMap = new Map(archetypeNames?.map(a => [a.id, a.name]) || [])

            const results: FeaturedCardStat[] = []
            for (const card of featured) {
                const cardHistory = history?.filter(h => h.card_name === card.card_name) || []
                const gStat = gData?.find(g => g.card_name === card.card_name)
                const current = gStat && gStat.total_decks > 0 ? (gStat.adoption_count / gStat.total_decks) * 100 : 0
                const imgUrl = gStat?.image_url || null

                const archStats: { name: string, rate: number }[] = []
                const aStatsForCard = aData?.filter(a => a.card_name === card.card_name) || []
                aStatsForCard.forEach(a => {
                    if (a.total_decks > 0 && a.adoption_count > 0) {
                        archStats.push({
                            name: archNameMap.get(a.archetype_id) || "Unknown",
                            rate: parseFloat(((a.adoption_count / a.total_decks) * 100).toFixed(1))
                        })
                    }
                })
                archStats.sort((a, b) => b.rate - a.rate)
                const topArch = archStats.length > 0 ? archStats[0] : undefined

                results.push({
                    id: card.id,
                    card_name: card.card_name,
                    current_adoption_rate: parseFloat(current.toFixed(1)),
                    trend_history: cardHistory.map(h => ({
                        date: h.recorded_at,
                        dateLabel: new Date(h.recorded_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
                        rate: h.adoption_rate
                    })),
                    image_url: imgUrl,
                    top_archetype: topArch,
                    archetype_stats: archStats
                })
            }
            return { success: true, data: results }
        }

        // --- Slow path for custom date filter ---
        let query = getSupabaseAdmin()
            .from('analyzed_decks')
            .select('deck_code, cards_json, archetype_id')
            .order('created_at', { ascending: false })
            .limit(500)
        
        if (eventRank) {
            query = query.eq('event_rank', eventRank)
        }

        const { data: recentDecksData } = await query

        let recentDecks = recentDecksData || []

        if (isFiltering && recentDecks.length > 0) {
            const deckCodes = [...new Set(recentDecks.map(d => d.deck_code))]
            let refDecks: any[] = []
            // Fetch reference decks in chunks
            for (let i = 0; i < deckCodes.length; i += 500) {
                const chunk = deckCodes.slice(i, i + 500)
                const { data: refData } = await getSupabaseAdmin()
                    .from('reference_decks')
                    .select('deck_code, deck_name')
                    .in('deck_code', chunk)
                if (refData) refDecks = refDecks.concat(refData)
            }

            const deckNameMap = new Map<string, string>()
            refDecks.forEach(ref => deckNameMap.set(ref.deck_code, ref.deck_name))

            recentDecks = recentDecks.filter(deck => {
                const deckName = deckNameMap.get(deck.deck_code)
                if (!deckName) return false

                const match = deckName.match(/^(\d{1,2})\/(\d{1,2})/)
                if (!match) return false

                const m = parseInt(match[1], 10)
                const d = parseInt(match[2], 10)
                const deckDateNum = m * 100 + d

                if (startNum! > endNum!) {
                    return deckDateNum >= startNum! || deckDateNum <= endNum!
                } else {
                    return deckDateNum >= startNum! && deckDateNum <= endNum!
                }
            })
        }

        const imageMap = new Map<string, string>()
        const archetypeAdoptionMap = new Map<string, Map<string, number>>() // CardName -> Map<ArchetypeId, Count>
        const archetypeTotalMap = new Map<string, number>() // ArchetypeId -> Count
        const overallAdoptionCount = new Map<string, number>() // CardName -> Count

        if (recentDecks) {
            for (const deck of recentDecks) {
                const archId = deck.archetype_id
                archetypeTotalMap.set(archId, (archetypeTotalMap.get(archId) || 0) + 1)

                const cards = deck.cards_json as CardData[]
                if (Array.isArray(cards)) {
                    const uniqueNamesInDeck = new Set<string>()
                    for (const c of cards) {
                        if (c.imageUrl && !imageMap.has(c.name)) {
                            imageMap.set(c.name, c.imageUrl)
                        }
                        uniqueNamesInDeck.add(c.name)
                    }

                    for (const name of uniqueNamesInDeck) {
                        // Global adoption per card in filtered set
                        overallAdoptionCount.set(name, (overallAdoptionCount.get(name) || 0) + 1)

                        if (!archetypeAdoptionMap.has(name)) {
                            archetypeAdoptionMap.set(name, new Map())
                        }
                        const archMap = archetypeAdoptionMap.get(name)!
                        archMap.set(archId, (archMap.get(archId) || 0) + 1)
                    }
                }
            }
        }

        // Fetch Archetype Names
        const { data: archetypeNames } = await getSupabaseAdmin()
            .from('deck_archetypes')
            .select('id, name')
        const archNameMap = new Map(archetypeNames?.map(a => [a.id, a.name]) || [])

        const results: FeaturedCardStat[] = []
        const totalDecksCount = recentDecks.length || 1 // Prevent division by zero

        for (const card of featured) {
            const cardHistory = history?.filter(h => h.card_name === card.card_name) || []

            // Calculate current adoption rate based on filtered decks if querying by date
            let current = 0
            if (isFiltering) {
                const count = overallAdoptionCount.get(card.card_name) || 0
                current = (count / totalDecksCount) * 100
            } else {
                current = cardHistory.length > 0 ? cardHistory[cardHistory.length - 1].adoption_rate : 0
            }

            // Get from map
            const img = imageMap.get(card.card_name) || null

            // Calculate Archetype Stats
            const archStats: { name: string, rate: number }[] = []
            const adoptionRates = archetypeAdoptionMap.get(card.card_name)
            if (adoptionRates) {
                adoptionRates.forEach((count, archId) => {
                    const totalForArch = archetypeTotalMap.get(archId) || 1
                    const rate = (count / totalForArch) * 100
                    if (rate > 0) {
                        archStats.push({
                            name: archNameMap.get(archId) || "Unknown",
                            rate: parseFloat(rate.toFixed(1))
                        })
                    }
                })
                archStats.sort((a, b) => b.rate - a.rate)
            }

            const topArch = archStats.length > 0 ? archStats[0] : undefined

            results.push({
                id: card.id,
                card_name: card.card_name,
                current_adoption_rate: current,
                trend_history: cardHistory.map(h => ({
                    date: h.recorded_at,
                    dateLabel: new Date(h.recorded_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
                    rate: h.adoption_rate
                })),
                image_url: img,
                top_archetype: topArch,
                archetype_stats: archStats
            })
        }

        return { success: true, data: results }

    } catch (error) {
        console.error('Featured Stats Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function manageFeaturedCardsAction(action: 'add' | 'remove', cardName?: string, id?: string) {
    try {
        if (action === 'add' && cardName) {
            const { error } = await getSupabaseAdmin()
                .from('featured_cards')
                .insert([{ card_name: cardName }])
            if (error) throw error
        } else if (action === 'remove' && id) {
            const { error } = await getSupabaseAdmin()
                .from('featured_cards')
                .delete()
                .eq('id', id)
            if (error) throw error
        }
        return { success: true }
    } catch (error) {
        return { success: false, error: (error as Error).message }
    }
}

export async function updateDailySnapshotsAction(userId: string) {
    try {
        // Admin Check
        const { data: user } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            // For testing, let's allow if userId matches known IDs? 
            // Or just proceed if called from Admin Panel.
            // Sticking to email check for safety.
        }

        // 1. Get Featured Cards
        const { data: featured } = await getSupabaseAdmin().from('featured_cards').select('card_name')
        if (!featured || featured.length === 0) return { success: false, error: '注目カードが設定されていません' }

        const targetNames = new Set(featured.map(f => f.card_name))

        // 2. Fetch All Decks with pagination
        let decks: any[] = []
        let from = 0
        const step = 1000
        const supabaseAdmin = getSupabaseAdmin()

        while (true) {
            const { data, error } = await supabaseAdmin
                .from('analyzed_decks')
                .select('cards_json')
                .gte('created_at', ANALYTICS_START_DATE)
                .range(from, from + step - 1)

            if (error) throw error
            if (!data || data.length === 0) break

            decks = decks.concat(data)
            if (data.length < step) break
            from += step
        }
        if (!decks || decks.length === 0) return { success: false, error: '集計対象のデッキがありません' }

        const totalDecks = decks.length

        // 3. Aggregate
        const adoptionCounts: Record<string, number> = {} // name -> count
        const avgQuantities: Record<string, number> = {} // name -> totalQty
        const coverImages: Record<string, string> = {} // name -> url

        // Initialize
        targetNames.forEach(name => {
            adoptionCounts[name] = 0
            avgQuantities[name] = 0
        })

        decks.forEach(deck => {
            const cards = deck.cards_json as CardData[]
            const seenInThisDeck = new Set<string>()

            cards.forEach(card => {
                if (targetNames.has(card.name)) {
                    if (!seenInThisDeck.has(card.name)) {
                        adoptionCounts[card.name]++
                        seenInThisDeck.add(card.name)
                        // Capture image if not set
                        if (!coverImages[card.name]) coverImages[card.name] = card.imageUrl
                    }
                    avgQuantities[card.name] += card.quantity
                }
            })
        })

        // 4. Upsert Snapshots
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        const snapshots = []

        for (const name of Array.from(targetNames)) {
            const count = adoptionCounts[name] || 0
            const totalQty = avgQuantities[name] || 0
            const rate = (count / totalDecks) * 100
            const avg = count > 0 ? (totalQty / count) : 0

            snapshots.push({
                recorded_at: today,
                card_name: name,
                adoption_rate: parseFloat(rate.toFixed(2)),
                avg_quantity: avg,
                total_decks_analyzed: totalDecks
            })
        }

        const { error: upsertError } = await getSupabaseAdmin()
            .from('card_trend_snapshots')
            .upsert(snapshots, { onConflict: 'recorded_at, card_name' })

        if (upsertError) throw upsertError

        // Optional: Update image URL in featured_cards? 
        // Not adding column now, but good to know we have it in `coverImages`.

        return { success: true, count: snapshots.length }

    } catch (e) {
        console.error('Snapshot Update Error:', e)
        return { success: false, error: (e as Error).message }
    }
}

export async function getTopAdoptedCardsAction(eventRank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8'): Promise<{ success: boolean, data?: { name: string, count: number, rate: number, imageUrl: string | null }[], error?: string }> {
    try {
        // 1. Fetch All Decks with pagination
        let decks: any[] = []
        let from = 0
        const step = 1000
        const supabaseAdmin = getSupabaseAdmin()

        while (true) {
            let query = supabaseAdmin
                .from('analyzed_decks')
                .select('cards_json')
                .gte('created_at', ANALYTICS_START_DATE)
            
            if (eventRank) {
                query = query.eq('event_rank', eventRank)
            }

            const { data, error } = await query
                .range(from, from + step - 1)

            if (error) throw error
            if (!data || data.length === 0) break

            decks = decks.concat(data)
            if (data.length < step) break
            from += step
        }
        if (!decks || decks.length === 0) return { success: true, data: [] }

        const totalDecks = decks.length
        const adoptionCounts: Record<string, number> = {}
        const cardImages: Record<string, string> = {}

        // 2. Aggregate
        decks.forEach(deck => {
            const cards = deck.cards_json as CardData[]
            const seenInThisDeck = new Set<string>()

            cards.forEach(card => {
                // Exclude Basic Energy to keep suggestions relevant
                if (card.supertype === '能量' || (card.name.includes('基本') && card.name.includes('エネルギー'))) {
                    // Skip basic energy (rudimentary check)
                    return
                }

                if (!seenInThisDeck.has(card.name)) {
                    adoptionCounts[card.name] = (adoptionCounts[card.name] || 0) + 1
                    seenInThisDeck.add(card.name)
                    // Capture image
                    if (!cardImages[card.name] && card.imageUrl) {
                        cardImages[card.name] = card.imageUrl
                    }
                }
            })
        })

        // 3. Sort & Format
        const sorted = Object.entries(adoptionCounts)
            .map(([name, count]) => ({
                name,
                count,
                rate: parseFloat(((count / totalDecks) * 100).toFixed(1)),
                imageUrl: cardImages[name] || null
            }))
            .sort((a, b) => b.count - a.count)
            .sort((a, b) => b.count - a.count)
            .slice(0, 300) // Top 300 (Increased from 50 to include more variety)

        return { success: true, data: sorted }

    } catch (error) {
        console.error('Get Top Cards Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function backfillTrendDataAction(userId: string) {
    try {
        // Admin Check (Simplified for tool usage)
        const { data: user } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        if (!user.user) return { success: false, error: 'Unauthorized' }

        // 1. Get Featured Cards
        const { data: featured } = await getSupabaseAdmin().from('featured_cards').select('card_name')
        if (!featured || featured.length === 0) return { success: false, error: '注目カードが設定されていません' }

        const targetNames = new Set(featured.map(f => f.card_name))

        // Backfill Range: 2026-01-23 to 2026-01-31
        const startDate = new Date('2026-01-23')
        const endDate = new Date('2026-01-31')

        let totalSnapshots = 0

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const snapshotDateStr = d.toISOString().split('T')[0]

            // 30 day window relative to this historical date
            const windowStart = new Date(d)
            windowStart.setDate(windowStart.getDate() - 30)

            // Look for decks created between windowStart and End of 'd'
            // To include the whole day 'd', we check < d + 1 day
            const nextDay = new Date(d)
            nextDay.setDate(nextDay.getDate() + 1)

            const { data: decks, error: dErr } = await getSupabaseAdmin()
                .from('analyzed_decks')
                .select('cards_json')
                .gte('created_at', windowStart.toISOString())
                .lt('created_at', nextDay.toISOString())

            if (dErr) {
                console.error(`Error fetching for ${snapshotDateStr}`, dErr)
                continue
            }

            if (!decks || decks.length === 0) continue

            const totalDecks = decks.length
            const adoptionCounts: Record<string, number> = {}
            const avgQuantities: Record<string, number> = {}

            // Initialize
            targetNames.forEach(name => {
                adoptionCounts[name] = 0
                avgQuantities[name] = 0
            })

            // Aggregate
            decks.forEach(deck => {
                const cards = deck.cards_json as CardData[]
                const seenInThisDeck = new Set<string>()

                cards.forEach(card => {
                    if (targetNames.has(card.name)) {
                        if (!seenInThisDeck.has(card.name)) {
                            adoptionCounts[card.name]++
                            seenInThisDeck.add(card.name)
                        }
                        avgQuantities[card.name] += card.quantity
                    }
                })
            })

            // Prepare entries
            const snapshots = []
            for (const name of Array.from(targetNames)) {
                const count = adoptionCounts[name] || 0
                const totalQty = avgQuantities[name] || 0
                const rate = (count / totalDecks) * 100
                const avg = count > 0 ? (totalQty / count) : 0

                snapshots.push({
                    recorded_at: snapshotDateStr,
                    card_name: name,
                    adoption_rate: parseFloat(rate.toFixed(2)),
                    avg_quantity: avg,
                    total_decks_analyzed: totalDecks
                })
            }

            if (snapshots.length > 0) {
                const { error: upsertError } = await getSupabaseAdmin()
                    .from('card_trend_snapshots')
                    .upsert(snapshots, { onConflict: 'recorded_at, card_name' })

                if (upsertError) console.error(`Upsert error for ${snapshotDateStr}`, upsertError)
                else totalSnapshots += snapshots.length
            }
        }

        return { success: true, count: totalSnapshots }

    } catch (error) {
        console.error('Backfill Error:', error)
        return { success: false, error: (error as Error).message }
    }
}
// --- Phase 49: Pre-calculated Statistics Aggregation (Egress Optimization) ---

export async function calculateDeckStatisticsAction(userId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin()
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        // Fetch all decks for aggregation (we can fetch all since this runs in the background/admin)
        // To prevent timeout, we should optimize memory
        let decksData: any[] = []
        let from = 0
        const step = 1000

        while (true) {
            const { data, error } = await supabaseAdmin
                .from('analyzed_decks')
                .select('deck_code, cards_json, archetype_id, event_rank, created_at')
                .gte('created_at', ANALYTICS_START_DATE)
                .range(from, from + step - 1)
            
            if (error) throw error
            if (!data || data.length === 0) break
            decksData = decksData.concat(data)
            if (data.length < step) break
            from += step
        }

        if (decksData.length === 0) return { success: true, message: 'No data to aggregate' }

        // Mappings for aggregation
        // key: archetypeId_eventRank_cardName -> stat object
        const archStatsMap = new Map<string, any>()
        // key: eventRank_cardName -> stat object
        const globalStatsMap = new Map<string, any>()
        // Track unique decks per archetype/rank for total_decks denominator
        const archDeckCount = new Map<string, Set<string>>() // archetypeId_eventRank -> Set<deck_code>
        const globalDeckCount = new Map<string, Set<string>>() // eventRank -> Set<deck_code>

        // Clear existing corrupted table data before recalculation
        await supabaseAdmin.from('archetype_card_stats').delete().neq('card_name', '')
        await supabaseAdmin.from('global_card_stats').delete().neq('card_name', '')

        // Initialize maps safely
        const getOrCreateStat = (map: Map<string, any>, key: string, name: string, supertype: string, subtypes: any, imageUrl: string, archId?: string, rank?: string) => {
            if (!map.has(key)) {
                map.set(key, {
                    archetype_id: archId,
                    event_rank: rank || 'ALL', // Use 'ALL' instead of null to fix Postgres UNIQUE NULL issue
                    card_name: name,
                    supertype: supertype,
                    subtypes: subtypes,
                    image_url: imageUrl,
                    total_qty: 0,
                    adoption_count: 0
                })
            }
            return map.get(key)
        }

        for (const deck of decksData) {
            const rank = deck.event_rank // Can be null
            const archId = deck.archetype_id
            const cards = deck.cards_json as CardData[]
            const dCode = deck.deck_code

            // Track denominators
            const archBaseKey = `${archId}_${rank || 'ALL'}`
            const archAllKey = `${archId}_ALL`
            const gBaseKey = `${rank || 'ALL'}`
            const gAllKey = `ALL`

            // Add deck_code to sets
            if (rank) {
                if (!archDeckCount.has(archBaseKey)) archDeckCount.set(archBaseKey, new Set())
                archDeckCount.get(archBaseKey)!.add(dCode)
                
                if (!globalDeckCount.has(gBaseKey)) globalDeckCount.set(gBaseKey, new Set())
                globalDeckCount.get(gBaseKey)!.add(dCode)
            }
            
            if (!archDeckCount.has(archAllKey)) archDeckCount.set(archAllKey, new Set())
            archDeckCount.get(archAllKey)!.add(dCode)
            
            if (!globalDeckCount.has(gAllKey)) globalDeckCount.set(gAllKey, new Set())
            globalDeckCount.get(gAllKey)!.add(dCode)

            // Track adoption per deck
            const seenInThisDeck = new Set<string>()

            if (!Array.isArray(cards)) continue;

            for (const c of cards) {
                // ALL buckets
                const aKeyAll = `${archId}_ALL_${c.name}`
                const gKeyAll = `GLOBAL_ALL_${c.name}`
                
                const statAAll = getOrCreateStat(archStatsMap, aKeyAll, c.name, c.supertype, c.subtypes, c.imageUrl || '', archId, 'ALL')
                const statGAll = getOrCreateStat(globalStatsMap, gKeyAll, c.name, c.supertype, c.subtypes, c.imageUrl || '', undefined, 'ALL')

                statAAll.total_qty += c.quantity
                statGAll.total_qty += c.quantity

                // Specific Rank buckets
                let statARank = null
                let statGRank = null
                
                if (rank) {
                    const aKeyRank = `${archId}_RANK_${rank}_${c.name}`
                    const gKeyRank = `GLOBAL_RANK_${rank}_${c.name}`
                    
                    statARank = getOrCreateStat(archStatsMap, aKeyRank, c.name, c.supertype, c.subtypes, c.imageUrl || '', archId, rank)
                    statGRank = getOrCreateStat(globalStatsMap, gKeyRank, c.name, c.supertype, c.subtypes, c.imageUrl || '', undefined, rank)
                    
                    statARank.total_qty += c.quantity
                    statGRank.total_qty += c.quantity
                }

                // Add Adoption
                if (!seenInThisDeck.has(c.name)) {
                    statAAll.adoption_count += 1
                    statGAll.adoption_count += 1
                    if (statARank) statARank.adoption_count += 1
                    if (statGRank) statGRank.adoption_count += 1
                    seenInThisDeck.add(c.name)
                }
            }
        }

        // Prepare inserts mapping total_decks correctly
        const archInserts = Array.from(archStatsMap.values()).map(stat => {
            const denomKey = `${stat.archetype_id}_${stat.event_rank}`
            stat.total_decks = archDeckCount.get(denomKey)?.size || 0
            if (stat.total_decks === 0) return null
            return stat
        }).filter(Boolean)

        const globalInserts = Array.from(globalStatsMap.values()).map(stat => {
            const denomKey = `${stat.event_rank}`
            stat.total_decks = globalDeckCount.get(denomKey)?.size || 0
            
            // Remove archetype_id from global stats to prevent schema cache errors
            const { archetype_id, ...rest } = stat
            
            if (rest.total_decks === 0) return null
            return rest
        }).filter(Boolean)

        // Upsert in batches of 1000
        const upsertBatches = async (table: string, dataArray: any[], uniqueCols: string) => {
            const chunkSize = 1000
            for (let i = 0; i < dataArray.length; i += chunkSize) {
                const chunk = dataArray.slice(i, i + chunkSize)
                const { error } = await supabaseAdmin
                    .from(table)
                    .upsert(chunk, { onConflict: uniqueCols })
                if (error) throw error
            }
        }

        await upsertBatches('archetype_card_stats', archInserts, 'archetype_id, event_rank, card_name')
        await upsertBatches('global_card_stats', globalInserts, 'event_rank, card_name')

        return { success: true, message: `Aggregated ${decksData.length} decks successfully.` }
    } catch (error) {
        console.error('Calculate Stats Error:', error)
        return { success: false, error: (error as Error).message }
    }
}
