import { studioFonts } from "../../features/studio/studio-fonts";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { StudioHeader, StudioFooter } from "../../features/studio/StudioChrome";
import studio from "../studio-home.module.css";
import styles from "./tools.module.css";

export const metadata: Metadata = { title: "Tools | Tsurara Studio", description: "イラスト・画像などの制作を、ブラウザで手軽にサポートするツールをまとめています。" };
// Add released tools here. Each entry becomes one full-width introduction card.
const tools = [{
  id: "x-carousel-splitter", title: "X Carousel Splitter", href: "/tools/x-carousel-splitter/",
  category: "IMAGE TOOL", image: "/assets/tsurara/carousel-hero.png",
  description: "横長のイラストや写真を、X投稿用に2枚・4枚へ分割できるブラウザツールです。構図や拡大率を調整し、PNGで保存できます。",
  tags: ["2分割 / 4分割", "PNG保存", "ブラウザで完結"],
}, {
  id: "crop-studio", title: "Crop Studio", href: "/tools/crop-studio/",
  category: "IMAGE TOOL", image: "/assets/hero/tools/crop-studio-hero.png",
  description: "SNSテンプレートや自由なサイズに画像を切り抜くブラウザツールです。位置・拡大率・回転を調整し、PNG・JPEG・WebPで保存できます。",
  tags: ["SNSテンプレート", "回転 / 反転", "ブラウザで完結"],
}];
export default function ToolsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const mask = { "--drip": `url("${base}/assets/ui/hero-drip-desktop.svg")`, "--drip-mobile": `url("${base}/assets/ui/hero-drip-mobile.svg")` } as CSSProperties;
  return <div className={`${studio.page} ${studioFonts}`}>
    <StudioHeader />
    <main id="main">
      <section className={styles.hero} style={mask} aria-labelledby="tools-title">
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="パンくずリスト"><Link href="/">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Tools</span></nav>
          <div className={styles.heroCopy}><p className={styles.eyebrow}>TSURARA STUDIO / CREATIVE TOOLS</p><h1 id="tools-title">Tools<span aria-hidden="true">✧</span></h1><p className={styles.lead}>創作を、もっと楽しく、もっと便利に。</p><p className={styles.description}>イラスト・画像などの制作を、<br />ブラウザで手軽にサポートするツールをまとめています。</p></div>
          <Image className={styles.heroArt} src={`${base}/assets/cards/tools.png`} alt="制作のためのタブレットと、光が差し込むアトリエ" width={1600} height={1001} sizes="(max-width: 700px) 100vw, 55vw" preload />
        </div>
      </section>
      <section className={styles.list} aria-labelledby="tools-list-title">
        <div className={styles.sectionHeading}><div><h2 id="tools-list-title">Tools List</h2><p>制作に役立つツールを紹介します。</p></div><span>{String(tools.length).padStart(2,"0")} TOOL{tools.length === 1 ? "" : "S"}</span></div>
        <div className={styles.catalog}>{tools.map(tool => <article className={styles.card} key={tool.id}>
          <figure className={styles.preview}>
            <div className={styles.previewLabel}><span>{tool.id === "crop-studio" ? "CROP PREVIEW" : "CAROUSEL PREVIEW"}</span><span aria-hidden="true">✧</span></div>
            {tool.id === "crop-studio" ? <div className={styles.cropPreview}><Image src={`${base}${tool.image}`} width={1536} height={1024} alt="Crop Studio のイメージビジュアル" sizes="(max-width: 700px) 90vw, 600px" /><span>16:9 / 1280 × 720</span></div> : <div className={styles.panels} role="img" aria-label="氷洞つららのイラストを4枚に分割した見本">{[0,1,2,3].map(i => <div key={i} className={styles.panel}><div className={styles.crop}><Image src={`${base}${tool.image}`} width={1448} height={1086} alt="" sizes="(max-width: 700px) 90vw, 600px" style={{left:`${-i*100}%`}} /></div><span>0{i+1}</span></div>)}</div>}
            <figcaption>{tool.id === "crop-studio" ? "好きな構図を、ぴったりのサイズに" : "4分割のイメージ"}</figcaption>
          </figure>
          <div className={styles.cardBody}><p className={styles.eyebrow}>{tool.category}<span className={styles.status}>公開中</span></p><h3>{tool.title}</h3><p className={styles.detail}>{tool.description}</p><ul className={styles.tags}>{tool.tags.map(tag => <li key={tag}>{tag}</li>)}</ul><Link className={styles.cta} href={tool.href}>ツールを開く<span aria-hidden="true">→</span></Link></div>
        </article>)}</div>
      </section>
    </main><StudioFooter />
  </div>;
}
