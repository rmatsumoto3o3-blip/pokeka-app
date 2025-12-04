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
  deck_code: string
  deck_name: string
  image_url: string | null
  created_at: string
}

export interface Match {
  id: string
  deck_id: string
  user_id: string
  result: 'win' | 'loss' | 'draw'
  opponent_name: string
  date: string
  notes: string | null
  created_at: string
}

// Helper function to get deck with match statistics
export interface DeckWithStats extends Deck {
  total_matches: number
  wins: number
  losses: number
  draws: number
  win_rate: number
}
