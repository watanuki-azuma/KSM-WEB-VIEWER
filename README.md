# KSM-WEB-VIEWER

K-Shoot MANIA の譜面（KSON / KSH）をブラウザで再生するビューア。インストール不要で、ページを開いて譜面と音源を選ぶだけで動く。

**公開ページ:** https://watanuki-azuma.github.io/KSM-WEB-VIEWER/

## 使い方

1. 「譜面・音源を開く」で `.kson` / `.ksh` と音源（ogg / mp3 / wav）を選ぶ。ファイルやフォルダをページにドロップしてもよい。フォルダの場合は譜面が指定している音源を探して読み込む。
2. ▶ で再生。シークバー、速度（0.5 / 0.75 / 1.0×）、HI-SPEED、2D / 3D 表示、アシスト音、直角音、エフェクトを切り替えられる。

ファイルはブラウザの中だけで読み込み、どこにも送信しない。

## 再現しているもの

- KSM 風の 3D ハイウェイ、BT / FX / レーザー（wide、直角）の描画
- カメラ: 自動・手動の傾き（keep 系含む）、zoom_top / zoom_bottom / zoom_side、rotation、center_split、直角の spin / half_spin / swing と標準の揺れ
- スクロール速度の変化・停止
- FX ロング・レーザーのオーディオエフェクト、FX のキー音、直角音（いずれも合成音）

背景・動画・プレイ（判定）は対応していない。細かい挙動は [docs/behavior.md](docs/behavior.md)。

## 開発

`index.html` 1 ファイルで完結している（外部リソースなし）。テストは Node.js 22 で:

```sh
npm install
npm test            # 描画・カメラ・音の単体テスト
npx playwright install chromium
npm run smoke       # Chromium で実際に開いて再生する
```

`v*` タグを push すると `index.html` を添付したリリースが作られる。

### 譜面の埋め込み

[ksmauto](https://github.com/watanuki-azuma/kshootmania-automatic-edit) の `ksmauto preview` は、リリースの `index.html` の次の 3 箇所を書き換えて譜面・音源入りの単体 HTML を作る。変えるときは ksmauto 側も合わせる。

- `<title>Chart viewer</title>`
- `<script id="chart-data" type="application/json">null</script>` … KSON
- `const AUDIO_SRC = "";` … 音源の data URL

## ライセンス

一部は K-Shoot MANIA v2 / libkson（MIT）の実装を参考にしている。詳細は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
