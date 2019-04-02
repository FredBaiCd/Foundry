import utils from '@bigcommerce/stencil-utils';
import PageManager from '../../PageManager';

export default class CurrencySelector extends PageManager {

  constructor(el) {
    super();
    this.$el = $(el);
    this._bindEvents();
  }

  _bindEvents() {
    this.$el.on('change', () => {
      this._updateCurrency();
    });
  }

  _updateCurrency() {
    let newCurrency = this.$el.val();
    window.location = newCurrency;
  }
};
