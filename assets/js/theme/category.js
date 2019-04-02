import PageManager from '../PageManager';
import FacetedSearch from './components/faceted-search';
import ThemeUtilities from './global/theme-utilities';
import ProductCompare from './global/product-compare';

import config from './b2b/config';
import './b2b/tools/jqPaginator.js';
import pricesStyle from './b2b/prices-style';

export default class Category extends PageManager {
  constructor() {
    super();

    this.utils = new ThemeUtilities();
  }

  loaded(next) {
    if ($('.faceted-search').length) {
      this._initializeFacetedSearch();
    }

    if ($('.compare-enabled').length) {
      this.Compare = new ProductCompare();
    }

    this.initB2bFeature();
  }

  _initializeFacetedSearch() {
    const requestOptions = {
      config: {
        category: {
          shop_by_price: true
        }
      },
      template: {
        productListing: 'category/product-index',
        filters: 'category/filters'
      }
    };

    const options = {
      blocker: '.progress-overlay',
      bodyClass: 'ajax-progress'
    };

    new FacetedSearch(requestOptions, options, (content) => {


      if (sessionStorage.getItem("bundleb2b_user") && sessionStorage.getItem("bundleb2b_user") != "none") {
        $(".product-grid-container").removeClass("has-sidebar");
      } else {
        $('.product-grid-filters').html(content.filters);
      }
      $('.product-grid-list').html(content.productListing);
    });
  }

  // for bundleb2b
  initB2bFeature() {
    if (sessionStorage.getItem("bundleb2b_user") && sessionStorage.getItem("bundleb2b_user") != "none") {
      const page_templete = this.context.page_templete.replace(/\\/g, '/');
      if (page_templete == 'pages/custom/category/resources-category') {
        return;
      }

      $(".product-grid-list [b2b-products-gallery]").empty();
      $(".pagination").hide();

      this.catalogProducts = JSON.parse(sessionStorage.getItem("catalog_products") || "{}");

      if (sessionStorage.getItem("catalog_id")) {
        $(".product-grid-list").append(`<div class="pagination">
                <ul class="pagination-list" id="jqPagination"></ul>
                </div>`);
        this.getAllProductsApi();
        //this.getAllProducts();
      } else {
        $(".catalog-listing-wrap").html("We can't find products matching the selection.");
      }

      //category page sidebar
      $(".product-grid-sidebar").hide();
      $(".product-grid-container").removeClass("has-sidebar");
    }
  }

  // for bundleb2b
  renderTable(start, end, categoryProducts) {
    let productsHtml = "";
    for (let j = start; j < end; j++) {
      const product = categoryProducts[j];

      let base_price = product.base_price;
      let tier_price;
      let catalog_price = base_price;
      const product_id = product.product_id;
      const variantArr = this.catalogProducts[product_id] || [];
      if (variantArr.length == 1) {
        tier_price = variantArr[0].tier_price || [];
        catalog_price = this.getCatalogPrice(base_price, tier_price, 1);
      }

      catalog_price = parseFloat(catalog_price).toFixed(2);


      productsHtml += `<article class="product-grid-item">
                            
                                <figure class="product-grid-item-thumbnail cropped-thumbnail aspect-three-by-two">
                                        <a class="cropped-thumbnail-block" href="${product.product_url}" style="background-image:url('${product.primary_image.standard_url}');">
                                            
                                          <img src="${product.primary_image.standard_url}" alt="${product.product_name}" title="${product.product_name}">
                                            
                                        </a>
                                        
                        
                                </figure>
                                <div class="product-grid-item-details">
                                     <h3 class="product-item-title">
                                            <a href="${product.product_url}">${product.product_name}</a>
                                    </h3>
                                    <div class="product-grid-item-price">
                                      <div class="product-price" itemprop="offers" itemscope="" itemtype="http://schema.org/Offer">
                                        <span class="price-without-tax">
                                          <span data-product-price-wrapper="without-tax">
                                            <span data-product-price="">
                                              $${pricesStyle(catalog_price, 2)}
                                            </span>
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                </div>
                            
                        </article>`;

    }

    if (productsHtml) {
      $(".product-grid-list [b2b-products-gallery]").html(productsHtml);

    } else {
      $(".product-grid-container").empty();
    }

  }

  // for bundleb2b
  getAllProductsApi() {
    const categoryId = this.context.categoryId;
    const catalogId = sessionStorage.getItem("catalog_id");
    const catalogProducts = JSON.parse(sessionStorage.getItem("catalog_products") || "{}");
    let categoryProducts = [];
    //url = `https://fl4mq0bm40.execute-api.us-west-2.amazonaws.com/prod/categoryproducts?id=7120300914635706856&category_id=43`;
    $.ajax({
      type: "GET",
      url: `${config.apiRootUrl}/categoryproducts?id=${catalogId}&category_id=${categoryId}`,
      success: (data) => {
        debugger

        console.log("category products", data);
        if (data && data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            if (catalogProducts[data[i].product_id]) {
              categoryProducts.push(data[i]);
            }
          }

          const productsPerPage = this.context.categoryProductsPerPage;
          const productsNum = categoryProducts.length;
          const totalPage = Math.ceil(productsNum / productsPerPage);
          if (productsNum > productsPerPage) {
            $("#jqPagination").jqPaginator({
              totalPages: totalPage,
              visiblePages: 10,
              currentPage: 1,
              onPageChange: (num, type) => {
                const start = (num - 1) * productsPerPage;
                const end = (num * productsPerPage > productsNum) ? productsNum : num * productsPerPage;
                this.renderTable(start, end, categoryProducts);
              }
            });
          } else {
            this.renderTable(0, productsNum, categoryProducts);
            //$("#jqPagination").jqPaginator('destroy');
            $("#jqPagination").html("");
          }

        }



      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("error", JSON.stringify(jqXHR));
      }
    });
  }

  // for bundleb2b
  getAllProducts() {


    const paginations = this.context.paginationCategory || [];
    if (paginations) {

      for (let i = 1; i < paginations.length; i++) {

        const formatUrl = paginations[i].url;

        const productsPerPage = this.context.categoryProductsPerPage;

        const requestOptions = {
          config: {
            category: {
              shop_by_price: true,
              products: {
                limit: productsPerPage,
              },
            },
          },
          template: 'b2b/catalog-product-listing'


        };
        api.getPage(formatUrl, requestOptions, (err, content) => {

          const $listing = $(content);

          if (err) {
            throw new Error(err);
          }

          // Refresh view with new content
          console.log($listing);
        });

      }

    }


  }

  // for bundleb2b
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
