import $ from 'jquery';
import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import imagesLoaded from 'imagesloaded';
import trend from 'jquery-trend';
import ProductUtils from './product-utils';
import ProductImages from './ProductImages';
import priceTemplates from './priceTemplates';
import SelectWrapper from '../components/SelectWrapper';
import FileUploadWrapper from '../components/FileUploadWrapper';
import loading from '../components/loading';
import FormValidator from '../components/FormValidator';

export default class QuickShop {
  constructor(el, context) {
    this.$el = $(el);
    this.context = context;
    this.$body = $(document.body);
    this.$scope = $('[data-quickshop]');
    this.$quickShopClose = $('[data-quick-shop-close]');
    this.$quickShopWrapper = $('[data-quick-shop-wrapper]');
    this.$quickShop = this.$quickShopWrapper.children('[data-quick-shop]');
    this.clickedOnModal = false;

    this._bindEvents();
  }

  _bindEvents() {
    this.$scope.on('click', '[data-quick-shop-trigger]', (event) => {
      event.preventDefault();
      this._open(event);
    });

    this.$body.on('keyup', this.$quickShopWrapper, (event) => {
      if (event.keyCode == 27) {
        event.preventDefault();
        this._close(event);
      }
    });

    this.$quickShopClose.on('click', (event) => {
      this._close(event);
    });

    this.$quickShopWrapper.on('click', (event) => {
      if ($(event.target).is(this.$quickShopWrapper)) {
        this._close(event);
      }
    });
  }

  _open(event) {
    const productId = $(event.currentTarget).data('quick-shop-trigger');

    loading();

    this.$body.addClass('scroll-locked');
    this.$quickShopWrapper.addClass('visible');

    utils.api.product.getById(productId, {
      template: 'products/quick-shop'
    }, (err, response) => {
      if (response) {
        this.$quickShop.html(response);

        this.images = new ProductImages($('.single-product-slideshow'), this.context);

        // for bundleb2b
        handleRoleId();

        this.ProductUtils = new ProductUtils(this.$quickShop, {
          priceWithoutTaxTemplate: priceTemplates.withoutTax,
          priceWithTaxTemplate: priceTemplates.withTax,
          priceSavedTemplate: priceTemplates.saved,
          callbacks: {
            willUpdate: () => {
              loading();
              this.$quickShop.toggleClass('is-loading');
            },
            didUpdate: () => {
              loading();
              this.$quickShop.toggleClass('is-loading');
            },
            switchImage: _.bind(this.images.newImage, this.images),
          },
        }).init(this.context);

        const $select = this.$quickShop.find('select');
        if ($select.length) {
          $select.each((i, el) => {
            new SelectWrapper(el);
          });
        }

        const $file = this.$quickShop.find('.form-file');
        if ($file.length) {
          $file.each((i, el) => {
            new FileUploadWrapper(el, this.context).updateFilename();
          });
        }
      } else {
        alert(err);
      }

      imagesLoaded(this.$quickShop[0], () => {
        new FormValidator(this.context).initGlobal();
        new ProductImages(this.$scope);

        this.$quickShop.addClass('visible');
        loading();
      });
    });

    // for bundleb2b
    const handleRoleId = function() {
      if (sessionStorage.getItem("bundleb2b_user") && sessionStorage.getItem("bundleb2b_user") != "none") {
        const bundleb2b_user = JSON.parse(sessionStorage.getItem("bundleb2b_user"));
        if (bundleb2b_user.role_id == "0") {
          $("#form-action-addToCart").hide();
          console.log("Junior User");
        } else if (bundleb2b_user.role_id == "1" || bundleb2b_user.role_id == "2") {
          console.log("Admin User");
        }
      }
    }
  }

  _close(event) {
    const $target = $(event.target);

    this.$quickShopWrapper.removeClass('visible').one('trend', () => {
      this.$quickShop
        .off('click', '[data-product-quantity-change]')
        .off('change', '[data-product-option-change]');
      this.$body.removeClass('scroll-locked');
      this.$quickShopWrapper.add(this.$quickShop).removeClass('visible');
      this.$quickShop.empty();
    });
  }

  _switchImage(event, imageHighRes) {
    const $mainImage = $('.single-product-slideshow-image');
    imageHighRes = event ? $(event.currentTarget).data('high-res') : imageHighRes;
    $mainImage.attr('src', imageHighRes);
  }
}
