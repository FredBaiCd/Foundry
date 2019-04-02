import $ from 'jquery';
import _ from 'lodash';
import PageManager from '../PageManager';
import ProductUtils from './product/product-utils';
import priceTemplates from './product/priceTemplates';
import FormValidator from './components/FormValidator';
import ProductImages from './product/ProductImages';
import ProductBulkPricing from './product/bulk-pricing';
import ProductReviews from './product/reviews';
import Tabs from 'bc-tabs';
import dmCustom from './product/dm-custom';
import loading from './components/loading';

export default class Product extends PageManager {
  constructor() {
    super();

    this.el = '[data-product-container]';
    this.$el = $(this.el);

    new ProductBulkPricing();
    //new Tabs();
  }

  loaded() {
    debugger
    new ProductReviews(this.context);
    this.images = new ProductImages($('.single-product-slideshow'), this.context);

    this.ProductUtils = new ProductUtils(this.el, {
      priceWithoutTaxTemplate: priceTemplates.withoutTax,
      priceWithTaxTemplate: priceTemplates.withTax,
      priceSavedTemplate: priceTemplates.saved,
      callbacks: {
        willUpdate: () => loading(this.$el, true),
        didUpdate: () => loading(this.$el, true),
        switchImage: _.bind(this.images.newImage, this.images),
      },
    }, this.context).init(this.context);

    dmCustom();

    const $tabs = $("[data-tabs]");
    $.each($tabs, (index, tab) => {
      if ($(tab).find(".tab-title").length > 0) {
        const $tabTitles = $(tab).find(".tab-title");
        $tabTitles.find(">a").on('click', (event) => {
          event.preventDefault();
          const $target = $(event.target);
          const tabHash = $target.attr("href").replace("#", "");
          $target.parents(".tab-title").addClass("active").siblings(".tab-title").removeClass("active");
          $("#" + tabHash).addClass("active").siblings(".tabs-content-panel").removeClass("active");
        });

        if ($(tab).find(".tab-title.active").length == 0) {
          $(tab).find(".tab-title").eq(0).addClass("active");
          const tabHash02 = $(tab).find(".tab-title").eq(0).find(">a").attr("href").replace("#", "");
          $("#" + tabHash02).addClass("active").siblings(".tabs-content-panel").removeClass("active");
        }

      }
    });

    $("body").on('click', '[data-dropdown]', (event) => {
      debugger
      event.preventDefault();
      const $target = $(event.currentTarget);
      const dropdownMenuId = $target.attr('data-dropdown');
      const $dropdownMenu = $(`#${dropdownMenuId}`);
      $dropdownMenu.toggleClass("is-open");
    });
  }
}
