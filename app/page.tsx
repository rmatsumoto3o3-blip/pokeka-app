import { supabase } from '@/lib/supabase'
import LandingPage from '@/components/LandingPage'

// Incremental Static Regeneration (ISR)
// Revalidate this page content at most once every hour (3600 seconds)
export const revalidate = 3600

export default async function Home() {
  // Fetch data on the server during build or revalidation
  const { data: decks } = await supabase
    .from('reference_decks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100) // Limit just in case

  const { data: archetypes } = await supabase
    .from('deck_archetypes')
    .select('*')
    .order('name')

  return (
    <LandingPage
      decks={decks || []}
      archetypes={archetypes || []}
    />
  )
}
