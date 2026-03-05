import React, { useEffect } from 'react'

interface AdPlaceholderProps {
    slot?: string
    format?: 'rectangle' | 'horizontal' | 'vertical' | 'responsive'
    label?: string
    className?: string
}

declare global {
    interface Window {
        adsbygoogle: any[]
    }
}

export default function AdPlaceholder({
    slot = '0000000000',
    format = 'responsive',
    label = 'スポンサーリンク',
    className = ''
}: AdPlaceholderProps) {
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className={`flex flex-col items-center justify-center my-8 ${className}`}>
            <span className="text-[10px] uppercase tracking-[0.2em] mb-2 text-gray-400 font-bold">{label}</span>
            <div className="w-full bg-gray-50/50 rounded-xl overflow-hidden flex items-center justify-center min-h-[100px]">
                {/* Google AdSense Display Unit */}
                <ins className="adsbygoogle"
                    style={{ display: 'block', textAlign: 'center' }}
                    data-ad-client="ca-pub-2951381820280282"
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive="true"></ins>
            </div>
        </div>
    );
}
