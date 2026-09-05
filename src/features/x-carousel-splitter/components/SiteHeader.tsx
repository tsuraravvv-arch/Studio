import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Idea Lab", href: null },
  { label: "Tools", href: "/", active: true },
  { label: "Gallery", href: null },
  { label: "About", href: null }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#e3edf0] bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          className="flex items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgba(63,128,146,0.35)]"
          href="/"
        >
          <span aria-hidden="true" className="text-xl">
            ❄️
          </span>
          <span className="text-lg font-extrabold text-[#1f3442]">
            Tsurara Studio
          </span>
        </Link>

        <nav aria-label="サイト内ナビゲーション" className="hidden items-center gap-6 sm:flex">
          {navItems.map((item) =>
            item.href ? (
              <Link
                aria-current={item.active ? "page" : undefined}
                className={`rounded-sm text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[rgba(63,128,146,0.35)] ${
                  item.active
                    ? "text-[#26677a]"
                    : "text-[#5c7078] hover:text-[#26677a]"
                }`}
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="cursor-default text-sm font-bold text-[#aebac0]"
                key={item.label}
                title="準備中"
              >
                {item.label}
              </span>
            )
          )}
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
