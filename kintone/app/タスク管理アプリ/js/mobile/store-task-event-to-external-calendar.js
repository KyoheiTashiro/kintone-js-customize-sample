/**
 * @file タスク予定 → 外部カレンダー保存（モバイル）
 * @description
 * タスクレコードの保存成功後（新規作成・編集）に、api-proxy-config プラグイン経由で
 * 外部APIを呼び出し、外部カレンダーに予定を保存する。
 * 失敗時はalertでエラーメッセージを表示する。
 * @see https://cybozu.dev/ja/kintone/docs/js-api/plugins/kintone-plug-in-proxy/
 *
 * 前提:
 * - api-proxy-config プラグインに `STORE_TASK_EVENT` ルートを登録
 * - `window.API_PROXY_CONFIG` に `{ PLUGIN_ID, routes }` が設定済み
 */
(() => {
  "use strict";

  /** api-proxy-config プラグインで登録した API ルート名 */
  const ROUTE_NAME = "STORE_TASK_EVENT";

  /**
   * api-proxy-config プラグインで設定されたプロキシ設定を取得する
   * @returns {{ PLUGIN_ID: string, routes: Object<string, string> }}
   */
  const getApiProxyConfig = () => window.API_PROXY_CONFIG;

  /**
   * 外部APIにリクエストを送信する（api-proxy-config プラグインのルート経由）
   * @param {string} routeName api-proxy-config で登録したルート名
   * @param {Object} payload リクエストボディ
   * @returns {Promise<void>}
   */
  const sendRequest = async (routeName, payload) => {
    const { PLUGIN_ID, routes } = getApiProxyConfig();

    const res = await kintone.plugin.app.proxy(
      PLUGIN_ID,
      routes[routeName],
      "POST",
      {},
      payload,
    );

    console.log({ res });
  };

  /**
   * タスクの予定を外部カレンダーに保存する
   * @param {Object} event kintone submit.success イベントオブジェクト
   * @returns {Promise<void>}
   */
  const storeTaskEventToExternalCalendar = async (event) => {
    const record = event.record;

    const payload = {
      event_name: "sample event",
      starts_at: record.starts_at.value,
      ends_at: record.ends_at.value,
    };

    await sendRequest(ROUTE_NAME, payload);
  };

  kintone.events.on(
    [
      "mobile.app.record.create.submit.success",
      "mobile.app.record.edit.submit.success",
    ],
    async (event) => {
      try {
        await storeTaskEventToExternalCalendar(event);
      } catch (error) {
        alert("外部カレンダーへの保存に失敗しました: " + error.message);
      }
    },
  );
})();
