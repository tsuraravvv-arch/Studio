import type { SplitCount } from "../types";
import { SnowflakeIcon } from "./icons";

type PostingGuideProps = {
  splitCount: SplitCount;
};

export function PostingGuide({ splitCount }: PostingGuideProps) {
  const numbers = Array.from({ length: splitCount }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="flex flex-col gap-6 rounded-2xl border border-[#e3edf0] bg-gradient-to-br from-white to-[#eef8fb] p-6 sm:flex-row sm:items-center sm:gap-10 sm:p-8">
        <div className="flex-1">
          <h2 className="text-base font-extrabold text-[#1f3442]">
            Xへの投稿方法
          </h2>

          <div
            aria-label={`推奨投稿順: ${numbers.join(" → ")}`}
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            {numbers.map((number, index) => (
              <span className="flex items-center gap-2" key={number}>
                <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-[#26677a] px-3 text-lg font-extrabold text-white">
                  {number}
                </span>
                {index < numbers.length - 1 ? (
                  <span aria-hidden="true" className="text-lg text-[#8faab2]">
                    →
                  </span>
                ) : null}
              </span>
            ))}
          </div>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#5c7078]">
            分割した画像は、上の番号順でXへ添付してください。
            左から順番に並べることで、1枚の横長イラストのようにつながって表示されます。
          </p>
        </div>

        <div
          aria-hidden="true"
          className="hidden w-20 flex-none items-center justify-center self-stretch rounded-xl bg-white/60 sm:flex"
        >
          <SnowflakeIcon className="h-6 w-6 text-[#9fd2e2]" />
        </div>
      </div>
    </section>
  );
}
