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
  const env = {};
  entries.forEach((entry) => {
    env[entry.key] = entry.value;
  });
  window.ENV = env;
})(kintone.$PLUGIN_ID);
