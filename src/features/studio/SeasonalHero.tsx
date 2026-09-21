import Image from "next/image";
import { Zen_Old_Mincho, Playfair_Display } from "next/font/google";
import type { CSSProperties } from "react";
import { heroTheme } from "./hero-theme";
import styles from "./seasonal-hero.module.css";
const japanese = Zen_Old_Mincho({ weight: "500", preload: false, display: "swap", variable: "--font-hero-japanese" });
const english = Playfair_Display({ subsets: ["latin"], weight: "400", style: "italic", display: "swap", variable: "--font-hero-english" });
export function SeasonalHero() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const maskAssets = { "--drip-desktop": `url("${base}/assets/ui/hero-drip-desktop.svg")`, "--drip-mobile": `url("${base}/assets/ui/hero-drip-mobile.svg")` } as CSSProperties;
  return <section className={`${styles.hero} ${japanese.variable} ${english.variable}`} style={maskAssets} data-theme={heroTheme.name} aria-labelledby="studio-title">
    <Image className={styles.image} src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + heroTheme.image} alt={heroTheme.alt} width={heroTheme.width} height={heroTheme.height} sizes="100vw" preload />
    <div className={styles.veil} />
    <div className={styles.copy}><h1 id="studio-title">{heroTheme.headline.map((line) => <span key={line}>{line}</span>)}</h1><p lang="en">{heroTheme.subtitle}</p></div>
  </section>;
}
