import { MetadataRoute } from 'next'
import { baseUrl } from './sitemap'

// AI学習・生成AI向けのデータ収集クローラ。robots.txt で全面拒否する。
// ※ あくまで「宣言」であり、従うのは行儀のよいボットのみ（悪質スクレイパーは無視する）。
//    検索用の Googlebot / Bingbot は下の '*' ルールで許可したままにして検索順位は守る。
//    Google-Extended / Applebot-Extended は AI学習専用で、検索インデックス（Googlebot/Applebot）
//    には影響しないため拒否してよい。
const AI_BOTS = [
    // OpenAI
    'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
    // Anthropic
    'ClaudeBot', 'Claude-Web', 'Claude-User', 'anthropic-ai',
    // Google / Apple の AI学習枠（検索ボットとは別）
    'Google-Extended', 'Applebot-Extended',
    // Perplexity
    'PerplexityBot', 'Perplexity-User',
    // Common Crawl（多くのLLM学習の元データ）
    'CCBot',
    // ByteDance / Amazon / Meta
    'Bytespider', 'Amazonbot', 'Meta-ExternalAgent', 'meta-externalagent', 'FacebookBot',
    // その他データ収集・スクレイパー系
    'cohere-ai', 'Diffbot', 'Omgilibot', 'ImagesiftBot', 'YouBot',
    'DuckAssistBot', 'Timpibot', 'PanguBot', 'Kangaroo Bot', 'Scrapy',
]

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                // 管理・認証ページはインデックス不要（インデックス汚染・重複回避）
                disallow: ['/admin/', '/dashboard', '/auth', '/auth/'],
            },
            // AI学習・データ収集ボットは全面拒否（検索ボットは上の '*' で許可を維持）
            {
                userAgent: AI_BOTS,
                disallow: '/',
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
