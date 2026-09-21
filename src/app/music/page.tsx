import { studioFonts } from "../../features/studio/studio-fonts";
import type { Metadata } from "next";
import Link from "next/link";
import { StudioHeader, StudioFooter } from "../../features/studio/StudioChrome";
import styles from "../studio-home.module.css";
export const metadata: Metadata = { title: "Music | Tsurara Studio", description: "氷洞つららのオリジナル楽曲。" };
export default function MusicPage() {
  return <div className={`${styles.page} ${studioFonts}`}><StudioHeader /><main className={styles.subpage} id="main"><Link className={styles.back} href="/">← Studio Home</Link><h1>Music</h1><p>氷洞つららのオリジナル楽曲</p><div className={styles.comingSoon}><p>Coming soon</p><p>ただいま準備中です。</p></div></main><StudioFooter /></div>;
}
