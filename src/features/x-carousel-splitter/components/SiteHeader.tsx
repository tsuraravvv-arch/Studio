import Link from "next/link";
import { SnowflakeIcon } from "./icons";

export function SiteHeader() {
  return (
    <header className="xcs-header sticky top-0 z-20 border-b border-[#e3edf0] bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          className="flex items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgba(63,128,146,0.35)]"
          href="/"
        >
          <SnowflakeIcon className="xcs-brand-snow" />
          <span className="xcs-brand">Tsurara Studio<small>Create, Explore, and Inspire.</small></span>
        </Link>

        <nav aria-label="サイト内ナビゲーション" className="hidden items-center gap-6 sm:flex">
          <Link
            className="rounded-sm text-sm font-bold text-[#5c7078] transition-colors hover:text-[#26677a] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgba(63,128,146,0.35)]"
            href="/"
          >
            Home
          </Link>
        </nav>

        <Link
          className="rounded-full border border-[#8faab2] px-4 py-2 text-sm font-bold text-[#26677a] transition hover:bg-[#e6f4f7] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgba(63,128,146,0.35)]"
          href="/"
        >
          Studio Topへ
        </Link>
      </div>
    </header>
  );
}
