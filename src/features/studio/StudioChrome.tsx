import Link from "next/link";
import Image from "next/image";
import styles from "../../app/studio-home.module.css";
export function StudioHeader({ home = false }: { home?: boolean }) {
  return <>
    <a className={styles.skip} href="#main">本文へスキップ</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Tsurara Studio ホーム"><span className={styles.brandMark} aria-hidden="true">✳</span><span>Tsurara <b>Studio</b><small>CHARACTER & CREATIVE</small></span></Link>
      <nav aria-label="メインナビゲーション">
        <Link href="/" aria-current={home ? "page" : undefined}>Home</Link>
        <Link href={home ? "#contents" : "/#contents"}>Contents</Link>
        <Link href={home ? "#about" : "/#about"}>About</Link>
      </nav>
      <a className={styles.headerCta} href="https://tsuraravvv-arch.github.io/news/">Idea Lab <span aria-hidden="true">↗</span></a>
    </header>
  </>;
}
// Add real community destinations here when available.
const communityLinks: { label: string; image: string; href?: string }[] = [
  { label: "動画生成AI研究＆交流コミュニティ", image: "/assets/community/video-ai-community.png" },
];
export function StudioFooter() {
  return <footer className={styles.footer}>
    <div className={styles.footerBrand}>Tsurara Studio<small>© {new Date().getFullYear()} Tsurara Studio</small></div>
    <div><h2>Community</h2>{communityLinks.map((community) => {
      const content = <><Image src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + community.image} alt="" width={160} height={160} sizes="44px" /><span>{community.label}</span></>;
      return community.href ? <a className={styles.community} key={community.label} href={community.href}>{content}</a> : <div className={styles.community} key={community.label}>{content}</div>;
    })}</div>
    <div><h2>SNS</h2><div className={styles.socials}>
      <a href="https://x.com/trr_vvv" target="_blank" rel="noopener noreferrer" aria-label="X（新しいタブで開く）" title="X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l10 16h-4L5 4ZM19 4l-6.5 7M5 20l6.5-7" /></svg></a>
      <a href="https://www.youtube.com/@%E6%B0%B7%E6%B4%9E%E3%81%A4%E3%82%89%E3%82%89" target="_blank" rel="noopener noreferrer" aria-label="YouTube（新しいタブで開く）" title="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="4" /><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" /></svg></a>
    </div></div>
  </footer>;
}
