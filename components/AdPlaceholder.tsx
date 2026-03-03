import React from 'react'

interface AdPlaceholderProps {
    slot?: string
    format?: 'rectangle' | 'horizontal' | 'vertical' | 'responsive'
    label?: string
    className?: string
}

export default function AdPlaceholder({
    slot = '0000000000',
    format = 'responsive',
    label = 'スポンサーリンク',
    className = ''
}: AdPlaceholderProps) {
    // 【AdSense審査対策】
    // 審査期間中は「広告枠」や「PR要素」がコンテンツ不足と判断される材料になるため、
    // 承認されるまではコンポーネント自体をレンダリングしないようにします。
    // 承認後に実際の広告コードをここに配置してください。
    return null;

    /* 以前のプレースホルダー表示（必要に応じて復元可能）
    return (
        <div className={`flex flex-col items-center justify-center bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden ${className}`}>
            <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center text-gray-300 p-4 text-center">
                <span className="text-[10px] uppercase tracking-[0.2em] mb-4 opacity-50">{label}</span>
                <div className="w-full max-w-[300px] h-[200px] bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
    */
}
