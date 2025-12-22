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

export interface Deck {
  id: string
  user_id: string
  deck_code: string | null  // デッキコードは任意に変更
  deck_name: string
  image_url: string | null
  created_at: string
}

export interface Match {
  id: string
  deck_id: string
  user_id: string
  result: 'win' | 'loss' | 'draw'
  opponent_name: string | null  // 任意項目に変更
  date: string
  notes: string | null
  side: string | null  // サイドカード枚数（例: "3-6"）
  going_first: '先攻' | '後攻' | null  // 先攻/後攻の選択
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

export interface DeckArchetype {
  id: string
  name: string
  cover_image_url?: string | null
  display_order?: number
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

// Helper function to get deck with match statistics
export interface DeckWithStats extends Deck {
  total_matches: number
  wins: number
  losses: number
  draws: number
  win_rate: number
}
