import Image from "next/image";
import Link from "next/link";
import { SnowflakeIcon } from "./icons";

export function Hero() {
  return (
    <section className="xcs-hero">
      <div className="xcs-hero-inner">
        <nav aria-label="パンくずリスト" className="xcs-breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">›</span>
          <span aria-current="page">X Carousel Splitter</span>
        </nav>
        <div className="xcs-hero-copy">
          <p className="xcs-eyebrow">TSURARA STUDIO / CREATIVE TOOLS</p>
          <h1>X Carousel<br />Splitter<span className="xcs-title-dot">.</span></h1>
          <p className="xcs-hero-subtitle">横長画像を、X投稿用に分割しよう。</p>
          <p className="xcs-hero-description">
            1枚のイラストや写真から、2枚・4枚の画像へ。<br />
            好きな構図で切り出して、<br className="sm:hidden" />もっと魅力的にシェアしよう。
          </p>
          <span className="xcs-hero-caption">Split your story. Share more moments.</span>
        </div>
        <div className="xcs-hero-art">
          <div className="xcs-hero-panels" role="img" aria-label="氷洞つららのイラストを4枚に分割して斜めに並べたプレビュー">
            {[0, 1, 2, 3].map((index) => (
              <div className="xcs-hero-panel" key={index}>
                <div className="xcs-hero-panel-crop">
                  <Image
                    alt=""
                    aria-hidden="true"
                    width={1448}
                    height={1086}
                    sizes="(max-width: 639px) 360px, 640px"
                    preload
                    src="/assets/tsurara/carousel-hero.png"
                    style={{ left: String(-index * 100) + "%" }}
                  />
                </div>
                <span aria-hidden="true">0{index + 1}</span>
              </div>
            ))}
          </div>
          <SnowflakeIcon className="xcs-snow xcs-snow-one" />
          <SnowflakeIcon className="xcs-snow xcs-snow-two" />
          <SnowflakeIcon className="xcs-snow xcs-snow-three" />
        </div>
      </div>
    </section>
  );
}
