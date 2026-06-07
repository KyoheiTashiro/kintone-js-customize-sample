# kintone-js-customize-sample

## 概要

kintone JavaScript カスタマイズのサンプルリポジトリ。

| 環境 | デプロイブランチ |
|---|---|
| Production | `main` |
| Staging | `stg` |

### ディレクトリ構成

```
/
├ .github/workflows/                    — GitHub Actions デプロイワークフロー
├ kintone/
│ ├ app/                                — アプリごとのカスタマイズ JS
│ │ ├ 顧客管理アプリ/
│ │ │ ├ customize-manifest.json         — cli-kintone 用デプロイマニフェスト
│ │ │ ├ README.md                       — アプリ固有の説明
│ │ │ └ js/
│ │ │   ├ pc/                           — PC 版用
│ │ │   └ mobile/                       — モバイル版用
│ │ └ タスク管理アプリ/
│ └ plugin/                             — kintone プラグイン
│   ├ environments-manage/              — 環境変数を key-value で保持
│   └ api-proxy-config/                 — kintone.proxy 用ルート設定を保持
└ scripts/
  └ apply-customize.js                  — GitHub Actions 用デプロイスクリプト
```

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env` に kintone のサブドメイン URL とアカウント情報を設定する。

## デプロイ

### カスタマイズ JS（GitHub Actions）

`stg` ブランチへの push で Staging、`main` ブランチへの PR マージで Production にデプロイされる。

| ブランチ | 環境 | トリガー |
|---|---|---|
| `stg` | Staging | push |
| `main` | Production | PR merge |

事前に GitHub の Environment secrets に以下を登録する。

- `KINTONE_BASE_URL`
- `KINTONE_USERNAME`
- `KINTONE_PASSWORD`

新しいアプリを追加したら `scripts/apply-customize.js` の `apps` 配列に `production` / `staging` の各 appId を追記する。

### kintone プラグイン

```bash
# プラグインの秘密鍵を生成
npm run plugin:keygen

# プラグインのパッケージ化
npm run plugin:pack -- \
  --input ./kintone/plugin/environments-manage/manifest.json \
  --output ./kintone/plugin/plugin.zip \
  --private-key ./kintone/plugin/private.ppk

# プラグインのアップロード
npm run plugin:upload -- --input ./kintone/plugin/plugin.zip
```

