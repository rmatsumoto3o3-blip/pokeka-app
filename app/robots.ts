import { MetadataRoute } from 'next'
import { baseUrl } from './sitemap'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // 管理・認証ページはインデックス不要（インデックス汚染・重複回避）
            disallow: ['/admin/', '/dashboard', '/auth', '/auth/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
