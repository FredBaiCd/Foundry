import PageManager from '../PageManager';
import nod from './common/nod';

export default class GiftCertificate extends PageManager {
  constructor() {
    super();
  }

  loaded() {

    const purchaseModel = {
      recipientName: function(val) {
        return val.length;
      },
      recipientEmail: function(value) {
        const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(value);
      },
      senderName: function(val) {
        return val.length;
      },
      senderEmail: function(value) {
        const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(value);
      },
      customAmount: function(value, min, max) {
        return value && value >= min && value <= max;
      },
      setAmount: function(value, options) {
        let found = false;

        options.forEach(function(option) {
          if (option === value) {
            found = true;
            return false;
          }
        });

        return found;
      }
    },
    $purchaseForm = $('[data-giftcert-form]'),
    $customAmounts = $purchaseForm.find('input[name="certificate_amount"]'),
    purchaseValidator = nod({
      submit: '.gift-certificate-form input[type="submit"]',
      delay: 300
    });

    if ($customAmounts.length) {
      const $element = $purchaseForm.find('input[name="certificate_amount"]');
      const min = $element.data('min');
      const minFormatted = $element.data('min-formatted');
      const max = $element.data('max');
      const maxFormatted = $element.data('max-formatted');

      purchaseValidator.add({
        selector: '.gift-certificate-form input[name="certificate_amount"]',
        validate: (cb, val) => {
          val = Number(val);

          if (!val) {
            cb(false);
          }
          cb(val >= min && val <= max);
        },
        errorMessage: this.context.amount
      });
    }

    purchaseValidator.add([{
      selector: '.gift-certificate-form input[name="to_name"]',
      validate: (cb, val) => {
        const result = purchaseModel.recipientName(val);
        cb(result);
      },
      errorMessage: this.context.to_name
    }, {
      selector: '.gift-certificate-form input[name="to_email"]',
      validate: (cb, val) => {
        const result = purchaseModel.recipientEmail(val);
        cb(result);
      },
      errorMessage: this.context.to_email
    }, {
      selector: '.gift-certificate-form input[name="from_name"]',
      validate: (cb, val) => {
        const result = purchaseModel.senderName(val);
        cb(result);
      },
      errorMessage: this.context.from_name
    }, {
      selector: '.gift-certificate-form input[name="from_email"]',
      validate: (cb, val) => {
        const result = purchaseModel.senderEmail(val);
        cb(result);
      },
      errorMessage: this.context.from_email
    }, {
      selector: '.gift-certificate-form input[name="certificate_theme"]:first-of-type',
      triggeredBy: '.gift-certificate-form input[name="certificate_theme"]',
      validate: (cb, val) => {
        val = $purchaseForm.find('input[name="certificate_theme"]:checked').val();

        cb(typeof(val) === 'string');
      },
      errorMessage: this.context.certificate_theme
    }, {
      selector: '.gift-certificate-form input[name="agree"]',
      validate: (cb, val) => {
        val = $purchaseForm.find('input[name="agree"]').get(0).checked;

        cb(val);
      },
      errorMessage: this.context.agree
    }, {
      selector: '.gift-certificate-form input[name="agree2"]',
      validate: (cb, val) => {
        val = $purchaseForm.find('input[name="agree2"]').get(0).checked;

        cb(val);
      },
      errorMessage: this.context.agree
    }]);


    $purchaseForm.submit((event) => {
      purchaseValidator.performCheck();

      if (!purchaseValidator.areAll('valid')) {
        return event.preventDefault();
      }
    });

    $('#giftcert-preview').click((event) => {
      const previewUrl = $(event.currentTarget).data('preview-url') + '&' + $purchaseForm.serialize();

      event.preventDefault();
      purchaseValidator.performCheck();
      if (!purchaseValidator.areAll('valid')) {
        return;
      }

      window.open(previewUrl);
    });
  }
}
