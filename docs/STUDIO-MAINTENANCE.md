# Tsurara Studio の更新

## 公開構成

編集元は `src/app` / `src/features/studio`。`npm run build:pages` が既存の Next.js 静的書き出しを `/Studio` ベースパスで生成し、`docs/` にコピーします。GitHub Actions も `docs/` を公開します。生成HTML/CSS/JSを直接編集しないでください。

`docs/assets/hero/` の原画と `docs/design/` はそのまま保持します。書き出しは既存ファイルを削除しません。`public/assets/hero/`, `public/assets/cards/`, `public/assets/ui/`, `public/assets/community/` は開発・ビルド時の自動コピーです。

`node scripts/preview-pages.mjs` で http://localhost:4173/Studio/ を確認できます。

## 季節のHero変更

1. `docs/assets/hero/` に画像を配置（PC・モバイル共通）。
2. `src/features/studio/hero-theme.ts` で画像パス・サイズ・代替テキスト・見出し・英語コピー・テーマ名を変更。
3. `src/features/studio/seasonal-hero.module.css` の `SEASONAL THEME` にテーマのフォント・色・画像位置・ベールを設定。モバイルの画像位置も確認。
4. `npm run build:pages` を実行し、PCとモバイルで顔・コピー・曲線境界を確認。

Heroの高さ・コピー領域は `FIXED GEOMETRY`。固定UIは `src/app/studio-home.module.css`。テーマ変更時は固定UIを変更しません。

Heroフォントは `SeasonalHero.tsx` の `next/font` 定義（Zen Old Mincho / Playfair Display Italic）とHero専用CSS変数で管理。固定UIは `studio-fonts.ts` のLora（英字見出し）/ Lato（欧文本文）/ Noto Sans JP（日本語本文）です。Heroとは独立しています。ビルド時にGoogle Fontsから取得し、公開時は同じサイト内から配信します。新規ビルド時はネットワーク接続が必要です。

drip境界は `docs/assets/ui/hero-drip-desktop.svg` と `hero-drip-mobile.svg` で管理します。`seasonal-hero.module.css` の固定マスク設定がHero自身を切り抜き、画像の色・模様を滴の先端まで残します。白い前景装飾は使用しません。下端は大きな高低差を持つ非対称の曲線に、大小の丸い滴を組み込んでいます。PCは高さ210px、モバイルは140pxの領域に別形状を配置します。上部の矩形マスクと下端SVGを1px重ね、継ぎ目を防ぎます。Hero画像の差し替え時にマスクを変更する必要はありません。Contents上余白はPC 14px / Mobile 10pxで、滴の直下へつなぎます。

カード画像は `docs/assets/cards/{idea-lab,tarot,tools,music}.png`。`ContentCard.tsx` で対応付け、同じ1.85:1の比率・object-fit: cover・上寄せで表示します。原画は変更しません。FooterのSNSは `StudioChrome.tsx` のラベル付きSVGリンクです。

## コンテンツとリンク

- トップのカード: `src/app/page.tsx` の `contents` 配列。5枚目以降も同じカードとauto-fit Gridで追加できます。
- Header / Footer / Community: `src/features/studio/StudioChrome.tsx`。Communityは指定画像と「動画生成AI研究＆交流コミュニティ」を表示。画像原本は `docs/assets/community/video-ai-community.png`。URL未確定のためリンクなし。決定後は `communityLinks` の項目に `href` を追加。
- Tools: `src/app/tools/page.tsx`。既存 `/tools/x-carousel-splitter/` への入口。
- Music: `src/app/music/page.tsx`。6曲の再生一覧と `/music/[id]/` 詳細。楽曲更新は `MUSIC-MAINTENANCE.md` を参照。
- Idea Labは同一タブ。Tarotは `noopener noreferrer` 付きの新規タブ。

既存のX Carousel Splitterと2D Viewerの実装は維持しています。末尾スラッシュ付きの `index.html` 書き出しで、GitHub Pages上の直接アクセスにも対応します。

## Toolsポータル（2026-09-21）

- 編集元: `src/app/tools/page.tsx`。専用CSS: `src/app/tools/tools.module.css`。
- 公開出力: `docs/tools/index.html`、URL `/Studio/tools/`。
- `tools` 配列に公開済みツールの情報を追加すると、紹介カードが縦に増えます。現在はX Carousel Splitterのみ。
- Hero画像は `docs/assets/cards/tools.png`、紹介画像は既存の `public/assets/tsurara/carousel-hero.png`（公開時 `docs/assets/tsurara/carousel-hero.png`）。新規画像なし。
- 共通Header/Footer/フォントを再利用。トップのHeroや既存ツール本体は変更しません。
