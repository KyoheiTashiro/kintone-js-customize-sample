/**
 * @file モバイル表示用スクリプト
 * @description
 * desktop.js と同一のロジック。
 * @see ./desktop.js
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
