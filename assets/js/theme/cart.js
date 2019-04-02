import PageManager from '../PageManager';
import $ from 'jquery';
import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import GiftWrap from './cart/gift-wrap';
import ShippingEstimator from './cart/shipping-estimator';
import bindCartCodeEvents from './cart/bindCartCodeEvents';

import config from './b2b/config';

export default class Cart extends PageManager {
  constructor() {
    super();
    this.giftWrap = new GiftWrap();
  }

  loaded(next) {
    this.$cartContent = $('[data-cart-content]');
    this.$cartTotals = $('[data-cart-totals]');
    this.bindEvents();

    new ShippingEstimator(this.context, $('[data-shipping-estimator]'));

    if (window.ApplePaySession && $('.dev-environment').length) {
      $(document.body).addClass('apple-pay-supported');
    }

    next();
  }

  // Updates the cart displayed, showing new totals in table and below.
  cartUpdate($target) {
    const itemId = $target.data('cart-itemid');
    const $el = $('#qty-' + itemId);
    const qty = parseInt($el.val(), 10);
    const oldQty = parseInt($el.data('orig-qty'), 10);

    // If quantity set to 0 (or otherwise falsey), confirm removal
    if (!qty) {
      const remove = confirm(Theme.messages.cart.remove_item);
      if (!remove) {
        $el.val(oldQty);
        return;
      }
    }

    // Disable the cart while updates are running...
    this.$cartContent.addClass('deactivated');
    this.$cartTotals.addClass('deactivated');

    utils.api.cart.itemUpdate(itemId, qty, (err, response) => {
      if (response.data.status === 'succeed') {
        // if the quantity is changed "1" from "0", we have to remove the row.
        const remove = (qty === 0);
        this.refreshContent(remove);

        //for bundleb2b
        if (sessionStorage.getItem("bundleb2b_user") && sessionStorage.getItem("bundleb2b_user") != "none") {
          this.updateCatalogPrice(itemId);
        } else {
          this.refreshContent(remove);
        }

      } else {
        $el.val(oldQty);
        // TODO: Better error messages possible? 'out_of_stock' is a bit limiting.
        alert(response.data.errors.join('\n'));
        this.$cartContent.removeClass('deactivated');
        this.$cartTotals.removeClass('deactivated');
      }
    });
  }

  /*-----------------------------------------------------------------*/

  // Reloads the table and footer, then triggers the header update.
  refreshContent(remove) {
    const $cartItemsRows = $('[data-item-row]', this.$cartContent),
      options = {
        template: {
          content: 'cart/content',
          totals: 'cart/footer',
        }
      };

    // Remove last item from cart? Reload
    if (remove && $cartItemsRows.length == 1) {
      return window.location.reload();
    }

    utils.api.cart.getContent(options, (err, response) => {

      this.$cartContent.html(response.content);
      this.$cartTotals.html(response.totals);

      const quantity = $('[data-cart-quantity]', this.$cartContent).data('cart-quantity') || 0;
      this.bindEstimatorEvents();
      this.giftWrap.init();
      this.$cartContent.removeClass('deactivated');
      this.$cartTotals.removeClass('deactivated');
      $('body').trigger('cart-quantity-update');
    });
  }

  bindEstimatorEvents() {
    const $estimatorContainer = $('.shipping-estimator'),
      $estimatorForm = $('.estimator-form');

    $estimatorForm.on('submit', (event) => {
      const params = {
        country_id: $('[name="shipping-country"]', $estimatorForm).val(),
        state_id: $('[name="shipping-state"]', $estimatorForm).val(),
        zip_code: $('[name="shipping-zip"]', $estimatorForm).val()
      };

      event.preventDefault();

      utils.api.cart.getShippingQuotes(params, 'cart/shipping-quotes', (err, response) => {
        $('.shipping-quotes').html(response.content);

        // bind the select button
        $('.select-shipping-quote').on('click', (event) => {
          const $quoteId = $('.shipping-quote:checked').val();

          event.preventDefault();

          utils.api.cart.submitShippingQuote($quoteId, (response) => {
            this.refreshContent();
            // TODO: Not quite working yet. Refresh cart when quote submitted.
          });
        });
      });
    });

    this.$cartTotals.on('click', '.shipping-estimate-show', (event) => {
      event.preventDefault();

      $(event.currentTarget).addClass('hidden');;
      $estimatorContainer.removeClass('hidden');;
      $('.shipping-estimate-hide').removeClass('hidden');;
    });

    this.$cartTotals.on('click', '.shipping-estimate-hide', (event) => {
      event.preventDefault();

      $estimatorContainer.addClass('hidden');;
      $('.shipping-estimate-show').removeClass('hidden');;
      $('.shipping-estimate-hide').addClass('hidden');;
    });
  }

  quantityChangeButtons() {
    const updateRow = _.bind(_.debounce(this.cartUpdate, 750), this);

    this.$cartContent.on('click', '[data-quantity-change] button', (event) => {
      event.preventDefault();

      const $target = $(event.currentTarget);
      const $qtyInput = $target.siblings('input');

      if ($target.data('action') === 'inc') {
        $qtyInput.val(parseInt($qtyInput.val(), 10) + 1);
      } else if ($qtyInput.val() > 0) {
        $qtyInput.val(parseInt($qtyInput.val(), 10) - 1);
      }

      updateRow($qtyInput);
    });
  }

  quantityInputChange() {
    const updateRow = _.bind(_.debounce(this.cartUpdate, 750), this);
    let timer;

    this.$cartContent.on('keyup', '[data-cart-update]', (event) => {
      clearTimeout(timer);

      timer = setTimeout(function() {
        const $target = $(event.currentTarget);
        updateRow($target);
      }, 750);
    });

    $('body').trigger('cart-quantity-update');
  }

  bindEvents() {
    bindCartCodeEvents($('.cart-promo-codes'));
    bindCartCodeEvents($('.cart-gift-certificates'));
    this.bindEstimatorEvents();
    this.quantityChangeButtons();
    this.quantityInputChange();
    this.giftWrap.init();
  }

  // for bundleb2b
  // for simple products
  getVariantIdByProductId(productId) {
    let variantId;

    if (this.catalog_products && this.catalog_products[productId]) {
      const variantSkus = this.catalog_products[productId];
      variantId = variantSkus[0].variant_id;
    }
    return variantId;
  }

  // for bundleb2b
  handlePickListOptions(cartItemObj, cb) {
    const cartItemId = cartItemObj.item_id;
    const product_id = cartItemObj.product_id;
    const variant_id = cartItemObj.variant_id;

    utils.api.productAttributes.configureInCart(cartItemId, {
      template: 'b2b/configure-product-data',
    }, (err, response) => {
      console.log(response.data);

      let selectedPickListOptins = [];

      if (response.data && response.data.options) {
        const options = response.data.options;



        for (let i = 0; i < options.length; i++) {
          const option = options[i];

          if (option.partial == "product-list") {
            const optionValues = option.values;

            for (let j = 0; j < optionValues.length; j++) {
              const optionValue = optionValues[j];

              if (optionValue.selected) {
                selectedPickListOptins.push({
                  "option_id": option.id,
                  "option_value": optionValue.id,
                  "option_data": optionValue.data
                });

              }
            }
          }
        }

        console.log(selectedPickListOptins);
      }

      if (selectedPickListOptins) {
        $.ajax({
          type: "GET",
          url: `${config.apiRootUrl}/productvariants?store_hash=${config.storeHash}&product_id=${product_id}&variant_id=${variant_id}`,
          success: (data) => {
            console.log(data);
            let extras_list = [];


            for (let k = 0; k < selectedPickListOptins.length; k++) {
              let showCustomPrice = true;

              if (data && data.option_list) {
                const options = data.option_list;


                for (let j = 0; j < options.length; j++) {
                  const optionId = options[j].option_id;
                  const optionValue = options[j].option_value;

                  if (optionId == selectedPickListOptins[k].option_id && optionValue == selectedPickListOptins[k].option_value) {
                    showCustomPrice = false;


                  }



                }

                if (showCustomPrice) {
                  const extra_product_id = selectedPickListOptins[k].option_data;
                  const extra_variant_id = this.getVariantIdByProductId(extra_product_id);
                  if (extra_variant_id) {
                    extras_list.push({
                      "extra_product_id": extra_product_id,
                      "extra_variant_id": extra_variant_id
                    });
                  } else {
                    extras_list.push({
                      "extra_product_id": extra_product_id
                    });
                  }

                }
              }

            }

            if (extras_list) {
              cartItemObj.extras_list = _.cloneDeep(extras_list);
            }

            if (cb) {
              cb();
            }


          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log("error", JSON.stringify(jqXHR));
          }
        });
      } else {
        if (cb) {
          cb();
        }

      }


    });

  }

  //for bundleb2b
  updateCatalogPrice(cartItemId, cb) {
    this.$cartContent.addClass('deactivated');
    this.$cartTotals.addClass('deactivated');
    $.ajax({
      type: "GET",
      url: "../api/storefront/carts",
      contentType: "application/json",
      accept: "application/json",
      success: (data) => {
        console.log("cart", data);
        if (data && data.length > 0) {
          const cartId = data[0].id;
          console.log("cartId", cartId);
          //const cartItems = data[0].lineItems.physicalItems;
          const cartItems_all = data[0].lineItems.physicalItems;
          const cartItems = cartItems_all.filter(function(item) {
            return item.parentId == null;
          });

          for (let i = 0; i < cartItems.length; i++) {

            const cartItem = cartItems[i];
            const itemId = cartItem.id;


            if (cartItemId == itemId) {
              const itemProductId = cartItem.productId;
              const itemVariantId = cartItem.variantId;
              const itemQty = cartItem.quantity;
              const gCatalogId = sessionStorage.getItem("catalog_id");

              const cartItemObj = {
                "item_id": itemId,
                "product_id": itemProductId,
                "variant_id": itemVariantId,
                "quantity": itemQty,
                "catalog_id": gCatalogId
              };

              console.log("putdata", JSON.stringify(cartItemObj));

              this.handlePickListOptions(cartItemObj, () => {
                console.log("putdata2", JSON.stringify(cartItemObj));

                const bypass_store_hash = `${config.storeHash}`;

                $.ajax({
                  type: "PUT",
                  url: `${config.apiRootUrl}/cart?store_hash=${bypass_store_hash}&cart_id=${cartId}`,
                  data: JSON.stringify(cartItemObj),
                  success: (data) => {
                    console.log("update price done.");
                    window.location.reload();
                  },
                  error: (jqXHR, textStatus, errorThrown) => {
                    this.$cartContent.removeClass('deactivated');
                    this.$cartTotals.removeClass('deactivated');
                    alert("update catalog price error");
                  }
                });
              });

            }

          }

        } else {
          this.$cartContent.removeClass('deactivated');
          this.$cartTotals.removeClass('deactivated');
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {
        this.$cartContent.removeClass('deactivated');
        this.$cartTotals.removeClass('deactivated');
        console.log("error", JSON.stringify(jqXHR));
      }
    });

  }
}
