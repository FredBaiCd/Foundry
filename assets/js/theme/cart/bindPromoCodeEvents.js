import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';

export default function () {
  const $couponContainer = $('.coupon-code');
  const $couponForm = $('.coupon-form');
  const $codeInput = $('[name="couponcode"]', $couponForm);

  $('.coupon-code-add').on('click', (event) => {
    event.preventDefault();

    $(event.currentTarget).addClass('hidden');
    $couponContainer.removeClass('hidden');
    $('.coupon-code-cancel').removeClass('hidden');
    $codeInput.focus();
  });

  $('.coupon-code-cancel').on('click', (event) => {
    event.preventDefault();

    $couponContainer.addClass('hidden');
    $('.coupon-code-cancel').addClass('hidden');
    $('.coupon-code-add').removeClass('hidden');
  });

  $couponForm.on('submit', (event) => {
    const code = $codeInput.val();

    event.preventDefault();
    $couponForm.addClass('deactivated');

    utils.api.cart.applyCode(code, (err, response) => {
      console.log(response)
      if (response.data.status === 'success') {
        // this.refreshContent();
        // TODO: Refresh cart data to reflect successful code status.
      } else {
        alert(response.data.errors.join('\n'));
      }
      $couponForm.removeClass('deactivated');
    });
  });
}
