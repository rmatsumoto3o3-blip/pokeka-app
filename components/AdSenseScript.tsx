'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function AdSenseScript() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // AdSense preview and Auto Ads can conflict with Next.js hydration.
        // Delaying the script load until after the component has mounted on the client
        // helps avoid "Application error: a client-side exception has occurred".
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2951381820280282"
            crossOrigin="anonymous"
            strategy="lazyOnload"
        />
    );
}
