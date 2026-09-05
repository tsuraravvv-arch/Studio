import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./studio-home.module.css";

export const metadata: Metadata = {
  title: "Tsurara Studio — Create, Explore, and Inspire.",
  description: "氷洞つららのクリエイティブスタジオ。イラストや写真をもっと楽しむ、ブラウザで使える制作ツール。",
};

function Arrow({ className }: { className?: string }) {
  return <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Tsurara Studio ホーム">
          <span>Tsurara Studio<small>Create, Explore, and Inspire.</small></span>
        </Link>
        <nav aria-label="サイト内ナビゲーション">
          <Link href="/" aria-current="page">Home</Link>
          <a href="#tools">Tools</a>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="studio-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A LITTLE INSPIRATION, EVERY DAY</p>
            <h1 id="studio-title">つくるよろこびを、<br /><span>もっと自由に。</span></h1>
            <p className={styles.description}>お気に入りの1枚から、新しい表現へ。<br />創作を楽しむための、ちいさな道具箱。</p>
            <a className={styles.primaryLink} href="#tools">ツールを見つける<Arrow /></a>
          </div>
        </div>
          <div className={styles.heroArt}>
            <Image src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/assets/tsurara/studio-welcome.png"} alt="笑顔で手を振る氷洞つらら" width={1086} height={1448} sizes="(max-width: 700px) 100vw, 58vw" preload className={styles.portrait} />
          </div>
      </section>

      <section className={styles.tools} id="tools" aria-labelledby="tools-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>MADE FOR YOUR CREATIVITY</p><h2 id="tools-title">Tools<span>創作を、もう一歩先へ。</span></h2></div>
          <p>イラストや写真を楽しむための、<br />ブラウザで使えるツール。</p>
        </div>
        <Link className={styles.feature} href="/tools/x-carousel-splitter">
          <div className={styles.featureVisual} aria-hidden="true">
            <span className={styles.visualLabel}>ONE IMAGE. MORE POSSIBILITIES.</span>
            <div className={styles.slices}>
              {[0, 1, 2, 3].map((index) => <div className={styles.slice} key={index}><div><Image src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/assets/tsurara/carousel-hero.png"} alt="" width={1448} height={1086} sizes="(max-width: 700px) 360px, 600px" style={{ left: String(-index * 100) + "%" }} /></div><span>0{index + 1}</span></div>)}
            </div>
          </div>
          <div className={styles.featureCopy}>
            <p className={styles.toolCategory}><span />IMAGE TOOL <span className={styles.available}>公開中</span></p>
            <h3>X Carousel<br />Splitter</h3>
            <p className={styles.toolLead}>1枚の魅力を、つながる4枚に。</p>
            <p className={styles.toolDescription}>横長のイラストや写真を、X投稿用に2枚・4枚へ。構図を調整して、PNGで保存できます。</p>
            <ul className={styles.tags}><li>2分割 / 4分割</li><li>PNG保存</li><li>ブラウザで完結</li></ul>
            <span className={styles.openTool}>ツールを開く<Arrow /></span>
          </div>
        </Link>
      </section>

      <footer className={styles.footer}>
        <p>つくるよろこびを、ずっと。</p>
        <small>© Tsurara Studio</small>
      </footer>
    </main>
  );
}
