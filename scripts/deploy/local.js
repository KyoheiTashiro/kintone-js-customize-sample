/**
 * @file 作業ブランチから直接デプロイする対話式 CLI
 * @description
 * アプリと環境を矢印キーで選ばせることで、アプリIDの打ち間違いによる
 * 「関係ないアプリのカスタマイズを壊す」事故を防ぐ。
 * Production だけは、表示されたアプリIDの手入力を求める。
 *
 *   npm run deploy:local
 */
const { execSync } = require('node:child_process');
const readline = require('node:readline');
const apps = require('./apps');

const KEY_UP = '\x1b[A';
const KEY_DOWN = '\x1b[B';
const KEY_ENTER = '\r';
const KEY_CTRL_C = '\x03';

const ENVIRONMENTS = [
  { key: 'staging', label: 'Staging' },
  { key: 'production', label: 'Production' }
];

/**
 * 選択メニューの選択肢を再描画する
 * @param {string[]} options - 選択肢の配列
 * @param {number} cursor - 現在のカーソル位置
 */
const renderMenu = (options, cursor) => {
  process.stdout.write(`\x1b[${options.length}A`);

  for (let index = 0; index < options.length; index++) {
    const active = index === cursor;
    process.stdout.write(`\x1b[2K${active ? '\x1b[36m▶ ' : '  '}${options[index]}\x1b[0m\n`);
  }
};

/**
 * 矢印キーで1つ選ばせ、選択されたインデックスを返す
 * @param {string} message - 見出し
 * @param {string[]} options - 選択肢の配列
 * @returns {Promise<number>}
 */
const select = (message, options) => {
  console.log(`\n${message}`);
  options.forEach(() => process.stdout.write('\n'));

  let cursor = 0;
  renderMenu(options, cursor);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  return new Promise((resolve) => {
    const onData = (data) => {
      const key = data.toString();

      if (key === KEY_CTRL_C) {
        process.stdin.setRawMode(false);
        process.exit(130);
      }

      if (key === KEY_ENTER) {
        process.stdin.off('data', onData);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve(cursor);
        return;
      }

      if (key === KEY_UP) {
        cursor = (cursor - 1 + options.length) % options.length;
      }
      if (key === KEY_DOWN) {
        cursor = (cursor + 1) % options.length;
      }
      renderMenu(options, cursor);
    };

    process.stdin.on('data', onData);
  });
};

/**
 * 1行入力を受け取る
 * @param {string} message - プロンプト文字列
 * @returns {Promise<string>}
 */
const prompt = (message) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

/**
 * デプロイ実行前の確認を取る
 * Staging は y/N、Production は表示されたアプリIDの手入力を求める
 * @param {string} environmentKey - 環境キー
 * @param {number} appId - デプロイ先アプリID
 * @returns {Promise<boolean>}
 */
const confirmDeploy = async (environmentKey, appId) => {
  if (environmentKey === 'production') {
    const inputAppId = await prompt('\n本番環境へデプロイします。確認のため上記のアプリIDを入力してください: ');
    if (inputAppId !== String(appId)) {
      console.log('アプリIDが一致しません');
      return false;
    }
    return true;
  }

  const answer = await prompt('\nデプロイしますか？ (y/N): ');
  return answer.toLowerCase() === 'y';
};

/**
 * アプリと環境を選ばせてデプロイする
 * @returns {Promise<void>}
 */
const main = async () => {
  const appIndex = await select('デプロイするアプリを選択してください', apps.map((app) => app.name));
  const selectedApp = apps[appIndex];

  // 選んだアプリがIDを持つ環境だけを次の選択肢に出す
  const availableEnvironments = ENVIRONMENTS.filter((environment) => environment.key in selectedApp.appId);
  const environmentIndex = await select('デプロイ先の環境を選択してください', availableEnvironments.map((environment) => environment.label));
  const selectedEnvironment = availableEnvironments[environmentIndex];

  const appId = selectedApp.appId[selectedEnvironment.key];
  console.log(`\n${selectedApp.name} → ${selectedEnvironment.label} / アプリID: ${appId}`);

  if (!(await confirmDeploy(selectedEnvironment.key, appId))) {
    console.log('中止しました');
    return;
  }

  execSync(`npx cli-kintone customize apply --app ${appId} --input "${selectedApp.manifest}" --yes`, { stdio: 'inherit' });
  console.log(`\n[${selectedApp.name}] ✓ ${selectedEnvironment.label} へ反映しました`);
};

main();
