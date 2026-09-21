# Studioリニューアル確認記録

## 境界の抑揚・滴・余白の再調整（2026-09-20）

- 変更: docs/assets/ui/hero-drip-desktop.svg、hero-drip-mobile.svg、src/features/studio/seasonal-hero.module.css、src/app/studio-home.module.css、運用ガイド・本記録。公開用docs/を再生成。
- ベジェ曲線を作り直し、大きなうねりに幅と深さのある丸い滴を組み込んだ。Hero自体へのCSS maskを維持し、原画の色を先端まで表示。マスク領域はPC 150→210px / Mobile 110→140px。Heroの高さ・画像・コピーは維持。
- Contents上paddingをPC 46→14px / Mobile 28→10pxに変更。カード配置・他セクション・リンクは変更なし。
- PC 1440×1000 / Mobile 390×844を目視確認。顔・コピー・画像の滴・見出しの間隔が良好。モバイルの横はみ出しなし。全画像読み込み完了、Console Error/Warningなし。
- npm run build:pages成功（TypeScript・静的出力）。今回ロジック・リンク変更なし。

## 有機的drip・固定UIフォント・Community調整（2026-09-20）

- 変更: src/features/studio/studio-fonts.ts、StudioChrome.tsx、seasonal-hero.module.css、src/app/studio-home.module.css、docs/assets/ui/hero-drip-desktop.svg、hero-drip-mobile.svg、scripts/prepare-hero.mjs、.gitignore、運用ガイド・本記録。公開用docs/を再生成。
- Hero自身へのCSS maskを維持し、水平な下辺を廃止。大きな上下差のある非対称のベジェ曲線と、流れに沿った大小の丸い滴へ全面更新。PC用150px / Mobile用110pxの独立マスクで顔とコピーを維持。
- 固定UI: Loraを英字見出し・カードタイトル・ブランドへ、Lato + Noto Sans JPを本文・Navigationへ適用。next/fontで実ファイルを同一サイト配信。ブラウザで3書体のdocument.fonts.check=true、読み込み完了・計算済みfont-familyを確認。HeroのZen Old Mincho / Playfair Displayは変更なし。
- SNS: Xを落ち着いた青、YouTubeをローズ系へ。既存サイズ・リンク・target/rel維持。
- Community: 提供画像を44px角丸サムネイルで表示し、指定名称を追加。URLなしのためリンクなし。将来hrefを設定可能。
- npm run build:pages（TypeScript・全7ルート静的出力）成功。変更対象ESLint成功、git diff --checkに空白エラーなし。
- PC 1440×1000 / Mobile 390×844でHero・曲線・カード・About・Footerを目視確認。画像6枚の正常読み込み、モバイル横はみ出しなし、Console Error/Warningなし。
- Idea Lab/Tarot/SNSのURLとtarget/relをDOMで確認。Tools→SplitterとMusicへの内部遷移を実操作確認。Splitterの2分割選択で出力幅1920への更新を確認。既存ツール実装は変更なし（画像の分割書き出しの再試験は未実施）。
- 以下は過去の調整記録。現行仕様は本節と運用ガイドを参照。

## カード画像・Heroマスク・SNS調整（2026-09-20）

- 変更: `src/features/studio/ContentCard.tsx`, `SeasonalHero.tsx`, `seasonal-hero.module.css`, `StudioChrome.tsx`, `src/app/studio-home.module.css`, `scripts/prepare-hero.mjs`, `.gitignore`、本記録と運用ガイド。公開用 `docs/` を再生成。
- 追加: `docs/assets/ui/hero-drip-desktop.svg`, `hero-drip-mobile.svg`。
- 撤去: 旧白い境界の `CreamEdge.tsx`, `cream-edge.module.css`、旧線画の `ContentIllustration.tsx`。
- カードは指定の4枚のPNGをそのまま参照。すべて1600×1001、同じ比率1.85:1、上寄せcover、角丸、遅延読み込み。文字はサムネイル外に維持。
- HeroはZen Old Mincho 500 / Playfair Display Italic 400へ変更。next/fontで実フォントを取得・同一サイト配信。ブラウザでdocument.fonts.status=loaded、日本語全文・英語全文を指定したdocument.fonts.checkが両方true、見出しの計算済みfont-familyも確認。
- Hero自身にCSS mask-imageを適用。上部の矩形＋下部の非対称SVG滴形状で、原画の色が滴の先端まで残る。白い重ね形・影は撤去。モバイルは幅を確保した専用マスク。
- FooterのSNSは38pxの丸い装飾ボタンとX/再生SVG。既存URL・target/relを維持し、aria-labelでリンク名・新規タブを明示。
- 本番ビルド・TypeScript・変更ファイルのESLint成功。PC 1440×1000で4カード・Footer、Mobile 390×844でHero・顔・文字・滴・カードを確認。横はみ出しなし。
- 4枚の画像の対応と読み込みをDOM・目視で確認。既存リンク先とタブ指定をDOMで確認。Toolsカード→Tools→既存Splitterの操作・表示確認。既存ツール本体の変更なし。Console Error/Warningなし。
- アセット注意: 提供されたidea-lab.pngは厳密なPNGデコードで末尾の読み取りエラーが発生。原画は変更せず、現在のトリミング範囲ではブラウザ表示良好。ただし元ファイルの完全な再書き出しを推奨。
- 以下は過去の調整記録。現行仕様は本節と運用ガイドを参照。

## 追加調整（2026-09-20）

- 変更: `src/app/page.tsx`, `src/app/tools/page.tsx`, `src/app/music/page.tsx`（固定フォントの適用のみ）、`src/app/studio-home.module.css`, `src/features/studio/SeasonalHero.tsx`, `src/features/studio/seasonal-hero.module.css`, `src/features/studio/ContentCard.tsx`。
- 新規: `src/features/studio/studio-fonts.ts`, `ContentIllustration.tsx`, `CreamEdge.tsx`, `cream-edge.module.css`。運用ガイドと本記録を更新し、公開用 `docs/` を再生成。
- 差し替え済みHeroは2560×1441、4,909,806 bytes。原画の再圧縮・加工なし。SHA-256: `b7f2252ea9f229074d5de33344aa4eca5ff04583b0cae86ed49f1207b143e95e`。
- Heroは従来の高さを維持し、PCのobject-positionをcenter 36%、Mobileを73% centerへ調整。拡大アニメーションを廃止し、Fadeのみ。文字・リンク・4カード・About/Footerの内容は維持。
- Heroフォント: しっぽり明朝 B1（500）、Cormorant Garamond Italic（500）。固定UI: Manrope + Zen Kaku Gothic New。既存のSplitter/2D Viewerへは適用しない。
- アイコン: 本と羽根ペン、月のタロット、画像フレームとハサミ、レコードと楽譜。細線・淡いグラデーションのSVGへ変更。カードの枠・内側ハイライト・影・丸い矢印を調整。
- クリーム: 固定UI用の独立SVG部品。波形を撤去し、大小・長短の丸い下向きの滴へ変更。完全な白と薄い輪郭影でContentsへ接続。モバイルは専用パス。
- 本番ビルド/TypeScript/変更ファイルESLint: 成功。
- PCと390px/320pxのMobileでHero・顔・コピー・滴の輪郭・カードを確認。横はみ出しなし。新フォントの適用をDOMで確認。
- 全カードのリンク先・target/relを確認。Toolsから既存X Carousel Splitterへの遷移とUIの読み込みを確認。既存ツール本体のソース変更なし。
- 確認したローカルページのConsole Error/Warningなし。
- 以下は初回実装時の記録（PNG生成テストを含む）。

## 実装

白い固定UI、独立した季節Hero、SVGのゆるやかな境界、4つのコンテンツカード、簡潔なAbout、Community/SNS/Copyrightを実装。HeroにCTAなし。Sound Novelなし。カードのビジュアルはCSSのみで追加画像・ライブラリなし。

## 変更ファイル

- `src/app/page.tsx`: トップの構造・4コンテンツの定義
- `src/app/studio-home.module.css`: 固定UI・カードのVFX・レスポンシブ
- `next.config.ts`: 静的ホスト用の末尾スラッシュとindex.html出力
- `package.json`: Hero準備・Pages書き出しコマンド
- `.github/workflows/deploy-pages.yml`: docs/の生成・公開
- `.gitignore`: 自動コピーされるHeroを除外
- `eslint.config.mjs`: 生成したdocs/をlint対象から除外
- `README.md`: 公開・更新手順への入口

## 新規ファイル

- `src/features/studio/StudioChrome.tsx`
- `src/features/studio/SeasonalHero.tsx`
- `src/features/studio/hero-theme.ts`
- `src/features/studio/seasonal-hero.module.css`
- `src/features/studio/ContentCard.tsx`
- `src/app/tools/page.tsx`: 既存Splitterへの最小Toolsポータル
- `src/app/music/page.tsx`: 準備中ページ、プレイヤーなし
- `scripts/prepare-hero.mjs`
- `scripts/build-pages.mjs`
- `scripts/preview-pages.mjs`
- `docs/STUDIO-MAINTENANCE.md`
- `docs/STUDIO-VERIFICATION.md`
- `docs/index.html`, `docs/tools/index.html`, `docs/music/index.html` などの生成HTML、`docs/_next/`、既存ツールの静的書き出し、public由来のassets、`.nojekyll`

Hero原画: `docs/assets/hero/hero-halloween.png`（2560×1441）。公開参照: `/Studio/assets/hero/hero-halloween.png`。画像への文字焼き込みなし。

## 確認結果（2026-09-19、ローカル静的書き出し）

- `npm run build:pages`: 成功。TypeScriptチェック・全7ルートの書き出し成功。
- `npm run lint`: 成功。変更・追加ファイルを対象にしたESLintも成功。
- `git diff --check`: 成功。
- PC: 通常ビューポートおよび1440×1000で表示確認。4カード横並び、Heroの顔・文字・波の境界、About/Footerを確認。
- Mobile: 390×844で確認。Heroコピー→画像→Contents、顔の維持、横はみ出しなし。カードからTools/Musicへ操作可能。
- Header: Home/Contents/Aboutをクリックし、該当URL・アンカー遷移を確認。
- Idea Lab: カードから同じタブで公開サイトへ遷移確認。
- Tarot: カードから新しいタブが開くことを確認。`rel="noopener noreferrer"` をDOMでも確認。
- Tools/Music: 同じタブで内部遷移、Homeへの戻りを確認。
- X/YouTube: 指定URLとtarget/relをDOMで確認（外部サービス内の操作は対象外）。
- Hover: Tarotカードのhover状態で浮き上がり、shadow、highlightを計算済みスタイルで確認。
- Reduced motion: Heroとカードのアニメーション・移動を停止するCSSおよびポインター処理のガードを実装。OS設定切り替えによる実機確認は未実施。
- 既存X Carousel Splitter: 本体ソースに差分なし。画像読み込み、4分割、2分割を実行。2分割結果は各1920×2160の画像として読み込み完了を確認。
- PNG保存: ボタンをクリックしたが内蔵ブラウザでdownloadイベントを捕捉できず、保存完了は未確認。分割画像生成と既存の保存実装は維持。
- 確認したローカルページのConsole Error/Warning: なし。

公開サーバーへのpush/deployは未実施。

## Toolsポータル実装確認（2026-09-21）

- 新規CSS: src/app/tools/tools.module.css。既存src/app/tools/page.tsxをポータルへ更新、docs/静的出力を再生成。
- Tools専用Hero（指定文言・既存tools.png）、控えめな共通dripマスク、Tools List、X Carousel Splitter紹介カード1件、共通Footer。タイトル直下は指定機能説明のみ。仮カードや検索、追加Aboutなし。
- PC 1440×1000の横長カード、Mobile 390×844のHero・縦カード・Footerを目視確認。画像読み込み成功、横はみ出しなし。Console Error/Warningなし。
- トップToolsカード→Tools→既存Splitterを同じタブで実操作。Splitterの2分割選択で出力サイズ1920×2160に更新。既存ツール本体の変更なし。分割書き出しの再試験は未実施。
- build:pages / TypeScript / 対象ESLint成功。Google Fonts取得制限はネットワーク許可付きのビルドで解消。
