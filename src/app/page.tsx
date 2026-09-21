import { studioFonts } from "../features/studio/studio-fonts";
import type { Metadata } from "next";
import { StudioHeader, StudioFooter } from "../features/studio/StudioChrome";
import { SeasonalHero } from "../features/studio/SeasonalHero";
import { ContentCard } from "../features/studio/ContentCard";
import styles from "./studio-home.module.css";

export const metadata: Metadata = {
  title: "Tsurara Studio — 氷洞つららのクリエイティブスタジオ",
  description: "Idea Lab、Tarot、Tools、Music。氷洞つららの制作物・ツール・コンテンツへの入口。",
};
const contents = [
  { title: "Idea Lab", description: "画像生成プロンプト・トレンド・記事", href: "https://tsuraravvv-arch.github.io/news/", kind: "ideas", label: "IDEAS & INSPIRATION" },
  { title: "Tarot", description: "1枚引き・3枚引きのタロット占い", href: "https://tsuraravvv-arch.github.io/tarot/", kind: "tarot", label: "A MOMENT FOR YOURSELF", external: true },
  { title: "Tools", description: "ブラウザで使える制作支援ツール", href: "/tools/", kind: "tools", label: "MAKE SOMETHING NEW" },
  { title: "Music", description: "氷洞つららのオリジナル楽曲", href: "/music/", kind: "music", label: "SOUNDS & STORIES" },
] as const;
export default function Home() {
  return <div className={`${styles.page} ${studioFonts}`}>
    <StudioHeader home />
    <main id="main">
      <SeasonalHero />
      <section className={styles.contents} id="contents" aria-labelledby="contents-title">
        <h2 id="contents-title">Contents<span aria-hidden="true">✦</span></h2>
        <div className={styles.grid}>{contents.map((content) => <ContentCard key={content.title} {...content} />)}</div>
      </section>
      <section className={styles.about} id="about" aria-labelledby="about-title">
        <div><span className={styles.eyebrow}>A LITTLE ABOUT US</span><h2 id="about-title">About Studio</h2></div>
        <p>Tsurara Studioは、氷洞つららのクリエイティブスタジオ。<br />Idea Lab、Tarot、Tools、Musicなど、<br className={styles.mobileBreak} />制作物・ツール・コンテンツへの入口です。</p>
        <span className={styles.aboutStar} aria-hidden="true">✧</span>
      </section>
    </main>
    <StudioFooter />
  </div>;
}
