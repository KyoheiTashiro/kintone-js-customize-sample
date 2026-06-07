(() => {
  'use strict';

  /**
   * @param {Object} record kintone レコード
   * @returns {string|null} エラーメッセージ or null
   */
  const validatePhoneNumber = (record) => {
    const value = record['phone_number'].value;

    if (value && !/^[0-9]{10,11}$/.test(value)) {
      return '電話番号は半角数字10桁または11桁で入力してください。';
    }

    return null;
  };

  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], (event) => {
    const record = event.record;

    const results = [
      validatePhoneNumber(record)
    ];

    const errorMessages = results.filter((errorMessage) => errorMessage !== null);

    if (errorMessages.length > 0) {
      event.error = errorMessages.join(', ');
    }

    return event;
  });
})();
