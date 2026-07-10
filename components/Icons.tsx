// Tabler Icons 風の線画アイコン（CDN 不使用・インラインSVG）共通セット
const ICON_PATHS: Record<string, React.ReactNode> = {
    trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21 1.18.54 2.03 2.03 2.03 3.79" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></>,
    cards: <><rect x="3" y="5" width="14" height="16" rx="2" /><path d="M7 3h12a2 2 0 0 1 2 2v12" /></>,
    dice: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="0.75" fill="currentColor" /><circle cx="15.5" cy="8.5" r="0.75" fill="currentColor" /><circle cx="12" cy="12" r="0.75" fill="currentColor" /><circle cx="8.5" cy="15.5" r="0.75" fill="currentColor" /><circle cx="15.5" cy="15.5" r="0.75" fill="currentColor" /></>,
    world: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    list: <><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M8 11h8" /><path d="M8 16h8" /></>,
    chart: <><path d="M6 20v-4" /><path d="M12 20V10" /><path d="M18 20V4" /></>,
    pie: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></>,
    eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    calc: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8" /><path d="M8 11h.01" /><path d="M12 11h.01" /><path d="M16 11h.01" /><path d="M8 15h.01" /><path d="M12 15h.01" /><path d="M16 15h.01" /><path d="M8 19h.01" /><path d="M12 19h.01" /><path d="M16 19h.01" /></>,
    phone: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    rocket: <><path d="M4.5 16.5c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8 1.2-2 .5-3-.7-1-1.7-.7-3.5.5z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12a5 5 0 0 0-3 3" /><path d="M14 9a5 5 0 0 1 3-3" /></>,
    x: <><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    fire: <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></>,
    sparkle: <><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></>,
    link: <><path d="M9 15l6-6" /><path d="M11 6l.463-.536a5 5 0 0 1 7.071 7.072L18 13" /><path d="M13 18l-.397.534a5.068 5.068 0 0 1-7.127 0 4.972 4.972 0 0 1 0-7.071L6 11" /></>,
    chevronDown: <path d="M6 9l6 6 6-6" />,
}

export function Ico({ name, className = 'w-6 h-6' }: { name: string; className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {ICON_PATHS[name]}
        </svg>
    )
}
