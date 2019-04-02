import $ from 'jquery';
import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';

export default class ProductCompare {
  constructor() {
    this.compareActive = false;
    this.maxItems = 4;

    this.compareIndex = []; // ordered array of product ids
    this.compareItems = {}; // object of currently selected products

    this.$compareTab = $('#compare-tab');
    this.$compareItemsWrapper = $('#compare-items-wrapper');
    this.$compareSubmit = $('.compare-submit');

    this.itemTemplate = _.template(`
      <article class="compare-product-item">
        <a class="compare-tab-item-remove" data-remove-id="<%= id %>"><i class="icon-close"></i></a>
        <figure class="compare-product-item-thumbnail">
          <a style="background-image:url(<%= img %>);">
            <img src="<%= img %>">
          </a>
        </figure>
        <div class="compare-product-item-details">
          <h3 class="compare-product-item-title">
            <a href="#" title="<%= title %>">
              <%= title %>
            </a>
          </h3>
          <div class="compare-product-item-price">
            <%= price %>
          </div>
        </div>
      </article>
    `);

    this._bindEvents();
  }

  _bindEvents() {
    // remove item on checkbox change
    $('[data-product-compare]').on('change', (event) => {
      // cancel if it's not a checkbox that triggered the change event
      if (event.target.type !== 'checkbox') { return; }

      const $checkbox   = $(event.target);
      const $product    = $checkbox.closest('.product-grid-item');
      const productId   = parseInt($checkbox.val(), 10);
      const productData = this._getProductData($product, productId);

      if (productId in this.compareItems) {
        this._removeCompareItemById(productId);
      } else {
        this._addCompareItem(productData);

        // if we're at the max number of items, remove the first item
        if (this.compareIndex.length > this.maxItems) {
          this._removeCompareItemByIndex(0);
        }
      }

      this._updateCompareState();
    });

    // remove item from click within tab
    this.$compareItemsWrapper.on('click', '.compare-tab-item-remove', (event) => {
      event.preventDefault();
      const productId = parseInt($(event.currentTarget).data('remove-id'), 10);

      this._removeCompareItemById(productId);
      this._updateCompareState();
    });

    // remove all items
    this.$compareTab.on('click', '.clear-compare', (event) => {
      event.preventDefault();

      this._removeAllItems();
    });

    // clear out compared items when tab is hidden
    this.$compareTab.on('revealer-hide', () => {
      this.$compareItemsWrapper.empty();
    });
  }

  /**
   * create an object of relevant product data from grid element.
   * @param $product {jQuery} - grid item object
   * @param productId {number} - ID of product
   * @returns {object}
   */
  _getProductData($product, productId) {
    return {
      id: productId,
      img: $product.find('.product-grid-item-thumbnail img').attr('src'),
      title: $product.find('.product-item-title a').text(),
      price: $product.find('.product-grid-item-price').html()
    };
  }


  // ---------------------- Handle popup compare tab changes --------------------- //

  /**
   * Decide what to do with the compare tab on each update
   */
  _updateCompareState() {
    if (!this.compareActive) {
      this._initCompare();
    } else if (this.compareIndex.length === 0) {
      this._destroyCompare();
    } else {
      this._refreshCompare();
    }
  }

  /**
   * Show compare tab
   */
  _initCompare() {
    this.compareActive = true;
    this._refreshCompare();
    this.$compareTab.revealer('show');
  }

  /**
   * Hide compare tab
   */
  _destroyCompare() {
    this.$compareTab.revealer('hide');
    this.compareActive = false;
  }

  /**
   * Regenerate markup based on currently active items
   */
  _refreshCompare() {
    const items = [];
    this.compareIndex.forEach((id) => {
      items.push(this.itemTemplate(this.compareItems[id]));
    });

    // enable/disable button
    this.$compareSubmit.attr('disabled', this.compareIndex.length < 2);

    this.$compareItemsWrapper.html(items.join(''));
  }


  // ---------------------- Adding & removing compare items --------------------- //

  /**
   * append product to end of compared products list
   * @param productData {object} - object containing product id, title and image
   */
  _addCompareItem(productData) {
    this.compareIndex.push(productData.id);
    this.compareItems[productData.id] = productData;
  }

  /**
   * remove product from compared products list
   * @param productId {number} - ID of product we want to remove
   */
  _removeCompareItemById(productId) {
    _.pull(this.compareIndex, productId);
    delete this.compareItems[productId];

    this._uncheckCompare(productId);
  }

  /**
   * remove product from compared products list
   * @param index {number} - index within compared product list of product we want to remove
   */
  _removeCompareItemByIndex(index) {
    const productId = this.compareIndex[index];
    this.compareIndex.splice(index, 1);
    delete this.compareItems[productId];

    this._uncheckCompare(productId);
  }

  /**
   * Remove all items from compare tab and reset to default state
   *
   */
  _removeAllItems() {
    this.compareIndex.forEach((id) => {
      this._uncheckCompare(id);
    });

    this.compareIndex = [];
    this.compareItems = {};

    this._updateCompareState();
  }

  /**
   * Uncheck a compare checkbox
   * @param id {number} - id of product within grid to be unchecked
   */
  _uncheckCompare(id) {
    $(`#compare-${id}`).prop('checked', false);
  }
}
