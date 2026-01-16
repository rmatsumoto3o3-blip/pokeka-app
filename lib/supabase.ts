import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  nickname: string
  created_at: string
}

export interface DeckArchetype {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface Deck {
  id: string
  user_id: string
  deck_code: string | null
  deck_name: string
  image_url: string | null
  created_at: string
  // New Fields for Phase 23
  archetype_id: string | null
  version_label: string | null // e.g., 'v1.0'
  memo: string | null
  sideboard_cards: any[] | null // JSONB
  is_current: boolean
}

export interface Match {
  id: string
  deck_id: string
  user_id: string
  result: 'win' | 'loss' | 'draw'
  opponent_name: string | null
  date: string
  notes: string | null
  side: string | null
  going_first: '先攻' | '後攻' | null
  created_at: string
}

export interface ReferenceDeck {
  id: string
  deck_name: string
  deck_code: string | null
  deck_url: string | null
  image_url: string | null
  event_type: 'City League' | 'Championship' | 'Worldwide' | 'Gym Battle' | null
  archetype_id: string | null
  created_at: string
}

export interface ReferenceDeckFavorite {
  id: string
  user_id: string
  deck_id: string
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  thumbnail_url: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at?: string
}

export interface GameEnvironment {
  id: string
  name: string
  start_date: string
  end_date: string | null
  description: string | null
  created_at: string
  updated_at: string
}

// Helper function to get deck with match statistics
export interface DeckWithStats extends Deck {
  total_matches: number
  wins: number
  losses: number
  draws: number
  win_rate: number
}
