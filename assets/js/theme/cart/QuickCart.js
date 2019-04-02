import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import revealer from 'js/theme/components/jquery-revealer';

export default class QuickCart {
  constructor(el) {
    this.$el = $(el);
    this.$body = $(document.body);
    this.$quickCartClose = this.$el.find('[data-quick-cart-toggle]');

    this._bindEvents();
  }

  _bindEvents() {
    $('[data-header-tools-cart]').on('click', '[data-quick-cart-toggle]', (event) => {
      event.preventDefault();
      this._toggle(event);
      this.$body.toggleClass('quick-cart-open');
    });

    $('[data-header-tools-cart]').on('click', '[data-cart-item-remove]', (event) => {
      event.preventDefault();
      this._removeProductQuickCart(event);
    });
  }

  _toggle(event) {
    this.$el.revealer();
    this.$quickCartClose.revealer();
  }

  _update(callback) {
    const $quickCartCount = $('.header-tools-cart-count');

    utils.api.cart.getContent({ template: 'cart/quick-cart-items' }, (err, response) => {
      $('.quick-cart-inner').html(response);

      if (callback) {
        callback();
      }
    });

    utils.api.cart.getContent({ template: 'cart/quick-cart-count' }, (err, response) => {
      $quickCartCount.html(response);

      if (callback) {
        callback();
      }
    });
  }

  _removeProductQuickCart(event) {
    const $el = $(event.currentTarget);
    const itemId = $el.data('product-id');

    if (! itemId) { return; }

    utils.api.cart.itemRemove(itemId, (err, response) => {
      if (response.data.status === 'succeed') {
        this._update();
      } else {
        alert(response.data.errors.join('\n'));
      }
    });
  }
}
