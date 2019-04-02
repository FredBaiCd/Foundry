import $ from 'jquery';

export default class OverlayUtils {
  constructor() {
    this.$body = $(document.body);
    this.$pageLoader = $('.page-loading');
  }

  show() {
    this.$body.addClass('scroll-locked');
    this.$pageLoader.addClass('visible');
  }

  hide() {
    this.$body.removeClass('scroll-locked');
    this.$pageLoader.removeClass('visible');
  }
}
