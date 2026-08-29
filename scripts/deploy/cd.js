/**
 * @file GitHub Actions 用デプロイスクリプト
 * @description
 * 第1引数に環境、第2引数以降にアプリ名を受け取り、指定されたアプリだけをデプロイする。
 * アプリ名を省略した場合は、その環境にIDを持つ全アプリが対象になる。
 *
 *   node scripts/deploy/cd.js staging 顧客管理アプリ タスク管理アプリ
 */
const { execSync } = require('node:child_process');
const apps = require('./apps');

const env = process.argv[2];
const requestedApps = process.argv.slice(3);

if (!['staging', 'production'].includes(env)) {
  console.error('Usage: node scripts/deploy/cd.js <staging|production> [アプリ名...]');
  process.exit(1);
}

// 指定ミスで「成功したのに何も反映されていない」状態にならないよう、実行前に落とす
const knownAppNames = apps.map((app) => app.name);
const unknownAppNames = requestedApps.filter((appName) => !knownAppNames.includes(appName));

if (unknownAppNames.length > 0) {
  console.error(`アプリ定義に存在しません: ${unknownAppNames.join(', ')}`);
  process.exit(1);
}

const deployableApps = apps.filter((app) => {
  const hasEnvAppId = env in app.appId;
  const isRequested = requestedApps.length === 0 || requestedApps.includes(app.name);
  return hasEnvAppId && isRequested;
});

console.log(`\n=== kintone デプロイ開始 (${env}) ===\n`);

let failed = false;

// 1アプリ失敗しても止めず、最後にまとめて失敗を返す（途中で止まると環境の状態が中途半端になるため）
for (const app of deployableApps) {
  const appId = app.appId[env];
  console.log(`[${app.name}] appId: ${appId}`);

  try {
    execSync(`npx cli-kintone customize apply --app ${appId} --input "${app.manifest}" --yes`, { stdio: 'inherit' });
    console.log(`[${app.name}] ✓ 完了\n`);
  } catch {
    console.error(`[${app.name}] ✗ 失敗\n`);
    failed = true;
  }
}

if (failed) {
  console.error('一部のアプリでデプロイが失敗しました');
  process.exit(1);
}

console.log('=== すべてのデプロイが完了しました ===');
