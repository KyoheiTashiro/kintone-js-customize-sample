/**
 * @file 顧客選択モーダル（モバイル）
 * @description
 * PC版と同一ロジック。kintone モバイル専用 API・イベント名を使用。
 * @see ../pc/select-customer-modal.js
 */
(() => {
  'use strict';

  /**
   * environments-manage プラグインで設定された環境変数を取得する
   * @returns {Object.<string, string>}
   */
  const getEnv = () => window.ENV;

  let customersCache = null;

  /**
   * 顧客管理アプリから全顧客レコードを取得し、キャッシュして返す
   * @returns {Promise<Array>}
   */
  const fetchAllCustomers = async () => {
    if (customersCache) {
      return customersCache;
    }

    const { CUSTOMER_APP_ID } = getEnv();
    const allRecords = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const data = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
        app: CUSTOMER_APP_ID,
        query: 'order by customer_id asc limit 500 offset ' + offset,
        fields: ['customer_id', 'customer_name']
      });

      allRecords.push(...data.records);
      hasMore = data.records.length === 500;
      offset += 500;
    }

    customersCache = allRecords;
    return customersCache;
  };

  /**
   * キーワードで顧客を絞り込む
   * @param {Array} records
   * @param {string} keyword
   * @returns {Array}
   */
  const filterCustomers = (records, keyword) => {
    if (!keyword) {
      return records;
    }

    const fixedKeyword = keyword.toLowerCase();

    return records.filter(
      (record) =>
        record.customer_id.value.toLowerCase().includes(fixedKeyword) ||
        record.customer_name.value.toLowerCase().includes(fixedKeyword)
    );
  };

  /**
   * 「設定」ボタン押下時のハンドラ
   * @param {Object} record
   * @param {HTMLElement} overlay
   * @param {Function} onCustomerSet
   */
  const handleSetCustomer = (record, overlay, onCustomerSet) => {
    const row = kintone.mobile.app.record.get();
    row.record['customer_id'].value = record.customer_id.value;
    row.record['customer_name'].value = record.customer_name.value;
    kintone.mobile.app.record.set(row);

    document.body.removeChild(overlay);
    onCustomerSet();
  };

  /**
   * 1顧客分の行要素を生成する
   * @param {Object} record
   * @param {HTMLElement} overlay
   * @param {Function} onCustomerSet
   * @returns {HTMLElement}
   */
  const createCustomerRow = (record, overlay, onCustomerSet) => {
    const item = document.createElement('div');
    item.style.cssText = 'padding:10px 8px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;';

    const info = document.createElement('span');
    info.textContent = record.customer_id.value + ' ' + record.customer_name.value;

    const setButton = document.createElement('button');
    setButton.textContent = '設定';
    setButton.style.cssText = 'padding:6px 14px;cursor:pointer;';
    setButton.onclick = () => handleSetCustomer(record, overlay, onCustomerSet);

    item.appendChild(info);
    item.appendChild(setButton);
    return item;
  };

  /**
   * 顧客一覧を描画する
   * @param {Array} records
   * @param {HTMLElement} list
   * @param {HTMLElement} overlay
   * @param {Function} onCustomerSet
   */
  const renderCustomersList = (records, list, overlay, onCustomerSet) => {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    if (records.length === 0) {
      list.textContent = '該当するデータが見つかりません';
      return;
    }

    records.forEach((record) => {
      list.appendChild(createCustomerRow(record, overlay, onCustomerSet));
    });
  };

  /**
   * 検索ボックス入力時の再描画
   * @param {HTMLInputElement} searchInput
   * @param {HTMLElement} list
   * @param {HTMLElement} overlay
   * @param {Function} onCustomerSet
   */
  const refreshCustomersList = async (searchInput, list, overlay, onCustomerSet) => {
    const records = await fetchAllCustomers();
    const filtered = filterCustomers(records, searchInput.value.trim());
    renderCustomersList(filtered, list, overlay, onCustomerSet);
  };

  /**
   * 顧客選択モーダルを表示する
   * @param {Function} onCustomerSet
   */
  const showCustomerModal = (onCustomerSet) => {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:10000;display:flex;justify-content:center;align-items:center;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:#fff;border-radius:8px;padding:16px;width:92%;max-height:85vh;overflow-y:auto;';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '顧客ID・顧客名で検索...';
    searchInput.style.cssText =
      'width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;margin-bottom:12px;font-size:16px;';

    const list = document.createElement('div');
    list.style.cssText = 'max-height:60vh;overflow-y:auto;';

    searchInput.addEventListener('input', () => refreshCustomersList(searchInput, list, overlay, onCustomerSet));
    refreshCustomersList(searchInput, list, overlay, onCustomerSet);

    overlay.onclick = (event) => {
      if (event.target === overlay) document.body.removeChild(overlay);
    };

    modal.appendChild(searchInput);
    modal.appendChild(list);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  };

  /**
   * 顧客情報をクリアする
   * @param {HTMLButtonElement} selectButton
   * @param {HTMLButtonElement} clearButton
   */
  const clearCustomer = (selectButton, clearButton) => {
    const row = kintone.mobile.app.record.get();
    row.record['customer_id'].value = null;
    row.record['customer_name'].value = null;
    kintone.mobile.app.record.set(row);

    clearButton.style.display = 'none';
    selectButton.style.display = '';
  };

  /**
   * 顧客選択/解除ボタンをスペースフィールドに追加する
   * @param {boolean} hasCustomer
   */
  const addCustomerButton = (hasCustomer) => {
    const space = kintone.mobile.app.record.getSpaceElement('customer_select_button');
    space.parentNode.style.cssText += 'display:flex;flex-direction:column;justify-content:flex-end;';

    const selectButton = document.createElement('button');
    selectButton.textContent = '顧客選択';
    selectButton.style.cssText = 'padding:8px 16px;cursor:pointer;';
    selectButton.style.display = hasCustomer ? 'none' : '';

    const clearButton = document.createElement('button');
    clearButton.textContent = '顧客解除';
    clearButton.style.cssText = 'padding:8px 16px;cursor:pointer;';
    clearButton.style.display = hasCustomer ? '' : 'none';

    const onCustomerSet = () => {
      selectButton.style.display = 'none';
      clearButton.style.display = '';
    };

    selectButton.onclick = () => showCustomerModal(onCustomerSet);
    clearButton.onclick = () => clearCustomer(selectButton, clearButton);

    space.appendChild(selectButton);
    space.appendChild(clearButton);
  };

  kintone.events.on(['mobile.app.record.create.show', 'mobile.app.record.edit.show'], (event) => {
    event.record['customer_id'].disabled = true;
    event.record['customer_name'].disabled = true;

    const hasCustomer = event.record['customer_id'].value && event.record['customer_name'].value;
    addCustomerButton(hasCustomer);

    return event;
  });
})();
