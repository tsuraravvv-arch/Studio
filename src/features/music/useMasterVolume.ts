"use client";
import {useMemo,useSyncExternalStore} from "react";
export const VOLUME_KEY="tsurara-studio.music.volume";
type Volume={volume:number;muted:boolean;previous:number};
const defaults:Volume={volume:.7,muted:false,previous:.7};
const initial=JSON.stringify(defaults);
let memory=initial;
let memoryOnly=false;
const listeners=new Set<()=>void>();
function subscribe(listener:()=>void){listeners.add(listener);window.addEventListener("storage",listener);return()=>{listeners.delete(listener);window.removeEventListener("storage",listener);};}
function snapshot(){if(memoryOnly)return memory;try{return localStorage.getItem(VOLUME_KEY)??memory;}catch{return memory;}}
export function useMasterVolume(){
 const raw=useSyncExternalStore(subscribe,snapshot,()=>initial);
 const value=useMemo(()=>{try{const s=JSON.parse(raw);if(s&&Number.isFinite(s.volume)&&s.volume>=0&&s.volume<=1)return {volume:s.volume,muted:s.muted===true,previous:Number.isFinite(s.previous)&&s.previous>0&&s.previous<=1?s.previous:.7} as Volume;}catch{}return defaults;},[raw]);
 function update(next:Volume){memory=JSON.stringify(next);try{localStorage.setItem(VOLUME_KEY,memory);}catch{memoryOnly=true;}listeners.forEach(listener=>listener());}
 return [value,update] as const;
}
