import { MetadataRoute } from 'next'
import { baseUrl } from './sitemap'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/', // Hide admin from crawlers
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
