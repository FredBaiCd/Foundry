import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils'
import Modal from 'bc-modal';

export default class BulkPricing {
  constructor() {
    this.bulkPricingModal = new Modal({
      el: $('#product-bulk-pricing-modal'),
    });

    this._bindEvents();
  }

  _bindEvents() {
    $('.product-bulk-pricing-toggle').click((event) => {
      event.preventDefault();
      this.bulkPricingModal.open();
    });
  }

}
