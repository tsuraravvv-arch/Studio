import Image from "next/image";
import Link from "next/link";
import { SnowflakeIcon } from "./icons";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-8">
      <nav aria-label="パンくずリスト" className="mb-5 flex items-center gap-1.5 text-xs text-[#7a8b94]">
        <Link className="hover:text-[#26677a]" href="/">
          Home
        </Link>
        <span aria-hidden="true">›</span>
        <Link className="hover:text-[#26677a]" href="/">
          Tools
        </Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="font-bold text-[#4a5c66]">
          X Carousel Splitter
        </span>
      </nav>

      <div className="relative grid gap-8 overflow-hidden rounded-3xl border border-[#e3edf0] bg-gradient-to-br from-white via-[#f2fafc] to-[#eef0fb] px-6 py-10 shadow-[0_20px_60px_rgba(59,88,98,0.10)] sm:px-10 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#cdeaf3] opacity-60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#e3ddf7] opacity-60 blur-3xl"
        />

        <div className="relative flex flex-col gap-4">
          <p className="text-sm font-extrabold tracking-wide text-[#26677a]">
            Tsurara Studio Tools
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-[#1f3442] sm:text-5xl">
            X Carousel Splitter
          </h1>
          <p className="text-lg font-bold text-[#3a4c57]">
            横長画像を、X投稿用に分割しよう。
          </p>
          <p className="max-w-xl text-sm leading-7 text-[#657987]">
            1枚のイラストや写真から、X（Twitter）のカルーセル投稿向けに
            2枚・4枚の画像へ分割できます。好きな構図で切り出して、
            もっと魅力的にシェアしよう。
          </p>
        </div>

        <div className="relative mx-auto flex h-64 w-full max-w-xs items-end justify-center sm:h-80 lg:h-96 lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute inset-x-4 bottom-2 top-6 rounded-[40px] bg-gradient-to-b from-white/70 to-[#dff1f6]/70"
          />
          <SnowflakeIcon className="absolute left-2 top-2 h-6 w-6 text-[#9fd2e2] opacity-70" />
          <SnowflakeIcon className="absolute right-6 top-10 h-4 w-4 text-[#c9bdf0] opacity-70" />
          <SnowflakeIcon className="absolute bottom-8 left-6 h-5 w-5 text-[#9fd2e2] opacity-60" />
          <Image
            alt="氷洞つらら"
            className="relative h-full w-auto object-contain drop-shadow-[0_18px_30px_rgba(59,88,98,0.22)]"
            height={1448}
            priority
            src="/assets/tsurara/expressions/tsurara_front_softsmile.png"
            width={1086}
          />
        </div>
      </div>
    </section>
  );
}
