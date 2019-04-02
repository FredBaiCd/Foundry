/*
  Bind some events to Cart Coupon / Gift Cert forms.
  Markup for both forms is similar, so triggers display
*/
import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import giftCertValidate from './validateGiftCertificate';

export default function ($wrapperEl) {
  const $formShowToggle = $('[data-form-reveal]', $wrapperEl);
  const $formHideToggle = $('[data-form-hide]', $wrapperEl);
  const $toggleForm = $('[data-toggled-form]', $wrapperEl);
  const $formInput = $('[data-form-value]', $wrapperEl);
  const $formType = $('[data-form-type]', $wrapperEl);
  const $form = $('form', $wrapperEl);

  // Toggle displaying the form
  $formShowToggle.on('click', (event) => {
    event.preventDefault();

    $formShowToggle.addClass('hidden');
    $toggleForm.removeClass('hidden');
    $formInput.focus();
  });


  // Cancel button hides the form.
  $formHideToggle.on('click', (event) => {
    event.preventDefault();

    $formShowToggle.removeClass('hidden');
    $toggleForm.addClass('hidden');
  });


  // Form Submission Event.
  $form.on('submit', (event) => {
    const code = $formInput.val();
    event.preventDefault();
    event.stopPropagation();

    switch ($formType.data('form-type')) {

      case 'coupon':
        utils.api.cart.applyCode(code, (err, response) => {
          if (response.data.status === 'success') {
            window.location.reload();
          } else {
            alert(response.data.errors.join('\n'));
            $wrapperEl.removeClass('deactivated');
          }
        });
        break;

      case 'giftcertificate':

        if (!giftCertValidate(code)) {
          $wrapperEl.removeClass('deactivated');
          return alert($formInput.data('empty-error'));
        }

        utils.api.cart.applyGiftCertificate(code, (err, response) => {
          if (response.data.status === 'success') {
            window.location.reload();
          } else {
            alert(response.data.errors.join('\n'));
            $wrapperEl.removeClass('deactivated');
          }
        });
        break;

    }

  });
}
