import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import SelectWrapper from '../components/SelectWrapper';

export default class GiftWrap {
  constructor() {
    this.init();
  }

  init() {
    this.$form = $('.gift-wrap-form');
    this.$select = this.$form.find('select');
    this.$toggle = $('.item-gift-wrap-toggle');

    this._bindEvents();
  }

  _bindEvents() {
    this.$toggle.on('click', (event) => {
      event.preventDefault();
      this._showForm(event);
    });

    this.$select.change((event) => {
      this._toggleGiftWrapDetails(event);
    });

    $('[name="giftwraptype"]').on('click', (event) => {
      this._toggleViews(event);
    });
  }

  _showForm(event) {
    const $target = $(event.currentTarget);
    const itemId = $target.data('item-gift-wrap');
    const options = { template: 'cart/item-gift-wrap-form' };

    utils.api.cart.getItemGiftWrappingOptions(itemId, options, (err, response) => {
      $('.gift-wrap-form').remove();
      $('.item-gift-wrap-add').addClass('visible');
      $(`.gift-wrap-form-wrapper[data-item-id=${itemId}]`).html(response.content);
      $target.removeClass('visible');

      this.init();

      const $select = $('select');
      if ($select.length) {
        $select.each((i, el) => {
          new SelectWrapper(el);
        });
      }
    });
  }

  _toggleGiftWrapDetails(event, $el) {
    const $select = (event) ? $(event.currentTarget) : $el;
    const $option = $select.find('option:selected');
    const index = $select.data('index');
    const id = $select.val();

    const wrapping = {
      field: $select.closest('.form-field'),
      message: id ? $option.data('allow-message') : false
    }

    if (wrapping.message) {
      wrapping.field.siblings(`[data-gift-wrap-message=${index}]`).addClass('visible');
    } else {
      wrapping.field.siblings(`[data-gift-wrap-message=${index}]`).removeClass('visible');
    }

    $(`[data-giftwrap-image-${index}]`).removeClass('visible');
    $(`[data-giftwrap-image-${index}="${id}"]`).addClass('visible');
  }

  _toggleViews(event) {
    const $target = $(event.currentTarget);
    const $targetContainer = $target.closest('.gift-wrap-form');
    const value = $targetContainer.find('input:radio[name="giftwraptype"]:checked').val();
    const $singleForm = $targetContainer.find('.gift-wrap-single');
    const $multiForm = $targetContainer.find('.gift-wrap-multiple');

    if (value === 'same') {
      $singleForm.addClass('visible');
      $multiForm.removeClass('visible');
    }  else {
      $singleForm.removeClass('visible');
      $multiForm.addClass('visible');
    }
  }
}
