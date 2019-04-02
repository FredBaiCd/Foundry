import $ from 'jquery';
import PageManager from '../PageManager';
import utils from '@bigcommerce/stencil-utils';
import ThemeInit from './global/theme-init';
import Navigation from './components/navigation';
import SelectWrapper from './components/SelectWrapper';
import HeaderTools from './global/header-tools';
import CurrencySelector from './global/currency-selector';
import QuickShop from './product/QuickShop';
import updateCartPreview from './global/update-cart-preview';
import dismissable from './core/alertDismissable';
import scrollReveal from 'scrollreveal';
import FormValidator from './components/FormValidator';
import FileUploadWrapper from './components/FileUploadWrapper';
import validetta from 'validetta';
// for bundleb2b
import b2b from './b2b';

export default class Global extends PageManager {
  constructor() {
    super();

    new Navigation($('.navigation'));
    new HeaderTools($('.header-tools'));
    new CurrencySelector($('.currency-selector'));
    new CurrencySelector($('.mobile-currency-selector'));

    const $select = $('select');
    if ($select.length) {
      $select.each((i, el) => {
        new SelectWrapper(el);
      });
    }
  }

  loaded(next) {
    this.validator = new FormValidator(this.context);
    this.validator.initGlobal();

    // bind click on dismissable alerts
    dismissable();

    updateCartPreview();

    const $quickShop = $('[data-quick-shop-trigger]');
    if ($quickShop.length) {
      new QuickShop('[data-quick-shop]', this.context);
    }

    const $upload = $('.form-field-file input');
    if ($upload.length) {
      $upload.each((i, el) => {
        new FileUploadWrapper(el, this.context).updateFilename();
      });
    }

    // for bundleb2b
    b2b.call(this);

    next();
  }
}
