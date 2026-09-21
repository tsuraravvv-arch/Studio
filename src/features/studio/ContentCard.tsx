"use client";
import Link from "next/link";
import type { PointerEvent } from "react";
import Image from "next/image";
import styles from "../../app/studio-home.module.css";
type Props = { title: string; description: string; href: string; kind: string; label: string; external?: boolean };
function CardVisual({ kind }: { kind: string }) {
  const filename = kind === "ideas" ? "idea-lab" : kind;
  return <div className={styles.visual} aria-hidden="true">
    <Image className={styles.thumbnail} src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/assets/cards/${filename}.png`} alt="" width={1600} height={1001} sizes="(max-width: 700px) 88vw, (max-width: 1099px) 45vw, 300px" />
  </div>;
}
export function ContentCard({ title, description, href, kind, label, external }: Props) {
  function highlight(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
  }
  const body = <><CardVisual kind={kind} /><div className={styles.cardBody}><span className={styles.cardLabel}>{label}</span><h3>{title}</h3><p>{description}</p><span className={styles.open}>Open <span className={styles.arrow} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"><path d={external ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"} /></svg></span>{external && <span className={styles.srOnly}>（新しいタブで開く）</span>}</span></div></>;
  const props = { className: styles.card, onPointerMove: highlight };
  return href.startsWith("/") ? <Link {...props} href={href} prefetch={false}>{body}</Link> : <a {...props} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>{body}</a>;
}
