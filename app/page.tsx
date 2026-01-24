import { supabase } from '@/lib/supabase'
import LandingPage from '@/components/LandingPage'

// Incremental Static Regeneration (ISR)
// Revalidate this page content at most once every 60 seconds
export const revalidate = 60

export default async function Home() {
  // Fetch data concurrently for better performance
  const [
    { data: decks },
    { data: archetypes },
    { data: articles }
  ] = await Promise.all([
    supabase.from('reference_decks').select('*').order('created_at', { ascending: false }).limit(1000),
    supabase.from('deck_archetypes').select('*').order('display_order', { ascending: true }).order('name', { ascending: true }),
    supabase.from('articles').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(5)
  ])

  return (
    <LandingPage
      decks={decks || []}
      archetypes={archetypes || []}
      articles={articles || []}
    />
  )
}
