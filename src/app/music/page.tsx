import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StudioHeader, StudioFooter } from "../../features/studio/StudioChrome";
import { studioFonts } from "../../features/studio/studio-fonts";
import { getSongs } from "../../features/music/data";
import { MusicPlayer } from "../../features/music/MusicPlayer";
import studio from "../studio-home.module.css";
import styles from "../../features/music/music.module.css";
export const metadata: Metadata = { title:"Music | Tsurara Studio",description:"氷洞つららのオリジナル楽曲。" };
export default async function MusicPage(){
 const songs=await getSongs();const base=process.env.NEXT_PUBLIC_BASE_PATH??"";
 return <div className={`${studio.page} ${studioFonts}`}><StudioHeader/><main id="main">
 <section className={styles.hero} aria-labelledby="music-title"><div className={styles.heroInner}><nav className={styles.breadcrumb} aria-label="パンくずリスト"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Music</span></nav><div className={styles.heroCopy}><span className={styles.eyebrow}>TSURARA STUDIO / ORIGINAL MUSIC</span><h1 id="music-title">Music<span aria-hidden="true">♬</span></h1><p>氷洞つららのオリジナル楽曲</p></div><Image className={styles.heroArt} src={`${base}/assets/music/hero/hero-music.png`} alt="ヘッドホンを着け、マイクに向かって歌う氷洞つらら" width={1600} height={1000} sizes="(max-width:700px) 100vw, 70vw" preload/></div>
 <svg className={styles.staff} viewBox="0 0 1440 110" preserveAspectRatio="none" fill="none" aria-hidden="true">{[0,1,2,3,4].map(i=><path key={i} d={`M-10 ${40+i*9} C260 ${-20+i*9} 440 ${100+i*9} 740 ${46+i*9} S1190 ${18+i*9} 1450 ${52+i*9}`} stroke="currentColor" strokeWidth="1"/>)}<g fill="currentColor"><ellipse cx="280" cy="44" rx="7" ry="5" transform="rotate(-20 280 44)"/><path d="M286 44V15h2v29Z"/><ellipse cx="1060" cy="55" rx="7" ry="5" transform="rotate(-20 1060 55)"/><path d="M1066 55V25h2v30Z"/></g></svg></section>
 <section className={styles.list} aria-labelledby="music-list-title"><MusicPlayer songs={songs}/></section>
 </main><StudioFooter/></div>;
}
