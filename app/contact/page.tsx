import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'お問い合わせ | PokéLix',
    description: 'ポケリス（PokéLix）に関するお問い合わせ窓口です。不具合報告、要望、掲載依頼など、公式X（旧Twitter）から受け付けています。',
}

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-pink-50 flex flex-col">
            <PublicHeader />
            <main className="flex-grow py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <ContactForm />
                </div>
            </main>
            <Footer />
        </div>
    )
}
