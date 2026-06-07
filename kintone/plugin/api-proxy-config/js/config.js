/**
 * @file プラグイン設定画面のスクリプト
 * @description
 * 外部APIへの proxy ルートを管理する画面のロジック。
 * ユーザーはルート名・URL・アクセストークンの組み合わせを動的に追加・削除でき、
 * 保存時に kintone のプロキシ設定（トークン）とプラグイン設定（ルート名・URL）を登録する。
 *
 * - ルート名・URL は kintone.plugin.app.setConfig で保存（JSの window.API_PROXY_CONFIG.routes から参照可能）
 * - トークンは kintone.plugin.app.setProxyConfig で保存（kintone 側に秘匿管理され、JS からは読めない）
 *
 * @see ../html/config.html
 * @see ../manifest.json
 */
((PLUGIN_ID) => {
  'use strict';

  const entriesContainer = document.getElementById('entries-container');
  const addButton = document.getElementById('add-button');
  const saveButton = document.getElementById('save-button');
  const cancelButton = document.getElementById('cancel-button');

  /**
   * 入力行を追加する
   * @param {string} name ルート名
   * @param {string} url URL
   */
  const addEntryRow = (name = '', url = '') => {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'entry-name';
    nameInput.style.cssText = 'flex: 1; padding: 8px; box-sizing: border-box;';
    nameInput.placeholder = 'Route Name';
    nameInput.value = name;

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'entry-url';
    urlInput.style.cssText = 'flex: 2; padding: 8px; box-sizing: border-box;';
    urlInput.placeholder = 'URL';
    urlInput.value = url;

    const tokenInput = document.createElement('input');
    tokenInput.type = 'password';
    tokenInput.className = 'entry-token';
    tokenInput.style.cssText = 'flex: 1; padding: 8px; box-sizing: border-box;';
    tokenInput.placeholder = 'Token（更新時のみ入力）';

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.style.cssText = 'padding: 8px 12px; background: #e74c3c; color: #fff; border: none; border-radius: 4px; cursor: pointer;';
    removeButton.textContent = 'x';
    removeButton.addEventListener('click', () => row.remove());

    row.append(nameInput, urlInput, tokenInput, removeButton);

    entriesContainer.appendChild(row);
  };

  /**
   * 保存済みの設定を読み込み、入力行を復元する
   */
  const loadConfig = () => {
    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!config.entries) return;

    const entries = JSON.parse(config.entries);
    if (entries.length === 0) return;

    entriesContainer.replaceChildren();
    entries.forEach((entry) => addEntryRow(entry.name, entry.url));
  };

  /**
   * 入力行をバリデーションする
   * @returns {boolean}
   */
  const validateEntries = () => {
    const names = entriesContainer.querySelectorAll('.entry-name');
    const urls = entriesContainer.querySelectorAll('.entry-url');

    const seenNames = new Set();

    for (let index = 0; index < names.length; index++) {
      const name = names[index].value.trim();
      const url = urls[index].value.trim();

      if (!name || !url) {
        alert(`${index + 1} 行目のRoute NameまたはURLが未入力です。`);
        return false;
      }

      if (seenNames.has(name)) {
        alert(`Route Name「${name}」が重複しています。`);
        return false;
      }

      seenNames.add(name);
    }

    return true;
  };

  /**
   * 入力行を収集する
   * @returns {{ name: string, url: string, token: string }[]}
   */
  const collectEntries = () => {
    const entries = [];

    const names = entriesContainer.querySelectorAll('.entry-name');
    const urls = entriesContainer.querySelectorAll('.entry-url');
    const tokens = entriesContainer.querySelectorAll('.entry-token');

    names.forEach((nameInput, index) => {
      const name = nameInput.value.trim();
      const url = urls[index].value.trim();
      const token = tokens[index].value.trim();

      entries.push({ name, url, token });
    });

    return entries;
  };

  /**
   * setProxyConfig を Promise でラップする
   * @param {string} url
   * @param {string} token
   * @returns {Promise<void>}
   */
  const setProxyConfigToPromise = (url, token) => {
    return new Promise((resolve, reject) => {
      kintone.plugin.app.setProxyConfig(
        url,
        'POST',
        { 'Content-Type': 'application/json' },
        { token },
        () => resolve(),
        (error) => reject(new Error(error))
      );
    });
  };

  /**
   * 入力行をバリデーションし、プロキシ設定とプラグイン設定を保存する
   * @returns {Promise<void>}
   */
  const saveEntries = async () => {
    const isValid = validateEntries();
    if (!isValid) return;

    const entries = collectEntries();

    try {
      for (const entry of entries) {
        if (entry.token) {
          await setProxyConfigToPromise(entry.url, entry.token);
        }
      }

      const configEntries = entries.map((entry) => ({ name: entry.name, url: entry.url }));

      kintone.plugin.app.setConfig({ entries: JSON.stringify(configEntries) }, () => {
        window.location.href = '../../flow?app=' + kintone.app.getId();
      });
    } catch (error) {
      alert('プロキシ設定の保存に失敗しました: ' + error.message);
    }
  };

  addButton.addEventListener('click', () => addEntryRow());

  saveButton.addEventListener('click', saveEntries);

  cancelButton.addEventListener('click', () => (window.location.href = '../../flow?app=' + kintone.app.getId()));

  loadConfig();

  if (entriesContainer.children.length === 0) {
    addEntryRow();
  }
})(kintone.$PLUGIN_ID);
