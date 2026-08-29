# api-proxy-config

`kintone.proxy` で使う外部 API のルート設定を保持するプラグイン。カスタマイズ JS から `window.API_PROXY_CONFIG` として参照する。

トークンは kintone のプロキシ設定側に保存され、JS からは読み出せない。

## セットアップ

1. アプリ設定 > プラグイン から api-proxy-config を追加
2. プラグイン設定画面で Route Name / URL / Token を登録して保存

| 入力欄 | 内容 |
|---|---|
| Route Name | JS 側で参照する識別子（例: `TASK_COMPLETED_NOTIFY`） |
| URL | 外部 API のエンドポイント URL |
| Token | 外部 API の認可に使うアクセストークン。初回は必須、更新時は変更する場合のみ入力（空欄なら既存を維持） |

Route Name の未入力・重複は保存時に弾かれる。

## 使い方

```js
const { PLUGIN_ID, routes } = window.API_PROXY_CONFIG;
const url = routes['TASK_COMPLETED_NOTIFY'];
const [body, status] = await kintone.proxy(PLUGIN_ID, url, 'POST', { 'Content-Type': 'application/json' }, payload);
```

トークンは保存済みのプロキシ設定から kintone が自動で付与する。

## ファイル構成

```
api-proxy-config/
├ manifest.json
├ html/config.html   — 設定画面
└ js/
  ├ config.js        — 設定画面のロジック（ルート登録・トークン保存）
  ├ desktop.js       — PC 版。設定を読み込み window.API_PROXY_CONFIG に公開
  └ mobile.js        — モバイル版。desktop.js と同一ロジック
```
