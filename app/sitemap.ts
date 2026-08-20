import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getFirebaseDb } from '@/lib/firebase/admin'

export const baseUrl = 'https://www.pokelix.jp' // Primary Domain

// Firebase（Supabase制限中でも動く現行データ）から詳細ページのURLを作る。
async function fbEnvDecks(game: string): Promise<{ deckCode: string; archetype?: string }[]> {
    try {
        const db = getFirebaseDb()
        if (!db) return []
        const snap = await db.collection('environmentDecks').doc(game).get()
        const decks = snap.data()?.decks
        return Array.isArray(decks) ? decks : []
    } catch { return [] }
}
async function fbRecDecks(game: string): Promise<{ deckCode: string }[]> {
    try {
        const db = getFirebaseDb()
        if (!db) return []
        const snap = await db.collection('recommendedDecks').doc(game).get()
        const decks = snap.data()?.decks
        return Array.isArray(decks) ? decks : []
    } catch { return [] }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static Routes（priority 高い順）
    const staticRoutes: { path: string; priority: number; freq: 'daily' | 'weekly' }[] = [
        { path: '',                  priority: 1.0,  freq: 'daily'  },
        { path: '/simulator',        priority: 0.95, freq: 'daily'  },
        { path: '/global-simulator', priority: 0.95, freq: 'daily'  },
        { path: '/practice',         priority: 0.9,  freq: 'daily'  },
        { path: '/decks',            priority: 0.85, freq: 'daily'  },
        { path: '/env',              priority: 0.85, freq: 'daily'  },
        { path: '/archetypes',       priority: 0.85, freq: 'daily'  },
        { path: '/articles',         priority: 0.85, freq: 'daily'  },
        { path: '/overseas',         priority: 0.7,  freq: 'daily'  },
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

    // Dynamic Routes: Articles（Supabase。制限中は空でも安全にスキップ）
    let articleRoutes: MetadataRoute.Sitemap = []
    try {
        const { data: articles } = await supabase
            .from('articles')
            .select('slug, updated_at')
            .eq('is_published', true)
        articleRoutes = (articles || []).map((article) => ({
            url: `${baseUrl}/articles/${article.slug}`,
            lastModified: new Date(article.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    } catch { /* Supabase制限中はスキップ */ }

    // Firebase（現行データ）: 環境デッキ詳細・採用率・ユニアリ/ガンダム詳細・タイトル別
    const [pkEnv, uaEnv, gdEnv, uaRec, gdRec] = await Promise.all([
        fbEnvDecks('pokemon'),
        fbEnvDecks('unionarena'),
        fbEnvDecks('gundam'),
        fbRecDecks('unionarena'),
        fbRecDecks('gundam'),
    ])

    const dyn = (prefix: string, code: string, priority: number, freq: 'daily' | 'weekly'): MetadataRoute.Sitemap[number] => ({
        url: `${baseUrl}${prefix}/${encodeURIComponent(code)}`,
        lastModified: new Date(),
        changeFrequency: freq,
        priority,
    })

    const envDeckRoutes = pkEnv.filter(d => d.deckCode).map(d => dyn('/env', d.deckCode, 0.7, 'daily'))

    // 採用率ページ（/archetypes/[name]）は現行の環境デッキのアーキタイプ名から生成
    const archNames = Array.from(new Set(pkEnv.map(d => (d.archetype || '').trim()).filter(Boolean)))
    const archetypeRoutes = archNames.map(name => dyn('/archetypes', name, 0.8, 'daily'))

    const uaDeckRoutes = uaEnv.filter(d => d.deckCode).map(d => dyn('/unionarena/decks', d.deckCode, 0.6, 'weekly'))
    const gdDeckRoutes = gdEnv.filter(d => d.deckCode).map(d => dyn('/gundam/decks', d.deckCode, 0.6, 'weekly'))
    const uaTitleRoutes = uaRec.filter(d => d.deckCode).map(d => dyn('/unionarena/titles', d.deckCode, 0.6, 'weekly'))
    const gdTitleRoutes = gdRec.filter(d => d.deckCode).map(d => dyn('/gundam/titles', d.deckCode, 0.6, 'weekly'))

    const all = [
        ...routes,
        ...articleRoutes,
        ...envDeckRoutes,
        ...archetypeRoutes,
        ...uaDeckRoutes,
        ...gdDeckRoutes,
        ...uaTitleRoutes,
        ...gdTitleRoutes,
    ]

    // URL重複を排除
    const seen = new Set<string>()
    return all.filter(r => (seen.has(r.url) ? false : (seen.add(r.url), true)))
}
