/**
 * @file デスクトップ表示用スクリプト
 * @description
 * プラグインに保存済みのプロキシルート設定を読み込み、
 * ルート名と URL のマッピングを {@link window.API_PROXY_CONFIG} としてグローバルに公開する。
 *
 * 他のカスタマイズ JS からは下記のように参照:
 *
 *   const { PLUGIN_ID, routes } = window.API_PROXY_CONFIG;
 *   const url = routes['TASK_COMPLETED_NOTIFY'];
 *   const [body, status] = await kintone.proxy(PLUGIN_ID, url, 'POST', headers, payload);
 *
 * @see ./config.js
 */
((PLUGIN_ID) => {
  'use strict';

  const config = kintone.plugin.app.getConfig(PLUGIN_ID);

  if (!config.entries) return;

  const entries = JSON.parse(config.entries);
  const routes = {};

  entries.forEach((entry) => {
    routes[entry.name] = entry.url;
  });

  window.API_PROXY_CONFIG = {
    PLUGIN_ID: PLUGIN_ID,
    routes: routes
  };
})(kintone.$PLUGIN_ID);
