import Link from "next/link";

const tools = [
  {
    title: "つらら 2D Viewer",
    description: "表情、まばたき、口パク、左右15度の向き差分を確認するための制作ビューアです。",
    href: "/tools/two-d-viewer",
    status: "MVP"
  },
  {
    title: "X Carousel Splitter",
    description: "横長画像を、Xのカルーセル投稿向けに2枚・4枚へブラウザ内だけで分割できるツールです。",
    href: "/tools/x-carousel-splitter",
    status: "公開中"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7fafb] px-6 py-8 text-[#243241]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3 border-b border-[#d9e4e7] pb-6">
          <p className="text-sm font-bold text-[#26677a]">Tsurara Studio</p>
          <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">
            制作用ワークスペース
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[#657987]">
            氷洞つららの制作素材と確認ツールをまとめるローカルスタジオです。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              className="group rounded-lg border border-[#d9e4e7] bg-white p-5 shadow-[0_18px_44px_rgba(59,88,98,0.10)] transition hover:-translate-y-0.5 hover:border-[#8faab2]"
              href={tool.href}
              key={tool.href}
            >
              <div className="mb-4 inline-flex rounded-md bg-[#e6f4f7] px-2.5 py-1 text-xs font-bold text-[#26677a]">
                {tool.status}
              </div>
              <h2 className="text-xl font-bold text-[#1f3442]">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#657987]">
                {tool.description}
              </p>
              <span className="mt-5 inline-flex text-sm font-bold text-[#26677a]">
                開く
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
