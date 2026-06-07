/**
 * @file デスクトップ表示用スクリプト
 * @description
 * プラグインに保存済みの環境変数（key-value ペア）を読み込み、
 * {@link window.ENV} としてグローバルに公開する。
 * 他のカスタマイズ JS から `window.ENV.KEY_NAME` の形式で環境変数を参照できる。
 *
 * 使い方:
 * 1. アプリ設定 > プラグイン から environments-manage を有効化
 * 2. プラグイン設定画面で Key / Value を登録
 * 3. アプリのカスタマイズ JS よりも先に desktop.js が読み込まれる仕様により、
 *    後続の JS で `window.ENV.<KEY>` が参照できる
 *
 * @see ./config.js - 環境変数の登録・編集を行う設定画面スクリプト
 */
((PLUGIN_ID) => {
  'use strict';

  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (!config.entries) return;

  const entries = JSON.parse(config.entries);
  const env = {};
  entries.forEach((entry) => {
    env[entry.key] = entry.value;
  });
  window.ENV = env;
})(kintone.$PLUGIN_ID);
