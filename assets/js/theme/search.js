import PageManager from '../PageManager';
import FacetedSearch from './components/faceted-search';
import ThemeUtilities from './global/theme-utilities';
import ProductCompare from './global/product-compare';
import Tabs from 'bc-tabs';
import pricesStyle from './b2b/prices-style';

export default class Search extends PageManager {
  constructor() {
    super();

    this.utils = new ThemeUtilities();
  }

  _initializeFacetedSearch() {
    const requestOptions = {
      config: {
        category: {
          shop_by_price: true
        }
      },
      template: {
        productListing: 'search/product-index',
        filters: 'search/filters'
      }
    };

    const options = {
      blocker: '.progress-overlay',
      bodyClass: 'ajax-progress'
    };

    new FacetedSearch(requestOptions, options, (content) => {
      $('.product-grid-filters').html(content.filters);
      $('.product-grid-list').html(content.productListing);

      //for b2b user
      this.handleCatalogProducts();
      if (sessionStorage.getItem("bundleb2b_user") && sessionStorage.getItem("bundleb2b_user") != "none") {
        $(".product-grid-sidebar").hide();
        $(".product-grid-container").removeClass("has-sidebar");
      } else {
        $(".navList-item .product-count").show();
      }
    });
  }

  loaded(next) {
    if ($('.faceted-search').length) {
      this._initializeFacetedSearch();
    }

    if ($('.compare-enabled').length) {
      this.Compare = new ProductCompare();
    }

    //this.tabs = new Tabs;
    const $tabs = $("[data-tabs]");
    $.each($tabs, (index, tab) => {
      if ($(tab).find(".tab-title").length > 0) {
        const $tabTitles = $(tab).find(".tab-title");
        $tabTitles.find(">a").on('click', (event) => {
          event.preventDefault();
          const $target = $(event.target);
          const tabHash = $target.attr("href").replace("#", "");
          $target.parents(".tab-title").addClass("active").siblings(".tab-title").removeClass("active");
          $("#" + tabHash).addClass("active").siblings(".search-tab-content-panel").removeClass("active");
        });

        if ($(tab).find(".tab-title.active").length == 0) {
          $(tab).find(".tab-title").eq(0).addClass("active");
          const tabHash02 = $(tab).find(".tab-title").eq(0).find(">a").attr("href").replace("#", "");
          $("#" + tabHash02).addClass("active").siblings(".search-tab-content-panel").removeClass("active");
        }

      }
    });

    //for b2b user
    if (sessionStorage.getItem("bundleb2b_user") && sessionStorage.getItem("bundleb2b_user") != "none") {
      $(".body").addClass("b2b-products");
      $(".product-grid-sidebar").hide();
      $(".product-grid-container").removeClass("has-sidebar");
    } else {
      $(".navList-item .product-count").show();
    }
  }

  //for b2b
  handleCatalogProducts() {
    const catalog_products = JSON.parse(sessionStorage.getItem("catalog_products"));
    const products = $(".product");

    for (var product_id in catalog_products) {

      const productSelector = `[catalog-product-${product_id}]`;
      if ($(`${productSelector}`).length > 0) {

        $(`${productSelector}`).attr("catalog-product", "true");

        let base_price = $(`${productSelector}`).find(".price.price--withTax").text().replace("$", "").replace(",", "") || $(`${productSelector}`).find(".price.price--withoutTax").text().replace("$", "").replace(",", "");
        let tier_price;
        let catalog_price;
        const variantArr = catalog_products[product_id] || [];
        if (variantArr.length == 1) {
          tier_price = variantArr[0].tier_price || [];
          catalog_price = this.getCatalogPrice(base_price, tier_price, 1);
        }
        if (catalog_price) {
          $(`${productSelector}`).find(".price.price--withoutTax").text("$" + pricesStyle(catalog_price, 2));
          $(`${productSelector}`).find(".price.price--withTax").text("$" + pricesStyle(catalog_price, 2));
        }
      }
    }

    //product Gallery, for listing page
    const $productGallery = $("[b2b-products-gallery]");
    $productGallery.each(function() {
      const catalogProductCount = $(this).find('[catalog-product="true"]').length;
      if (catalogProductCount == 0) {
        $("[catalog-listing-wrap]").show();
        $(this).parents(".page").html("We can't find products matching the selection.");
      } else {
        $("[catalog-listing-wrap]").show();
        const $catalogProductCounter = $("[data-catalog-product-counter]");
        if ($catalogProductCounter.length > 0) {
          $catalogProductCounter.text(catalogProductCount);
        }
      }
    });

  }

  //for bundleb2b
  getCatalogPrice(base_price, tier_price_array, qty) {
    //let tier_price = base_price;
    let tier_price = base_price;

    for (let j = 0; j < tier_price_array.length; j++) {
      const type = tier_price_array[j].type;
      const base_qty = tier_price_array[j].qty;
      const price = tier_price_array[j].price;

      if (qty >= base_qty) {
        if (type == "fixed") {
          tier_price = price;

        } else {
          tier_price = base_price - base_price * price / 100;
        }
      }
    }
    return tier_price;
  }
}
