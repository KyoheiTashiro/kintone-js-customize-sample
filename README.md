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
├ .github/workflows/
│ ├ deploy.yml                          — 変更されたアプリをデプロイ
│ └ pack-plugin.yml                     — プラグインの pack とインストール
├ kintone/
│ ├ app/                                — アプリごとのカスタマイズ JS
│ │ ├ 顧客管理アプリ/
│ │ │ ├ customize-manifest.json         — cli-kintone 用デプロイマニフェスト
│ │ │ └ js/
│ │ │   ├ pc/                           — PC 版用
│ │ │   └ mobile/                       — モバイル版用
│ │ └ タスク管理アプリ/
│ └ plugin/                             — kintone プラグイン
│   ├ environments-manage/              — 環境変数を key-value で保持
│   └ api-proxy-config/                 — kintone.proxy 用ルート設定を保持
└ scripts/deploy/
  ├ apps.js                             — アプリ名とアプリIDの定義
  ├ cd.js                               — GitHub Actions 用デプロイスクリプト
  └ local.js                            — ローカルから直接デプロイする対話式 CLI
```

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env` に kintone のサブドメイン URL とアカウント情報を設定する。

## カスタマイズ JS のデプロイ

### GitHub Actions

`stg` への push で Staging、`main` への push（PR マージ）で Production に反映される。

デプロイ対象は、push の差分から `kintone/app/<アプリ名>/` の変更を拾って絞り込む。`scripts/deploy/` 配下が変更された場合は全アプリを対象にする。

GitHub の Environment（`staging` / `production`）に以下の secrets を登録する。

- `KINTONE_BASE_URL`
- `KINTONE_USERNAME`
- `KINTONE_PASSWORD`

新しいアプリを追加したら `scripts/deploy/apps.js` の `apps` 配列に名前とアプリIDを追記する。アプリIDが `0` の環境は未設定として扱われ、その環境のデプロイ対象から外れる。

### ローカルから直接

```bash
npm run deploy:local
```

アプリと環境を選んでデプロイする。Production は、表示されたアプリIDを手で入力した場合のみ実行する。

## kintone プラグイン

### GitHub Actions

`main` への push で、変更されたプラグインだけを pack し、kintone にインストールまたは更新する。

署名鍵は次のコマンドで生成し、`plugin-signing` という Environment の secrets に登録する。シークレット名はディレクトリ名から導出する。

```bash
npm run plugin:keygen
```

| プラグインディレクトリ | シークレット名 |
|---|---|
| `environments-manage` | `PLUGIN_PPK_ENVIRONMENTS_MANAGE` |
| `api-proxy-config` | `PLUGIN_PPK_API_PROXY_CONFIG` |

`plugin-signing` の Environment には `KINTONE_BASE_URL` / `KINTONE_USERNAME` / `KINTONE_PASSWORD` も登録する。ディレクトリ名は `[a-z0-9-]+` に限る。

