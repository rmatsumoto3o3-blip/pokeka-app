import { redirect } from 'next/navigation'

// 個別デッキ詳細（集計元の生デッキリスト）は公開を終了。TOPへ恒久リダイレクト。
export default async function DeckDetailPage() {
    redirect('/')
}
