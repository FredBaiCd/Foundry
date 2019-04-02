import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';

export default function () {
  $('body').on('cart-quantity-update', (event, cb) => {

    // Get the cart contents and update html in page.
    utils.api.cart.getContent({template: 'cart/cart-preview'}, (err, response) => {
      $('.cart-preview').html(response);

      // A callback to be triggered after the update is complete.
      // Used to delay certain actions until cart preview is properly updated.
      if ( typeof(cb) === 'function' ) { cb(); }

      $('.cart-preview-trigger').parent().removeClass('active');
    });
  });
}
