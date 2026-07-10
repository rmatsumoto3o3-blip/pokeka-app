import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const baseUrl = 'https://pokelix.jp' // Primary Domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static Routes（priority 高い順）
    const staticRoutes: { path: string; priority: number; freq: 'daily' | 'weekly' }[] = [
        { path: '',                  priority: 1.0,  freq: 'daily'  },
        { path: '/simulator',        priority: 0.95, freq: 'daily'  },
        { path: '/global-simulator', priority: 0.95, freq: 'daily'  },
        { path: '/practice',         priority: 0.9,  freq: 'daily'  },
        { path: '/articles',         priority: 0.85, freq: 'daily'  },
        { path: '/guide',            priority: 0.8,  freq: 'weekly' },
        { path: '/about',            priority: 0.6,  freq: 'weekly' },
        { path: '/contact',          priority: 0.5,  freq: 'weekly' },
        { path: '/privacy',          priority: 0.3,  freq: 'weekly' },
        { path: '/terms',            priority: 0.3,  freq: 'weekly' },
    ]
    const routes = staticRoutes.map(({ path, priority, freq }) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: freq,
        priority,
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

    // Dynamic Routes: Public Decks (deck_records)
    const { data: decks } = await supabase
        .from('deck_records')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(200)

    const deckRoutes = (decks || []).map((deck) => ({
        url: `${baseUrl}/decks/${deck.id}`,
        lastModified: new Date(deck.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    // Dynamic Routes: Archetype pages (採用カード一覧)
    const { data: archetypes } = await supabase
        .from('deck_archetypes')
        .select('name')

    const archetypeRoutes = (archetypes || []).map((a) => ({
        url: `${baseUrl}/archetypes/${encodeURIComponent(a.name)}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }))

    return [...routes, ...articleRoutes, ...deckRoutes, ...archetypeRoutes]
}
