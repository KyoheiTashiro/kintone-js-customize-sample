# environments-manage

環境変数を key-value で保持するプラグイン。カスタマイズ JS から `window.ENV` として参照する。

## セットアップ

1. アプリ設定 > プラグイン から environments-manage を追加
2. プラグイン設定画面で Key / Value を登録して保存

## 使い方

プラグインの JS はアプリのカスタマイズ JS より先に読み込まれるため、後続の JS から参照できる。

```js
const baseUrl = window.ENV.API_BASE_URL;
```

Key の未入力・重複は保存時に弾かれる。

## ファイル構成

```
environments-manage/
├ manifest.json
├ html/config.html   — 設定画面
└ js/
  ├ config.js        — 設定画面のロジック（登録・編集）
  ├ desktop.js       — PC 版。設定を読み込み window.ENV に公開
  └ mobile.js        — モバイル版。desktop.js と同一ロジック
```
