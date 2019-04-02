import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import refreshContent from './refreshContent';
import Alert from '../components/Alert';
import updateState from '../core/updateState';
import SelectWrapper from '../components/SelectWrapper';

export default class ShippingCalculator {
  constructor(el, options) {
    this.$el = $(el);

    this.options = $.extend({
      context: {},
      scope: $('[data-cart-totals]'),
      visibleClass: 'visible',
    }, options);

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
    }, options.callbacks);

    this.ShippingAlerts = new Alert($('[data-cart-shipping]'));

    updateState(true, this.selectWrapCallback);

    this._bindEvents();

  }

  _bindEvents() {
    this.options.scope.on('click', '[data-shipping-estimator-toggle]', (event) => {
      event.preventDefault();
      this._toggle(event);
    });

    this.options.scope.on('submit', '[data-shipping-estimator] form', (event) => {
      event.preventDefault();
      this._calculateShipping();
    });

  }

  selectWrapCallback($selectEl) {
    new SelectWrapper($selectEl);
  }

  _toggle(event) {
    const $target = $(event.currentTarget);
    const $calculator = $('[data-shipping-estimator]', this.options.scope);
    $calculator.toggleClass(this.options.visibleClass);
  }

  _calculateShipping() {
    this.callbacks.willUpdate();

    let params = {
      country_id: $('[name="shipping-country"]', this.options.scope).val(),
      state_id: $('[name="shipping-state"]', this.options.scope).val(),
      zip_code: $('[name="shipping-zip"]', this.options.scope).val()
    };

    utils.api.cart.getShippingQuotes(params, 'cart/shipping-quotes', (err, response) => {
      const $shippingQuotes = $('[data-shipping-quotes]');
      if (response.data.quotes) {
        this.ShippingAlerts.clear();
        $shippingQuotes.html(response.content);
      } else {
        this.ShippingAlerts.error(response.data.errors.join('\n'));
      }

      this.callbacks.didUpdate();

      // bind the select button
      $shippingQuotes.find('.button').on('click', (event) => {
        event.preventDefault();

        this.callbacks.willUpdate();

        const quoteId = $('[data-shipping-quote]:checked').val();

        utils.api.cart.submitShippingQuote(quoteId, (response) => {
          refreshContent(this.callbacks.didUpdate);
        });
      });
    });
  }
}
