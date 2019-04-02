import $ from 'jquery';

export default class HeaderTools {
  constructor(el) {
    this.$el = $(el);
    this.$body = $(document.body);

    this._bindEvents();
  }

  _bindEvents() {
    this.$el.find('.search-toggle').on('click', (event) => {
      event.preventDefault();
      this._toggleSearch(event);
      event.stopPropagation();

      if (this.$el.find('.cart-preview-trigger').parent().hasClass('visible')) {
        this._toggleCartPreview(event);
      }
    });

    this.$body.on('click', (event) => {
      if (this.$el.find('.search-form-wrapper').hasClass('visible')) {
        this._toggleSearch(event);
      }
    });

    this.$el.find('.search-submit').on('click', (event) => {
      event.stopPropagation();
    });

    this.$el.on('keyup', '.search-input', (event) => {
      if (event.keyCode == 27) {
        event.preventDefault();
        this._toggleSearch(event);
      }
    });

    this.$el.find('.cart-preview-trigger').on('click', (event) => {
      event.preventDefault();
      this._toggleCartPreview(event);

      if (this.$el.find('.search-form-wrapper').hasClass('visible')) {
        this._toggleSearch(event);
      }
    });

    this.$el.on('keyup', '.cart-preview-trigger', (event) => {
      if (event.keyCode == 27) {
        event.preventDefault();
        this._toggleCartPreview(event);
      }
    });
  }

  _toggleSearch(event) {
    event.preventDefault();
    this.$el.find('.search-form-wrapper').toggleClass('visible');
    this.$el.find('.search-input').focus();
    this.$el.find('.search-toggle > a').toggleClass('hidden');
  }

  _toggleCartPreview(event) {
    event.preventDefault();
    this.$el.find('.cart-preview-trigger').parent().toggleClass('visible');
    this.$el.find('.cart-preview-wrap').toggleClass('visible');
  }
}
