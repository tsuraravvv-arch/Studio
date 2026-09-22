import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown, { defaultUrlTransform } from "react-markdown";
import { songs, readMusicText, isPreparing } from "../../../features/music/data";
import { StudioHeader, StudioFooter } from "../../../features/studio/StudioChrome";
import { studioFonts } from "../../../features/studio/studio-fonts";
import studio from "../../studio-home.module.css";
import styles from "../../../features/music/music.module.css";
export const dynamicParams=false;
export function generateStaticParams(){return songs.map(song=>({id:song.id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const {id}=await params;return {title:`${songs.find(song=>song.id===id)?.title??"Music"} | Tsurara Studio`};}
export default async function SongPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const song=songs.find(song=>song.id===id);if(!song)notFound();
 const [caption,article]=await Promise.all([readMusicText(song.caption),readMusicText(song.article)]);
 const base=process.env.NEXT_PUBLIC_BASE_PATH??"";
 function articleUrl(url:string){const safe=defaultUrlTransform(url);if(!safe)return "";if(/^(https?:|mailto:|#)/i.test(safe))return safe;if(safe.startsWith("/"))return base+safe;return `${base}/assets/music/articles/${song!.id}/${safe}`;}
 return <div className={`${studio.page} ${studioFonts}`}><StudioHeader/><main id="main" className={styles.detailPage}><Link className={styles.back} href="/music/">← Music List</Link><div className={styles.detailHeader}><Image className={styles.detailCover} src={base+song.cover} alt={`${song.title} カバー`} width={700} height={700} sizes="(max-width:700px) 88vw, 520px" preload/><h1>{song.title}</h1><p className={styles.caption}>{caption}</p></div><div className={styles.article}>{isPreparing(article)?<><h2>楽曲について</h2><p>楽曲紹介は準備中です。</p></>:<Markdown skipHtml urlTransform={articleUrl}>{article}</Markdown>}</div></main><StudioFooter/></div>;
}
