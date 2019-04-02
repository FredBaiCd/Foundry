import $ from 'jquery';
import Modal from 'bc-modal';

export default class ProductReviews {
  constructor(context) {
    this.context = context;

    this.reviewModal = new Modal({
      el: $('#modal-review-form'),
      modalClass: 'write-review-form',
      afterShow: ($modal) => {
        const $form = $modal.find('#form-leave-a-review');
      },
    });

    this._bindEvents();
  }

  _bindEvents() {
    $('.review-link').click((event) => {
      event.preventDefault();
      this.reviewModal.open();
    });
  }
}
