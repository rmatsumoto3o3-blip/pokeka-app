import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const baseUrl = 'https://pokelix.jp' // Primary Domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static Routes
    const routes = [
        '',
        '/dashboard',
        '/practice',
        '/articles',
        '/contact',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }))

    // Dynamic Routes: Articles
    const { data: articles } = await supabase
        .from('articles')
        .select('slug, updated_at')
        .eq('is_published', true)

    const articleRoutes = (articles || []).map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // Dynamic Routes: Public Decks (Reference Decks)
    const { data: decks } = await supabase
        .from('reference_decks')
        .select('id, created_at')
        .limit(100) // Limit for now

    const deckRoutes = (decks || []).map((deck) => ({
        url: `${baseUrl}/decks/${deck.id}`, // Note: Verify if we have a public deck page at this URL
        lastModified: new Date(deck.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...routes, ...articleRoutes]
}
