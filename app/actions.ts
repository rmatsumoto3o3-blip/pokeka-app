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
    return { success: false, error: 'この機能はGASスクレイパーに移行しました。' }
}

export async function removeDeckFromAnalyticsAction(id: string, userId: string) {
    return { success: false, error: 'この機能はGASスクレイパーに移行しました。' }
}

export async function deleteArchetypeAction(archetypeId: string, userId: string) {
    try {
        // Admin permission check
        const { data: user } = await getSupabaseAdmin().auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        const supabaseAdmin = getSupabaseAdmin()

        // 1. Delete from deck_records
        await supabaseAdmin.from('deck_records').delete().eq('archetype_id', archetypeId)

        // 2. Delete from deck_archetypes (The category itself)
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
    return { success: true, data: [] as any[] }
}

export async function getDeckAnalyticsAction(archetypeId: string, eventRank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8') {
    try {
        // 1. Fetch recent deck_records for UI list
        let query = getSupabaseAdmin()
            .from('deck_records')
            .select('id, deck_code, event_rank, archetype_id, event_date, event_location, created_at')
            .eq('archetype_id', archetypeId)

        if (eventRank) query = query.eq('event_rank', eventRank)

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error
        const decks = data || []
        let totalDecks = decks.length

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

        return { success: true, decks: decks, analytics, totalDecks }

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

        // 1. Fetch Global Total Count from pre-calculated stats (Zero Egress)
        // event_rank='ALL' で絞り込まないと不定の行が返る
        const { data: globalStats } = await supabaseAdmin
            .from('global_card_stats')
            .select('total_decks')
            .eq('event_rank', 'ALL')
            .limit(1)

        const globalTotal = globalStats && globalStats.length > 0 ? globalStats[0].total_decks : 0

        // 2. Fetch Aggregated Wins from Statistics Table
        // event_rank='優勝' のレコードから、アーキタイプごとの total_decks を取得
        // 全カードに同じ数値が入っているため、card_name を1つに絞って取得
        const { data: winStats, error: winError } = await supabaseAdmin
            .from('archetype_card_stats')
            .select('archetype_id, total_decks')
            .eq('event_rank', '優勝')
            // 各アーキタイプの最初のカード1件分だけ取れば、それがそのアーキタイプの優勝総数になる
            // (カード名は何でも良いが、確実に存在するであろう名前などでフィルタするか、ロジックで重複排除する)

        if (winError) throw winError

        // 3. Aggregate wins in memory (Unique by archetype_id)
        const winCounts: Record<string, number> = {}
        if (winStats && winStats.length > 0) {
            winStats.forEach(stat => {
                if (!winCounts[stat.archetype_id] || stat.total_decks > winCounts[stat.archetype_id]) {
                    winCounts[stat.archetype_id] = stat.total_decks
                }
            })
        }

        // 4. Fetch Archetype names
        const { data: archetypes, error: archError } = await supabaseAdmin
            .from('deck_archetypes')
            .select('id, name')

        if (archError) throw archError

        // 5. Combine
        const result = archetypes.map(arch => ({
            id: arch.id,
            name: arch.name,
            total: globalTotal || 0, // Global total used for context
            wins: winCounts[arch.id] || 0
        })).filter(item => item.wins > 0) // Only show archetypes with at least 1 win
        .sort((a, b) => b.wins - a.wins)

        // Store in cache
        archetypeWinStatsCache = { data: result, timestamp: Date.now() }

        return { success: true, data: result }

    } catch (error) {
        console.error('Get Archetype Win Stats Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

// アーキタイプ別デッキ数分布を archetype_card_stats から取得（環境デッキ分布チャート・デッキ一覧用）
export async function getArchetypeDistributionStatsAction() {
    try {
        const supabaseAdmin = getSupabaseAdmin()

        // グローバル総数
        const { data: globalData } = await supabaseAdmin
            .from('global_card_stats')
            .select('total_decks')
            .eq('event_rank', 'ALL')
            .limit(1)
        const globalTotal = globalData?.[0]?.total_decks || 0

        // アーキタイプ別 total_decks を全 event_rank 分まとめて取得
        const { data: archData } = await supabaseAdmin
            .from('archetype_card_stats')
            .select('archetype_id, event_rank, total_decks')
            .in('event_rank', ['ALL', '優勝', '準優勝', 'TOP4', 'TOP8'])

        // archetype_id ごとに重複排除しつつ event_rank 別に集計
        const deckCounts: Record<string, number> = {}          // event_rank='ALL' の件数
        const rankCounts: Record<string, Record<string, number>> = {}  // event_rank 別件数

        archData?.forEach(stat => {
            if (!rankCounts[stat.archetype_id]) rankCounts[stat.archetype_id] = {}
            // 同じ (archetype_id, event_rank) は全カードで同値なので最初の値だけ使う
            if (rankCounts[stat.archetype_id][stat.event_rank] === undefined) {
                rankCounts[stat.archetype_id][stat.event_rank] = stat.total_decks
            }
            if (stat.event_rank === 'ALL' && deckCounts[stat.archetype_id] === undefined) {
                deckCounts[stat.archetype_id] = stat.total_decks
            }
        })

        return { success: true, deckCounts, rankCounts, globalTotal }
    } catch (e) {
        console.error('getArchetypeDistributionStatsAction error:', e)
        return { success: false, deckCounts: {}, rankCounts: {}, globalTotal: 0 }
    }
}

// deck_records からアーキタイプ別デッキ一覧を取得（スプレッドシート由来データ）
export async function getDeckRecordsByArchetypeAction(
    archetypeId: string,
    eventRank?: string
) {
    try {
        let query = getSupabaseAdmin()
            .from('deck_records')
            .select('id, deck_code, event_rank, event_date, event_location, created_at')
            .eq('archetype_id', archetypeId)
            .order('created_at', { ascending: false })
            .limit(500)

        if (eventRank && eventRank !== 'All') {
            query = query.eq('event_rank', eventRank)
        }

        const { data, error } = await query
        if (error) throw error

        return { success: true, data: data || [] }
    } catch (e) {
        console.error('getDeckRecordsByArchetypeAction error:', e)
        return { success: false, data: [] }
    }
}

export async function updateAnalyzedDeckAction(
    deckCode: string,
    archetypeId: string,
    userId: string,
    updates: { name: string, imageUrl?: string, eventRank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8' }
) {
    return { success: true, error: undefined } // deck_records はGASが管理するため更新不要
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
        // 日付フィルタは現在未対応（deck_records.event_date で将来対応予定）
        // Fast Path のデータを返す
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
    // reference_decks テーブルへの依存を除去したため、この関数は何もしない
    return { success: true, count: 0 }
}

/**
 * Backfill event_rank for all existing decks based on their names
 */
export async function backfillEventRanksAction(userId: string) {
    return { success: true, count: 0, error: undefined }
}

// --- Phase 44: Deck Scraper Automation ---

export async function scrapePokecabookAction(url: string, startDate?: string, endDate?: string) {
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

        // Normalize dates for comparison (MM/DD -> MMDD number)
        const parseDateNum = (dStr: string) => {
            const m = dStr.match(/^(\d{1,2})\/(\d{1,2})/)
            if (!m) return null
            return parseInt(m[1], 10) * 100 + parseInt(m[2], 10)
        }

        const startNum = startDate ? parseDateNum(startDate) : null
        const endNum = endDate ? parseDateNum(endDate) : null

        const deckList: { name: string, code: string }[] = []
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
            let rawName = captionContent.replace(/<[^>]+>/g, '').replace(/【[月火水木金土日]】/g, '').trim()
            
            // Clean name for display but keep for date extraction
            let name = rawName

            // Date filtering
            if (startNum !== null || endNum !== null) {
                const dateMatch = rawName.match(/^(\d{1,2})\/(\d{1,2})/)
                if (dateMatch) {
                    const deckDateNum = parseInt(dateMatch[1], 10) * 100 + parseInt(dateMatch[2], 10)
                    
                    if (startNum !== null && deckDateNum < startNum) continue
                    if (endNum !== null && deckDateNum > endNum) continue
                } else if (startNum !== null || endNum !== null) {
                    // If filtering is requested but no date found, skip it from bulk? 
                    // Or keep? Let's skip to be safe if specific range is requested.
                    continue
                }
            }

            // Clean name for final storage (remove the date prefix if we want it cleaner, but usually PokeLix keeps it for context)
            // Let's keep it as is since user didn't ask to remove it.
            name = name.replace(/平均化|平均レシピ|平均/g, '')
            if (name === '') continue

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

        // 3. Fast Path: Use Pre-calculated stats (常にFast Pathを使用)
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
    return { success: false, error: 'この機能はPythonスクレイパーに移行予定です。', count: 0 }
}

export async function getTopAdoptedCardsAction(eventRank?: '優勝' | '準優勝' | 'TOP4' | 'TOP8'): Promise<{ success: boolean, data?: { name: string, count: number, rate: number, imageUrl: string | null }[], error?: string }> {
    try {
        // global_card_stats から取得（analyzed_decks 廃止対応）
        const supabaseAdmin = getSupabaseAdmin()
        let query = supabaseAdmin
            .from('global_card_stats')
            .select('card_name, adoption_count, total_decks, image_url, supertype, subtypes')

        if (eventRank) query = query.eq('event_rank', eventRank)
        else query = query.eq('event_rank', 'ALL')

        const { data, error } = await query
        if (error) throw error
        if (!data || data.length === 0) return { success: true, data: [] }

        const totalDecks = data[0]?.total_decks || 1

        const sorted = data
            .filter(stat => {
                // Exclude Basic Energy
                if (stat.supertype === 'Energy' && stat.subtypes?.includes('Basic')) return false
                if (stat.card_name.includes('基本') && stat.card_name.includes('エネルギー')) return false
                return stat.adoption_count > 0
            })
            .map(stat => ({
                name: stat.card_name,
                count: stat.adoption_count,
                rate: parseFloat(((stat.adoption_count / totalDecks) * 100).toFixed(1)),
                imageUrl: stat.image_url || null
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 300)

        return { success: true, data: sorted }

    } catch (error) {
        console.error('Get Top Cards Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function backfillTrendDataAction(userId: string) {
    return { success: false, error: 'この機能はPythonスクレイパーに移行予定です。', count: 0 }
}
// --- Phase 49: Pre-calculated Statistics Aggregation (Egress Optimization) ---

export async function calculateDeckStatisticsAction(userId: string) {
    return { success: false, error: 'この機能はPythonスクレイパーに移行予定です。統計データは自動更新されます。', message: undefined }
}
