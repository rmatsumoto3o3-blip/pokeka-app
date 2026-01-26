'use client'

import { useState, useEffect } from 'react'
import { supabase, Article } from '@/lib/supabase'

export default function ArticleManager() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    // Form inputs
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [content, setContent] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

    const [isPublished, setIsPublished] = useState(false)

    // Link Tool State
    const [linkText, setLinkText] = useState('')
    const [linkUrl, setLinkUrl] = useState('')

    useEffect(() => {
        fetchArticles()
    }, [])

    const fetchArticles = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setArticles(data || [])
        } catch (error) {
            console.error('Error fetching articles:', error)
            alert('記事の取得に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setEditingArticle(null)
        setIsEditing(false)
        setTitle('')
        setSlug('')
        setContent('')
        setExcerpt('')
        setThumbnailUrl('')
        setThumbnailFile(null)
        setIsPublished(false)
    }

    const handleEdit = (article: Article) => {
        setEditingArticle(article)
        setTitle(article.title)
        setSlug(article.slug)
        setContent(article.content)
        setExcerpt(article.excerpt || '')
        setThumbnailUrl(article.thumbnail_url || '')
        setThumbnailFile(null)
        setIsPublished(article.is_published)
        setIsEditing(true)
    }

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars
            .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with -
            .replace(/^-+|-+$/g, '') // Trim -
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        if (!isEditing) {
            // Auto-generate slug from title (simple version, user should edit)
            // setSlug(generateSlug(newTitle)) 
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let finalThumbnailUrl = thumbnailUrl

            // If user uploaded a file, upload it to Supabase storage
            if (thumbnailFile) {
                const fileExt = thumbnailFile.name.split('.').pop()
                const fileName = `articles/${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from('deck-images')
                    .upload(fileName, thumbnailFile)

                if (uploadError) throw uploadError

                const { data } = supabase.storage
                    .from('deck-images')
                    .getPublicUrl(fileName)

                finalThumbnailUrl = data.publicUrl
            }

            const articleData = {
                title,
                slug,
                content,
                excerpt,
                thumbnail_url: finalThumbnailUrl,
                is_published: isPublished,
                updated_at: new Date().toISOString(),
            }

            if (editingArticle?.id) {
                // Update
                const { error } = await supabase
                    .from('articles')
                    .update(articleData)
                    .eq('id', editingArticle.id)

                if (error) throw error
                alert('記事を更新しました')
            } else {
                // Create
                const { error } = await supabase
                    .from('articles')
                    .insert([articleData])

                if (error) throw error
                alert('記事を作成しました')
            }

            resetForm()
            fetchArticles()
        } catch (error) {
            console.error('Error saving article:', error)
            alert('記事の保存に失敗しました')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('本当に削除しますか？')) return

        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', id)

            if (error) throw error
            alert('記事を削除しました')
            fetchArticles()
        } catch (error) {
            console.error('Error deleting article:', error)
            alert('削除に失敗しました')
        }
    }

    if (loading) return <div>読み込み中...</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">記事管理</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        新規記事作成
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">{editingArticle ? '記事編集' : '新規記事作成'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">スラッグ (URLの一部)</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 font-mono text-sm text-gray-900 bg-white"
                                placeholder="example-article-slug"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                サムネイル画像
                            </label>

                            {/* Image Preview */}
                            {(thumbnailUrl || thumbnailFile) && (
                                <div className="mb-3">
                                    <div className="w-full max-w-md h-48 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                                        <img
                                            src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : thumbnailUrl}
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* File Upload */}
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            setThumbnailFile(file)
                                            setThumbnailUrl('') // Clear URL if file is selected
                                        }
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 text-sm"
                                />

                                <div className="text-center text-sm text-gray-500">または</div>

                                {/* URL Input */}
                                <input
                                    type="text"
                                    value={thumbnailUrl}
                                    onChange={(e) => {
                                        setThumbnailUrl(e.target.value)
                                        setThumbnailFile(null) // Clear file if URL is entered
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 text-sm"
                                    placeholder="https://example.com/image.jpg"
                                    disabled={!!thumbnailFile}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">抜粋 (メタディスクリプション用)</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 h-20 text-gray-900 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                本文
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 h-96 font-mono text-sm text-gray-900 bg-white"
                                required
                            />
                        </div>

                        {/* Image Inserter Tool */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-sm font-bold text-blue-800 mb-2">
                                📷 本文挿入用画像アップロード
                            </label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return

                                            // Upload immediately
                                            try {
                                                const fileExt = file.name.split('.').pop()
                                                const fileName = `article-content/${Date.now()}.${fileExt}`
                                                const { error: uploadError } = await supabase.storage
                                                    .from('deck-images') // Reusing this bucket as per convention
                                                    .upload(fileName, file)

                                                if (uploadError) throw uploadError

                                                const { data } = supabase.storage
                                                    .from('deck-images')
                                                    .getPublicUrl(fileName)

                                                const imgTag = `<img src="${data.publicUrl}" alt="Inserted Image" class="w-full rounded-lg shadow-md my-6" />`
                                                setContent(prev => prev + '\n' + imgTag + '\n')
                                                alert('画像をアップロードし、本文末尾にタグを追加しました！')
                                            } catch (err) {
                                                alert('アップロード失敗')
                                                console.error(err)
                                            }
                                        }}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                    />
                                    <p className="text-xs text-blue-600 mt-2">
                                        ※画像を選択すると自動的にアップロードされ、本文の末尾にHTMLタグが追加されます。
                                    </p>
                                </div>
                            </div>
                        </div>


                        {/* Link Inserter Tool */}
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <label className="block text-sm font-bold text-purple-800 mb-2">
                                🔗 本文挿入用リンク作成
                            </label>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs text-purple-600 mb-1">表示テキスト</label>
                                    <input
                                        type="text"
                                        value={linkText}
                                        onChange={(e) => setLinkText(e.target.value)}
                                        placeholder="ここをクリック"
                                        className="w-full text-sm p-2 border border-purple-200 rounded text-gray-900"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-xs text-purple-600 mb-1">URL</label>
                                    <input
                                        type="text"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full text-sm p-2 border border-purple-200 rounded text-gray-900"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!linkText || !linkUrl) return alert('テキストとURLを入力してください')
                                        const linkTag = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-bold">${linkText}</a>`
                                        setContent(prev => prev + '\n' + linkTag + '\n')
                                        setLinkText('')
                                        setLinkUrl('')
                                        alert('リンクタグを末尾に追加しました！')
                                    }}
                                    className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-purple-700 h-[38px]"
                                >
                                    追加
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isPublished"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                                公開する
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-bold"
                            >
                                保存する
                            </button>
                        </div>
                    </form>
                </div >
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スラッグ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作成日</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {articles.map((article) => (
                                <tr key={article.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${article.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {article.is_published ? '公開中' : '下書き'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{article.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{article.excerpt}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {article.slug}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(article.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(article)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            編集
                                        </button>
                                        <button
                                            onClick={() => handleDelete(article.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            削除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        記事がまだありません
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
