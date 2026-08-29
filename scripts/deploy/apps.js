/**
 * @file デプロイ対象アプリの定義
 * @description
 * アプリ名とアプリIDだけを持ち、マニフェストのパスは名前から組み立てる。
 * `appId` が 0 の環境は未設定として扱い、その環境のデプロイ対象から自動的に外れる。
 * 新しいアプリを追加したら、この配列に追記する。
 */
const apps = [
  { name: '顧客管理アプリ', appId: { production: 0, staging: 0 } },
  { name: 'タスク管理アプリ', appId: { production: 0, staging: 0 } },
];

module.exports = apps.map((app) => ({
  ...app,
  appId: Object.fromEntries(Object.entries(app.appId).filter(([, id]) => id > 0)),
  manifest: `kintone/app/${app.name}/customize-manifest.json`,
}));
