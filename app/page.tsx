import { createClient } from '@/utils/supabase/server'
import LandingPage from '@/components/LandingPage'

// Incremental Static Regeneration (ISR)
// Revalidate this page content at most once every 60 seconds
export const revalidate = 60

export default async function Home() {
  const supabase = await createClient()
  // Fetch data concurrently for better performance
  const [
    { data: archetypes },
    { data: articles }
  ] = await Promise.all([
    supabase.from('deck_archetypes').select('*').order('display_order', { ascending: true }).order('name', { ascending: true }),
    supabase.from('articles').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(5)
  ])
  const decks: any[] = []

  return (
    <LandingPage
      decks={decks || []}
      archetypes={archetypes || []}
      articles={articles || []}
    />
  )
}
