export function PlayerIcon({kind}:{kind:"play"|"pause"|"stop"|"speaker"|"mute"}) {
 return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
 {kind==="play"&&<path d="M7 4.5a.8.8 0 0 1 1.2-.7l12 7.5a.8.8 0 0 1 0 1.4l-12 7.5a.8.8 0 0 1-1.2-.7Z"/>}
 {kind==="pause"&&<><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></>}
 {kind==="stop"&&<rect x="5" y="5" width="14" height="14" rx="1.5"/>}
 {(kind==="speaker"||kind==="mute")&&<><path d="M3 9h4l5-4v14l-5-4H3Z"/>{kind==="speaker"?<g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/></g>:<path d="m16 9 6 6m0-6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>}</>}
 </svg>;
}
