/**
 * @file プラグイン設定画面のスクリプト
 * @description
 * 環境変数を key-value ペアで管理する設定画面のロジック。
 * ユーザーはキーと値の組み合わせを動的に追加・削除でき、
 * 保存時に kintone のプラグイン設定へ JSON 形式で登録する。
 * 登録した値は desktop.js / mobile.js 経由で {@link window.ENV} として参照される。
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
   * key-value 入力行を追加する
   * @param {string} key キー初期値
   * @param {string} value バリュー初期値
   */
  const addEntryRow = (key = '', value = '') => {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.className = 'entry-key';
    keyInput.style.cssText = 'flex: 1; padding: 8px; box-sizing: border-box;';
    keyInput.placeholder = 'Key';
    keyInput.value = key;

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'entry-value';
    valueInput.style.cssText = 'flex: 1; padding: 8px; box-sizing: border-box;';
    valueInput.placeholder = 'Value';
    valueInput.value = value;

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.style.cssText = 'padding: 8px 12px; background: #e74c3c; color: #fff; border: none; border-radius: 4px; cursor: pointer;';
    removeButton.textContent = 'x';
    removeButton.addEventListener('click', () => row.remove());

    row.append(keyInput, valueInput, removeButton);

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
    entries.forEach((entry) => addEntryRow(entry.key, entry.value));
  };

  /**
   * 入力行をバリデーションする
   * @returns {boolean}
   */
  const validateEntries = () => {
    const keys = entriesContainer.querySelectorAll('.entry-key');
    const values = entriesContainer.querySelectorAll('.entry-value');

    const seenKeys = new Set();

    for (let index = 0; index < keys.length; index++) {
      const key = keys[index].value.trim();
      const value = values[index].value.trim();

      if (!key || !value) {
        alert(`${index + 1} 行目の Key または Value が未入力です。`);
        return false;
      }

      if (seenKeys.has(key)) {
        alert(`Key「${key}」が重複しています。`);
        return false;
      }

      seenKeys.add(key);
    }

    return true;
  };

  /**
   * 全ての入力行から key-value ペアを収集する
   * @returns {{ key: string, value: string }[]}
   */
  const collectEntries = () => {
    const entries = [];

    const keys = entriesContainer.querySelectorAll('.entry-key');
    const values = entriesContainer.querySelectorAll('.entry-value');

    keys.forEach((keyInput, index) => {
      const key = keyInput.value.trim();
      const value = values[index].value.trim();

      entries.push({ key, value });
    });

    return entries;
  };

  addButton.addEventListener('click', () => addEntryRow());

  saveButton.addEventListener('click', () => {
    const isValid = validateEntries();
    if (!isValid) return;

    const entries = collectEntries();

    kintone.plugin.app.setConfig({ entries: JSON.stringify(entries) }, () => {
      window.location.href = '../../flow?app=' + kintone.app.getId();
    });
  });

  cancelButton.addEventListener('click', () => {
    window.location.href = '../../flow?app=' + kintone.app.getId();
  });

  loadConfig();

  if (entriesContainer.children.length === 0) {
    addEntryRow();
  }
})(kintone.$PLUGIN_ID);
