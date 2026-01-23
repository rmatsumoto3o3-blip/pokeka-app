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
// --- Phase 36: Deck Analytics Automation ---

export async function addDeckToAnalyticsAction(deckCode: string, archetypeId: string, userId: string) {
    try {
        // 1. Check permissions (Admin only)
        const ADMIN_EMAILS = [
            'player1@pokeka.local',
            'player2@pokeka.local',
            'player3@pokeka.local',
            'r.matsumoto.3o3@gmail.com',
            'nexpure.event@gmail.com',
            'admin@pokeka.local'
        ]

        const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
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
        const { data: existing } = await supabaseAdmin
            .from('analyzed_decks')
            .select('id')
            .eq('deck_code', deckCode)
            .eq('archetype_id', archetypeId)
            .single()

        if (existing) {
            return { success: false, error: 'このデッキコードは既にこのアーキタイプに登録されています。' }
        }

        const { error: insertError } = await supabaseAdmin
            .from('analyzed_decks')
            .insert([{
                user_id: userId,
                deck_code: deckCode,
                archetype_id: archetypeId,
                cards_json: cards
            }])

        if (insertError) throw insertError

        // 4. [Sync] Add to reference_decks for Top Page Display
        // Fetch archetype name for deck_name
        const { data: archetypeData } = await supabaseAdmin
            .from('deck_archetypes')
            .select('name')
            .eq('id', archetypeId)
            .single()

        const deckName = archetypeData?.name || 'New Deck'
        // Use the first card (usually a Pokemon) as the thumbnail
        const imageUrl = cards.length > 0 ? cards[0].imageUrl : null

        const { error: refError } = await supabaseAdmin
            .from('reference_decks')
            .insert([{
                deck_name: deckName,
                deck_code: deckCode,
                deck_url: `https://www.pokemon-card.com/deck/confirm.html/deckID/${deckCode}`,
                image_url: imageUrl,
                event_type: 'Gym Battle', // Default category
                archetype_id: archetypeId
            }])

        if (refError) {
            console.warn('Reference Deck Sync Failed:', refError)
            // Do not fail the whole action, just log it. The analytics part succeeded.
        }

        return { success: true }

    } catch (error) {
        console.error('Add Analytics Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function removeDeckFromAnalyticsAction(id: string, userId: string) {
    try {
        // Admin permission check (simplified by reusing the list logic or assuming UI hides it, but robust check is better)
        const ADMIN_EMAILS = [
            'player1@pokeka.local',
            'player2@pokeka.local',
            'player3@pokeka.local',
            'r.matsumoto.3o3@gmail.com',
            'nexpure.event@gmail.com',
            'admin@pokeka.local'
        ]
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        const { error } = await supabaseAdmin
            .from('analyzed_decks')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { success: true }

    } catch (error) {
        return { success: false, error: (error as Error).message }
    }
}

export async function getDeckAnalyticsAction(archetypeId: string) {
    try {
        // 1. Fetch all decks for this archetype
        const { data: decks, error } = await supabaseAdmin
            .from('analyzed_decks')
            .select('*')
            .eq('archetype_id', archetypeId)
            .order('created_at', { ascending: false })

        if (error) throw error
        if (!decks || decks.length === 0) {
            return { success: true, decks: [], analytics: [], totalDecks: 0 }
        }

        // 2. Aggregate Data
        const totalDecks = decks.length
        const cardStats: Record<string, {
            name: string,
            imageUrl: string,
            supertype: string,
            totalQty: number,
            adoptionCount: number,
            subtypes?: string[]
        }> = {}

        decks.forEach(deck => {
            const cards = deck.cards_json as CardData[]
            // Use a Set to track "adoption" (1 per deck max)
            const seenInThisDeck = new Set<string>()

            cards.forEach(card => {
                const key = card.name // Group by Name
                if (!cardStats[key]) {
                    cardStats[key] = {
                        name: card.name,
                        imageUrl: card.imageUrl, // Use the image from the first occurrence
                        supertype: card.supertype,
                        subtypes: card.subtypes,
                        totalQty: 0,
                        adoptionCount: 0
                    }
                }

                cardStats[key].totalQty += card.quantity

                if (!seenInThisDeck.has(key)) {
                    cardStats[key].adoptionCount += 1
                    seenInThisDeck.add(key)
                }
            })
        })

        // 3. Format Result
        const analytics = Object.values(cardStats).map(stat => ({
            name: stat.name,
            imageUrl: stat.imageUrl,
            supertype: stat.supertype,
            subtypes: stat.subtypes,
            adoptionRate: (stat.adoptionCount / totalDecks) * 100,
            avgQuantity: (stat.totalQty / stat.adoptionCount) // Avg quantity WHEN adopted (common in TCG analysis) 
            // OR (stat.totalQty / totalDecks) for Avg per deck overall.
            // Usually "Avg copies (when played)" is more useful for deck building, 
            // but "Avg copies (overall)" is strictly statistical.
            // Let's return both or stick to standard. 
            // User likely wants "If I play this, how many do I put?". So Avg per Adoption is good.
            // Let's verify standard TCG sites. Limitless uses "Avg" (overall/adoption).
            // Let's provide "avgQuantity" as (totalQty / adoptionCount) to say "Adopting decks usually play X copies".
        })).sort((a, b) => b.adoptionRate - a.adoptionRate) // Sort by popularity

        return { success: true, decks, analytics, totalDecks }

    } catch (error) {
        console.error('Get Analytics Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

export async function getGlobalDeckAnalyticsAction() {
    try {
        // 1. Fetch all analyzed decks
        const { data: decks, error } = await supabaseAdmin
            .from('analyzed_decks')
            .select('*')

        if (error) throw error
        if (!decks) return { success: true, analyticsByArchetype: {} }

        // 2. Aggregate per Archetype
        const analyticsByArchetype: Record<string, any[]> = {}
        const deckCountsByArchetype: Record<string, number> = {}

        // Group decks by archetype
        decks.forEach(deck => {
            if (!deckCountsByArchetype[deck.archetype_id]) deckCountsByArchetype[deck.archetype_id] = 0
            deckCountsByArchetype[deck.archetype_id]++
        })

        // Temporary storage for stats per archetype
        const statsByArchetype: Record<string, Record<string, any>> = {}

        decks.forEach(deck => {
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

        // Format
        Object.keys(statsByArchetype).forEach(archId => {
            const totalDecks = deckCountsByArchetype[archId]
            analyticsByArchetype[archId] = Object.values(statsByArchetype[archId]).map(stat => ({
                id: stat.name, // Use name as ID for display
                card_name: stat.name,
                image_url: stat.imageUrl,
                category: mapSupertypeToCategory(stat.supertype, stat.subtypes),
                adoption_quantity: (stat.totalQty / stat.adoptionCount).toFixed(1), // Average Quantity
                adoption_rate: ((stat.adoptionCount / totalDecks) * 100).toFixed(0) // Adoption Rate %
            })).sort((a, b) => Number(b.adoption_rate) - Number(a.adoption_rate))
        })

        return { success: true, analyticsByArchetype }

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
        const ADMIN_EMAILS = [
            'player1@pokeka.local',
            'player2@pokeka.local',
            'player3@pokeka.local',
            'r.matsumoto.3o3@gmail.com',
            'nexpure.event@gmail.com',
            'admin@pokeka.local'
        ]
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
        if (!user.user?.email || !ADMIN_EMAILS.includes(user.user.email)) {
            return { success: false, error: '権限がありません' }
        }

        // 2. Fetch all analyzed decks
        const { data: analyzedDecks, error: fetchError } = await supabaseAdmin
            .from('analyzed_decks')
            .select('*')

        if (fetchError) throw fetchError
        if (!analyzedDecks) return { success: true, count: 0 }

        // 3. Sync Loop
        let addedCount = 0
        for (const deck of analyzedDecks) {
            // Check existence
            const { data: existing } = await supabaseAdmin
                .from('reference_decks')
                .select('id')
                .eq('deck_code', deck.deck_code)
                .single()

            if (!existing) {
                // Fetch archetype name
                const { data: arch } = await supabaseAdmin
                    .from('deck_archetypes')
                    .select('name')
                    .eq('id', deck.archetype_id)
                    .single()

                const deckName = arch?.name || 'Analyzed Deck'

                // Parse cards to get image
                const cards = deck.cards_json as CardData[] // Cast safely
                const imageUrl = (cards && cards.length > 0) ? cards[0].imageUrl : null

                // Insert
                await supabaseAdmin
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
