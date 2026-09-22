"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { Song } from "./data";
import {MusicArticle} from "./MusicArticle";
import {PlayerIcon} from "./PlayerIcon";
import {MasterVolume} from "./MasterVolume";
import styles from "./music.module.css";
import {useMasterVolume} from "./useMasterVolume";
export function formatTime(seconds:number){const n=Math.floor(Number.isFinite(seconds)?seconds:0);return `${Math.floor(n/60).toString().padStart(2,"0")}:${(n%60).toString().padStart(2,"0")}`;}
type Modal={song:Song;kind:"lyrics"|"article"};
export function MusicPlayer({songs}:{songs:Song[]}){
 const audio=useRef<HTMLAudioElement>(null);const selected=useRef<string|null>(null);const request=useRef(0);const pendingSeek=useRef<number|null>(null);
 const [active,setActive]=useState<string|null>(null);const [playing,setPlaying]=useState(false);const [time,setTime]=useState(0);const [durations,setDurations]=useState<Record<string,number>>({});const [error,setError]=useState("");
 const [volumeState,updateVolume]=useMasterVolume();
 const [modal,setModal]=useState<Modal|null>(null);const [content,setContent]=useState({lyrics:"",caption:"",article:"",loading:false,error:""});const dialog=useRef<HTMLDialogElement>(null);const opener=useRef<HTMLButtonElement|null>(null);const backdropStart=useRef(false);
 const base=process.env.NEXT_PUBLIC_BASE_PATH??"";
 useEffect(()=>{if(audio.current)audio.current.volume=volumeState.muted?0:volumeState.volume;},[volumeState]);
 function changeVolume(n:number){updateVolume({volume:n,muted:false,previous:n>0?n:volumeState.previous});}
 function toggleMute(){if(volumeState.muted||volumeState.volume===0)updateVolume({...volumeState,volume:volumeState.volume||volumeState.previous,muted:false});else updateVolume({...volumeState,previous:volumeState.volume,muted:true});}
 useEffect(()=>{const player=audio.current;return()=>player?.pause();},[]);
 useEffect(()=>{
  if(!modal)return;const controller=new AbortController();const box=dialog.current;const button=opener.current;box?.showModal();const overflow=document.body.style.overflow;document.body.style.overflow="hidden";
  const text=async(url:string)=>{const r=await fetch(base+url,{signal:controller.signal});if(!r.ok)throw new Error();return r.text();};
  (modal.kind==="lyrics"?text(modal.song.lyrics).then(lyrics=>({lyrics,caption:"",article:""})):Promise.all([text(modal.song.caption),text(modal.song.article)]).then(([caption,article])=>({lyrics:"",caption,article}))).then(result=>setContent({...result,loading:false,error:""})).catch(e=>{if(e.name!=="AbortError")setContent({lyrics:"",caption:"",article:"",loading:false,error:"読み込めませんでした。閉じてからもう一度お試しください。"});});
  return()=>{controller.abort();box?.close();document.body.style.overflow=overflow;button?.focus({preventScroll:true});};
 },[modal,base]);
 function openModal(song:Song,kind:Modal["kind"],button:HTMLButtonElement){opener.current=button;setContent({lyrics:"",caption:"",article:"",loading:true,error:""});setModal({song,kind});}
 function select(song:Song){const p=audio.current;if(!p)return null;if(selected.current!==song.id){request.current++;p.pause();pendingSeek.current=null;selected.current=song.id;p.src=base+song.audio;setActive(song.id);setTime(0);}p.volume=volumeState.muted?0:volumeState.volume;return p;}
 async function play(song:Song){const p=select(song);if(!p)return;const attempt=++request.current;setError("");if(p.ended||(Number.isFinite(p.duration)&&p.currentTime>=p.duration)){p.currentTime=0;setTime(0);}try{await p.play();}catch{if(attempt===request.current)setError("再生できませんでした。再生ボタンからもう一度お試しください。");}}
 function pause(){request.current++;audio.current?.pause();}
 function stop(){pause();pendingSeek.current=null;if(audio.current)audio.current.currentTime=0;setTime(0);}
 function seek(song:Song,n:number){const p=select(song);if(!p)return;setTime(n);if(p.readyState>=1&&Number.isFinite(p.duration)){p.currentTime=Math.min(n,p.duration);pendingSeek.current=null;}else pendingSeek.current=n;}
 function metadata(){const p=audio.current;if(!p||!selected.current||!Number.isFinite(p.duration))return;setDurations(v=>({...v,[selected.current!]:p.duration}));if(pendingSeek.current!==null){p.currentTime=Math.min(pendingSeek.current,p.duration);setTime(p.currentTime);pendingSeek.current=null;}}
 return <>
 <div className={styles.listHeading}><h2 id="music-list-title">Music List</h2><div className={styles.listActions}><span>{String(songs.length).padStart(2,"0")} TRACKS</span><MasterVolume volume={volumeState.volume} muted={volumeState.muted} onVolume={changeVolume} onMute={toggleMute}/></div></div>
 <audio ref={audio} preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={()=>{if(pendingSeek.current===null)setTime(audio.current?.currentTime??0);}} onLoadedMetadata={metadata} onDurationChange={metadata} onEnded={()=>{setPlaying(false);setTime(audio.current?.duration??0);}} onError={()=>setError("音源を読み込めませんでした。再生ボタンから再試行してください。")}/>
 <p className={styles.error} role="status">{error}</p>
 <div className={styles.rows}>{songs.map((song,index)=>{const duration=durations[song.id]??song.duration;const position=active===song.id?time:0;return <article key={song.id} className={styles.row} data-playing={active===song.id&&playing}>
 <span className={styles.number}>{String(index+1).padStart(2,"0")}</span><Image className={styles.cover} src={base+song.cover} alt={`${song.title} カバー`} width={90} height={90} sizes="90px"/>
 <div className={styles.info}><h3>{song.title}</h3>{song.shortDescription&&<p>{song.shortDescription}</p>}{song.tags.length>0&&<ul className={styles.tags}>{song.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}<span className={styles.songId}>{song.id}</span></div>
 {song.album&&<span className={styles.album}>{song.album}</span>}
 <input className={styles.seek} type="range" min="0" max={duration||1} step="0.01" value={Math.min(position,duration||0)} disabled={!duration} aria-label={`${song.title}の再生位置`} aria-valuetext={`${formatTime(position)} / ${formatTime(Math.round(duration))}`} style={{"--progress":`${duration?Math.min(100,position/duration*100):0}%`} as CSSProperties} onChange={e=>seek(song,Number(e.target.value))}/>
 <div className={styles.playback}><span className={styles.duration}><span>{formatTime(position)}</span> / {formatTime(Math.round(duration))}</span><div className={styles.buttons}>
 <button type="button" aria-label={`${song.title}を再生`} disabled={active===song.id&&playing} onClick={()=>play(song)}><PlayerIcon kind="play"/></button><button type="button" aria-label={`${song.title}を一時停止`} disabled={active!==song.id||!playing} onClick={pause}><PlayerIcon kind="pause"/></button><button type="button" aria-label={`${song.title}を停止`} disabled={active!==song.id} onClick={stop}><PlayerIcon kind="stop"/></button></div></div>
 <div className={styles.links}><button type="button" onClick={e=>openModal(song,"lyrics",e.currentTarget)} aria-label={`${song.title}の歌詞`}>歌詞</button><button type="button" onClick={e=>openModal(song,"article",e.currentTarget)} aria-label={`${song.title}の楽曲紹介`}>楽曲紹介</button></div>
 </article>;})}</div>
 <dialog ref={dialog} className={`${styles.dialog} ${modal?.kind==="article"?styles.articleDialog:""}`} aria-labelledby="music-dialog-title" onCancel={()=>setModal(null)} onClose={()=>setModal(null)} onPointerDown={e=>{const r=e.currentTarget.getBoundingClientRect();backdropStart.current=e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;}} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();if(backdropStart.current&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))setModal(null);}}>
 <header><div><span>{modal?.kind==="article"?"ABOUT THE SONG":"LYRICS"}</span><h2 id="music-dialog-title">{modal?.kind==="lyrics"?modal.song.title:"楽曲紹介"}</h2></div><button type="button" autoFocus onClick={()=>setModal(null)}>閉じる ×</button></header>
 {content.loading?<p className={styles.modalStatus} role="status">読み込み中…</p>:content.error?<p className={styles.modalStatus} role="alert">{content.error}</p>:modal?.kind==="lyrics"?<div className={styles.lyrics}>{content.lyrics}</div>:modal&&<div className={styles.articleContent}><Image className={styles.detailCover} src={base+modal.song.cover} alt={`${modal.song.title} カバー`} width={700} height={700} sizes="(max-width:700px) 85vw, 520px"/><h2>{modal.song.title}</h2><p className={styles.caption}>{content.caption}</p><div className={styles.article}><MusicArticle text={content.article} id={modal.song.id}/></div></div>}
 </dialog>
 </>;
}
