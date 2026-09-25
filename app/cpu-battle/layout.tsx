import type { Metadata } from 'next'

// 裏ツール：検索に出さない・ナビ非掲載。知っているURLからのみアクセス。
export const metadata: Metadata = {
    title: 'CPU対戦（開発中）',
    robots: { index: false, follow: false },
}

export default function CpuBattleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
