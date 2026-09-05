import Link from "next/link";
import { SnowflakeIcon } from "./icons";

export function SiteFooter() {
  return (
    <footer className="xcs-footer border-t border-[#e3edf0] bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-[#657987] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <SnowflakeIcon className="xcs-brand-snow" />
          <div>
            <p className="font-extrabold text-[#1f3442]">Tsurara Studio</p>
            <p className="text-xs text-[#8493a0]">Create, Explore, and Inspire.</p>
          </div>
        </div>

        <nav aria-label="フッターナビゲーション" className="flex flex-wrap gap-x-5 gap-y-1">
          <Link className="hover:text-[#26677a]" href="/">
            Home
          </Link>
        </nav>

        <p className="text-xs text-[#8493a0]">© Tsurara Studio</p>
      </div>
    </footer>
  );
}
