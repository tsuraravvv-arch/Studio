import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e3edf0] bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-[#657987] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span aria-hidden="true">❄️</span>
          <div>
            <p className="font-extrabold text-[#1f3442]">Tsurara Studio</p>
            <p className="text-xs text-[#8493a0]">Create, Explore, and Inspire.</p>
          </div>
        </div>

        <nav aria-label="フッターナビゲーション" className="flex flex-wrap gap-x-5 gap-y-1">
          <Link className="hover:text-[#26677a]" href="/">
            Home
          </Link>
          <span className="text-[#c3cdd2]">Idea Lab</span>
          <Link className="hover:text-[#26677a]" href="/">
            Tools
          </Link>
          <span className="text-[#c3cdd2]">About</span>
        </nav>

        <p className="text-xs text-[#8493a0]">© Tsurara Studio</p>
      </div>
    </footer>
  );
}
