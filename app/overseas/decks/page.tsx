import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import OverseasDeckList from '@/components/OverseasDeckList'
import { getOverseasArchetypesAction, getOverseasResultsAction, getOverseasTournamentsAction } from '@/app/actions'

export const revalidate = 86400

export const metadata: Metadata = {
    title: '海外大会・デッキ一覧 | PokéLix（ポケリス）',
    description: '海外ポケモンカード大会の入賞デッキを、地域・大会・順位・デッキタイプで絞り込めます。',
    robots: { index: false, follow: false },
}

export default async function OverseasDecksPage() {
    const [archetypes, results, tournaments] = await Promise.all([getOverseasArchetypesAction(), getOverseasResultsAction(), getOverseasTournamentsAction()])
    return <div className="flex min-h-screen flex-col bg-slate-50"><PublicHeader game="overseas" /><main className="mx-auto w-full max-w-5xl flex-grow px-4 py-8"><div className="mb-7"><Link href="/overseas" className="text-sm font-medium text-sky-600">← 海外TOPに戻る</Link><div className="mt-3 flex flex-wrap items-center gap-2"><h1 className="text-2xl font-extrabold text-gray-900 md:text-4xl">海外大会・デッキ一覧</h1><span className="rounded bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">DRY RUN</span></div><p className="mt-2 text-sm text-gray-600">地域・大会・順位・デッキタイプで絞り込みできます。カード名は英語のまま表示します。</p></div><OverseasDeckList archetypes={archetypes.data} results={results.data} tournaments={tournaments.data} /></main><Footer game="overseas" /></div>
}
