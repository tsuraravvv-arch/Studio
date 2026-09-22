"use client";
import {useEffect,useRef,useState} from "react";
import {PlayerIcon} from "./PlayerIcon";
import styles from "./music.module.css";
export function MasterVolume({volume,muted,onVolume,onMute}:{volume:number;muted:boolean;onVolume:(n:number)=>void;onMute:()=>void}){
 const [open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);const slider=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(!open)return;slider.current?.focus();
 const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};
 const escape=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);trigger.current?.focus();}};
 document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
 return ()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};
 },[open]);
 const silent=muted||volume===0;
 return <div ref={root} className={styles.volume}><button ref={trigger} type="button" aria-label={silent?"マスター音量（ミュート中）":"マスター音量"} aria-expanded={open} aria-controls="master-volume-panel" onClick={()=>setOpen(v=>!v)}><PlayerIcon kind={silent?"mute":"speaker"}/></button>{open&&<div id="master-volume-panel" className={styles.volumePanel} role="group" aria-label="マスター音量設定"><div><button type="button" onClick={onMute} aria-label={silent?"ミュート解除":"ミュート"} aria-pressed={silent}><PlayerIcon kind={silent?"mute":"speaker"}/></button><input ref={slider} type="range" min="0" max="1" step="0.01" value={muted?0:volume} style={{background:`linear-gradient(to right, #779ebc ${(muted?0:volume)*100}%, #e7eef5 ${(muted?0:volume)*100}%)`}} aria-label="マスター音量" aria-valuetext={`${Math.round((muted?0:volume)*100)}%`} onChange={e=>onVolume(Number(e.target.value))}/></div><output>{Math.round((muted?0:volume)*100)}%</output></div>}</div>;
}
