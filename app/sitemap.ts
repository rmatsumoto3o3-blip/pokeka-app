import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const baseUrl = 'https://www.pokelix.jp' // Primary Domain

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static Routes（priority 高い順）
    const staticRoutes: { path: string; priority: number; freq: 'daily' | 'weekly' }[] = [
        { path: '',                  priority: 1.0,  freq: 'daily'  },
        { path: '/simulator',        priority: 0.95, freq: 'daily'  },
        { path: '/global-simulator', priority: 0.95, freq: 'daily'  },
        { path: '/practice',         priority: 0.9,  freq: 'daily'  },
        { path: '/decks',            priority: 0.85, freq: 'daily'  },
        { path: '/archetypes',       priority: 0.85, freq: 'daily'  },
        { path: '/articles',         priority: 0.85, freq: 'daily'  },
        { path: '/unionarena',        priority: 0.8,  freq: 'daily'  },
        { path: '/unionarena/decks',  priority: 0.75, freq: 'daily'  },
        { path: '/unionarena/titles', priority: 0.7,  freq: 'weekly' },
        { path: '/gundam',            priority: 0.8,  freq: 'daily'  },
        { path: '/gundam/decks',      priority: 0.75, freq: 'daily'  },
        { path: '/gundam/titles',     priority: 0.7,  freq: 'weekly' },
        { path: '/guide',            priority: 0.8,  freq: 'weekly' },
        { path: '/kids',             priority: 0.5,  freq: 'weekly' },
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

    // 個別デッキページ(/decks/[id])は公開終了（TOPへリダイレクト）のためサイトマップから除外。

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

    // Dynamic Routes: ユニアリ / ガンダムのデッキ詳細・タイトル別デッキ詳細
    // 各テーブルは RLS で公開読み取り可。id を URL に採用。
    async function idRoutes(table: string, prefix: string, priority: number) {
        const { data } = await supabase.from(table).select('id, created_at')
        return (data || []).map((r: { id: string | number; created_at?: string }) => ({
            url: `${baseUrl}${prefix}/${r.id}`,
            lastModified: r.created_at ? new Date(r.created_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority,
        }))
    }

    const [uaDeckRoutes, uaTitleRoutes, gdDeckRoutes, gdTitleRoutes] = await Promise.all([
        idRoutes('unionarena_deck_records', '/unionarena/decks', 0.6),
        idRoutes('unionarena_recommended_decks', '/unionarena/titles', 0.6),
        idRoutes('gundam_deck_records', '/gundam/decks', 0.6),
        idRoutes('gundam_recommended_decks', '/gundam/titles', 0.6),
    ])

    return [
        ...routes,
        ...articleRoutes,
        ...archetypeRoutes,
        ...uaDeckRoutes,
        ...uaTitleRoutes,
        ...gdDeckRoutes,
        ...gdTitleRoutes,
    ]
}
