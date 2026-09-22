# Musicの更新方法

## 楽曲情報

`src/features/music/songs.json` が一覧の編集元です。s-001〜s-006の曲名は既存MP3のtitleメタデータから転記しています。短い紹介・タグ・アルバムは提供素材に情報がなかったため空欄です。空欄は画面に表示しません。

- title: 曲名
- shortDescription: 一行紹介。長い場合は一覧で省略。
- tags: タグ文字列の配列
- album: 任意。設定すると曲情報とプレイヤーの間へ表示
- cover / audio / lyrics / caption / article: docsから見た実ファイルのパス（/assets/music/...）

新曲は同じIDの素材を `docs/assets/music/` に配置し、songs.jsonに1件追加します。音源の時間はビルド時に自動取得、再生時にブラウザmetadataで更新します。mm:ssは総時間を秒単位に丸めて表示します。カバー・音源・テキストは加工しません。

## 再生と歌詞

MusicPlayer.tsx内の単一audio要素で再生します。初期状態ではsrcを持たず、曲を選んだ時だけ設定。preload=metadata。再生はplay、一時停止はpause、停止はpauseとcurrentTime=0。別曲への切替・ページを離れる際は前曲を停止します。

歌詞はボタン押下時に対応するwords/s-XXX.txtをfetch。文字列のままDialogに表示し、改行を維持。閉じる/Escapeとフォーカス管理は標準dialogを使用します。Music Listの楽曲紹介はDialogを開いた時にcaptionとarticleをfetchし、原文を表示します。旧詳細URLも互換用に残しています。

## 楽曲紹介の原稿

詳細URLは `/Studio/music/s-001/` 等。出力は `docs/music/s-001/index.html` です。

1. `docs/assets/music/articles/s-001/article.md` を本番Markdownへ置き換える。
2. 見出しは `# 楽曲について` / `## 小見出し`。現在の仮原稿にある `\#` のようなエスケープは付けない。
3. 段落、`**強調**`、`[リンク](https://...)`、`![画像の説明](images/01.png)` に対応。画像を実際に `articles/s-001/images/01.png` に配置する。
4. `npm run build:pages` を実行。準備中の段落だけの原稿は短い準備中表示へまとめ、本番本文が入るとMarkdown表示へ自動的に切り替わる。
5. `node scripts/verify-music.mjs` とプレビューで確認する。

react-markdownで見出し・段落・画像・強調・リンクを静的HTML化します。HTML埋め込みは無効。相対画像/リンクは該当記事の素材フォルダ基準です。紹介DialogはブラウザでMarkdownを表示します。互換用の旧詳細ページでは静的HTMLへ変換します。

## 開発と確認

Musicも既存のprepare-hero.mjsでdocs/assetsからpublic/assetsへコピーします。public側の自動コピーは直接編集しません。プレビューは `node scripts/preview-pages.mjs`。音声の部分取得に必要なHTTP Rangeとaudio/mpegに対応しています。

2026-09-22確認: build:pages、TypeScript、対象ESLint、全6曲のアセット・caption原文・歌詞コピー・詳細出力確認に成功。ブラウザで全6曲の再生進行、Pause位置維持、Stopで0秒、別曲への切替、歌詞Dialog、詳細リンク、トップからのMusic遷移を確認。PC 1440×1000 / Mobile 390×844でHero・五線譜・Row・歌詞・詳細を確認。Console Error/Warningなし。

新規: src/features/music/{songs.json,data.ts,MusicPlayer.tsx,music.module.css}, src/app/music/[id]/page.tsx, scripts/verify-music.mjs, 本ガイド。
変更: src/app/music/page.tsx, scripts/prepare-hero.mjs, scripts/preview-pages.mjs, .gitignore, package.json/package-lock.json, 公開用docs/。共通Header/Footerやトップ・Toolsのソースは変更していません。

## プレイヤー追加調整

- 各Rowのrange inputはcurrentTime/timeupdate/loadedmetadata/durationchangeと同期。停止は0、終了は終端を保持し、再再生で先頭へ。未選択曲のシークはその曲を一時停止状態で選択し、metadata後に指定位置へ移動します。
- Play/Pause/Stopは18pxのSVG。外側ボタンの寸法設定を維持。PC Row高さ114px。
- 楽曲紹介・歌詞は同じnative dialogで表示。Audio要素はMusicPlayerに1つだけあり、Dialogの開閉では変更しません。Escape/Close/背景クリック、フォーカス復帰、背景スクロール停止に対応。
- MasterVolumeは見出し右側のPopover。スライダーとミュート用Speakerボタンを配置。volume=0〜1を単一Audioへ適用し、ミュート時は0、解除で直前値に戻ります。
- localStorageキー: tsurara-studio.music.volume。volume/muted/previousのみ保存。useSyncExternalStoreでSSRとの整合性と別タブの設定変更に対応。保存不可でもメモリ上で操作できます。
- 追加ソース: MasterVolume.tsx / useMasterVolume.ts / PlayerIcon.tsx / MusicArticle.tsx。MusicPlayer.tsx、music.module.css、music/page.tsxを更新。
- 実操作確認: 再生中シークの自動進行・クリック・ドラッグ、Pause中シーク、Stop=0、曲末と再開始、紹介/歌詞を開いても継続、フォーカス復帰、音量40%→mute0%→解除40%、曲切替・再読み込み後40%維持。PC1440×1000、Mobile390×844、横はみ出しなし、Console Error/Warningなし。build:pages/TypeScript/対象ESLint成功。
