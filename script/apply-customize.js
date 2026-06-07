const { execSync } = require('node:child_process');

// 新しいアプリを追加したら appId に staging/production のIDを追記すること
const apps = [
  {
    name: '顧客管理アプリ',
    manifest: 'kintone/app/顧客管理アプリ/customize-manifest.json',
    appId: { production: 0, staging: 0 }
  },
  {
    name: 'タスク管理アプリ',
    manifest: 'kintone/app/タスク管理アプリ/customize-manifest.json',
    appId: { production: 0, staging: 0 }
  }
];

const env = process.argv[2];

if (!env || !['staging', 'production'].includes(env)) {
  console.error('Usage: node apply-customize.js <staging|production>');
  process.exit(1);
}

const targetApps = apps.filter((app) => env in app.appId && app.appId[env] > 0);

console.log(`\n=== kintone デプロイ開始 (${env}) ===\n`);

let failed = false;

for (const app of targetApps) {
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
