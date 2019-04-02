import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import initFormSwatch from '../core/formSelectedValue';
import config from '../b2b/config';
/*import swal from 'sweetalert2';*/
import pricesStyle from '../b2b/prices-style';

export default class ProductUtils {
  constructor(el, options, context) {
    this.el = el;
    this.$el = $(el);
    this.productId = this.$el.find('[data-product-id]').val();
    this.$productMessage = this.$el.find('[data-product-message]');

    this.options = $.extend({
      buttonDisabledClass: 'disabled',
    }, options);

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
      switchImage: () => console.log('Image switch attempted.'),
    }, this.options.callbacks);

    this._bindEvents();

    //for bundleb2b
    const $scope = this.$el;
    this.context = context;
    //this.$productViewPrice = $(".productView-price", $scope);
    this.$productViewPrice = $(".product-price [data-product-price]", $scope);

    this.$overlay_b2b = $("#b2b_loading_overlay", $scope);
    this.$overlay_product = $("#product_loading_overlay", $scope);
    this.$wishlistContainer = $("[data-wishlist-add]", $scope);
    this.$shoppinglistContainer = $("[data-shoppinglist-add]", $scope);
    this.catalog_products = JSON.parse(sessionStorage.getItem("catalog_products"));
    this.$tierPriceContainer = $("[tier-price-container]", $scope);
    this.gTierPrice = {};
    this.gMasterPrcie;
    this.gPriceSymbol = "$";
    this.bypass_company_id;
    this.gRoleId;

    if (sessionStorage.getItem("bundleb2b_user") && sessionStorage.getItem("bundleb2b_user") != "none") {

      const bundleb2b_user = JSON.parse(sessionStorage.getItem("bundleb2b_user"));
      this.gRoleId = bundleb2b_user.role_id;
      this.bypass_company_id = bundleb2b_user.company_id;

      const $product_sku = $("[data-product-sku]", $scope);
      if ($product_sku.length > 0) {
        const current_sku = $product_sku.text().trim();
        /*const $price = $("[data-product-price-without-tax]", $scope) || $("[data-product-price-with-tax]", $scope);
        const base_price = $price.text().trim();
        const base_price_symbol = base_price.substring(0, 1);
        const base_price_value = base_price.replace("$", "");*/
        const base_price_value = this.getMainProductBasePrice();
        console.log(base_price_value);
        this.updateTierPriceRange(current_sku, base_price_value);
        const tierPriceValue = this.getMainProductTierPrice(current_sku, 1);
        if (tierPriceValue) {
          this.setProductPriceText(tierPriceValue);
          this.gMasterPrcie = tierPriceValue;
          //this.$overlay_product.hide();
          this.$productViewPrice.css("visibility", "visible");
        }

      }

      this.getLists();

      /*$form.on('submit', event => {
        this.addProductToCartB2B(event, $form[0]);
      });*/

      this.initProductListOptionPrice();

    } else {
      this.$wishlistContainer.show();
      //this.$overlay_product.hide();
      this.$productViewPrice.css("visibility", "visible");

      /*$form.on('submit', event => {
        this.addProductToCartDefault(event, $form[0]);
      });*/

    }

    //for bundleb2b
    this.$el.on('click', '[add-to-list]', (event) => {

      const $target = $(event.target);
      const listDataString = $target.attr("data-list-data").replace(/&#39/g, "'");
      const listData = JSON.parse(listDataString);
      const listID = $target.attr("data-list-id");
      const listStatus = $target.attr("data-list-status");

      //const form = $('form[data-cart-item-add]', this.$scope)[0];
      const form = this.$el.find('[data-product-form]')[0];
      const $form = $(form);
      const formData = this.filterEmptyFilesFromForm(new FormData(form));

      let option_label = {};
      const $textLabel = $("[data-label-name]", this.$scope);
      if ($textLabel.length > 0) {
        $textLabel.each(function() {
          const $item = $(this);
          const label_name = $item.attr("data-label-name");
          let option_value = $item.attr("name");
          option_value = option_value.replace("[", "").replace("]", "");
          option_label[option_value] = label_name;
        });
      }

      const options_list = [];
      for (let item of formData) {
        console.log(item);
        if (item[0].indexOf("attribute") != -1 && item[1] != "") {
          const optionObj = {
            "option_id": item[0],
            "option_value": item[1]
          }

          /*const label_name = item[0].replace("[", "").replace("]", "");
          if (option_label[label_name]) {
              optionObj.option_label = option_label[label_name];
          }*/

          options_list.push(optionObj);
        }
      }


      let variant_id;
      const product_id = $("input[name=product_id]", this.$scope).val();
      const product_quantity = $(`input[name="qty[]"`).val();

      const product_variant_sku = $("[data-product-sku]", this.$scope).text().trim();

      const variants = this.catalog_products[product_id] || [];
      for (var i = 0; i < variants.length; i++) {
        if (variants[i].variant_sku.toLowerCase() == product_variant_sku.toLowerCase()) {
          variant_id = variants[i].variant_id;
        }
      }
      if (!variant_id) {
        alert("This product or option has no variant id");
        return;
      }



      const checkNum = /^[1-9]\d*$/;
      if (!checkNum.test(product_quantity)) {
        alert("Please enter a valid quantity");
        return;
      }

      const bypass_store_hash = `${config.storeHash}`;
      const bypass_email = this.context.customer.email;
      const bypass_customer_id = this.context.customer.id;

      let postData = {
        "store_hash": listData.store_hash,
        "company_id": listData.company_id,
        "customer_id": listData.customer_id,
        "name": listData.name,
        "description": listData.description,
        "status": listData.status,
        "products": listData.products

      };

      //if has duplicated products
      let isExist = false;
      //const products_arr = listData.products;
      const products_arr_new = _.cloneDeep(listData.products) || [];
      let products_arr = [];
      for (let i = 0; i < products_arr_new.length; i++) {
        products_arr.push({
          "product_id": products_arr_new[i].product_id,
          "variant_id": products_arr_new[i].variant_id,
          "qty": products_arr_new[i].qty,
          "options_list": products_arr_new[i].options_list
        });
      }
      for (let i = 0; i < products_arr.length; i++) {
        const sameOption = (JSON.stringify(options_list) == JSON.stringify(products_arr[i].options_list));
        if (products_arr[i].product_id == product_id && products_arr[i].variant_id == variant_id && sameOption) {
          products_arr[i].qty = parseInt(products_arr[i].qty) + parseInt(product_quantity);
          isExist = true;
        }
      }
      if (!isExist) {
        products_arr.push({
          "product_id": product_id,
          "variant_id": variant_id,
          "qty": product_quantity,
          "options_list": options_list
        });
      }

      postData.products = products_arr;
      console.log(postData);
      //return;

      $.ajax({
        type: "PUT",
        url: `${config.apiRootUrl}/requisitionlist?id=${listID}&customer_id=${bypass_customer_id}`,
        data: JSON.stringify(postData),
        success: function(data) {

          sweetAlert({
            text: "This item has been added to your shopping list",
            type: 'success',
          });
        },
        error: function(jqXHR, textStatus, errorThrown) {

          console.log(JSON.stringify(jqXHR));
        }
      });
    });


  }

  _bindEvents() {
    this.$el.on('click', '[data-product-quantity-change]', (event) => {
      this._updateQuantity(event);
    });

    this.$el.on('click', '[data-button-purchase]', (event) => {
      event.preventDefault();

      if (sessionStorage.getItem("bundleb2b_user") && sessionStorage.getItem("bundleb2b_user") != "none") {
        this.addProductToCartB2B(event);
      } else {
        this._addProductToCart(event);
      }
      this._toggleSpinner(event);
    });

    this.$el.on('change', '[data-product-option-change]', (event) => {
      this._productOptions(event);
    });

    initFormSwatch();
  }

  _getViewModel($el) {
    return {
      $price: $('[data-product-price-wrapper="without-tax"]', $el),
      $priceWithTax: $('[data-product-price-wrapper="with-tax"]', $el),
      $saved: $('[data-product-price-saved]', $el),
      $sku: $('[data-product-sku]', $el),
      $weight: $('[data-product-weight]', $el),
      $addToCart: $('[data-button-purchase]', $el),
    }
  }

  init(context) {
    this.context = context;

    if (this.$el.hasClass('single-product-wrap')) {
      this._updateAttributes(window.BCData.product_attributes);
    } else {
      utils.hooks.emit('product-option-change');
    }
  }

  _updateQuantity(event) {
    const $target = $(event.currentTarget);
    const $quantity = $target.closest('[data-product-quantity]').find('[data-product-quantity-input]');
    const min = parseInt($quantity.prop('min'), 10);
    const max = parseInt($quantity.prop('max'), 10);
    let newQuantity = parseInt($quantity.val(), 10);

    this.$productMessage.empty().removeClass('alert-success alert-error');

    if ($target.is('[data-quantity-increment]') && (!max || newQuantity < max)) {
      newQuantity = newQuantity + 1;
    } else if ($target.is('[data-quantity-decrement]') && newQuantity > min) {
      newQuantity = newQuantity - 1;
    }

    $quantity.val(newQuantity);
  }

  /**
   *
   * Handle product options changes
   *
   */
  _productOptions(event) {
    const $changedOption = $(event.currentTarget);
    const $form = $changedOption.parents('form');

    // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
    if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
      return;
    }

    // for bundleb2b
    this.$shoppinglistContainer.find(">.button").addClass("disabled").attr("disabled", true);

    utils.api.productAttributes.optionChange(this.productId, $form.serialize(), (err, response) => {
      const viewModel = this._getViewModel(this.$el);
      const data = response ? response.data : {};

      if (this.$el.find('[data-product-form]').data('product-options-count') < 1) {
        return;
      }

      this._updateAttributes(data);

      if (!$form.data('product-options-count')) {
        return;
      }

      if (viewModel.$sku.length) {
        viewModel.$sku.html(data.sku);
      }

      if (viewModel.$weight.length) {
        viewModel.$weight.html(data.weight.formatted);
      }

      /*if (viewModel.$price.length) {
        const priceStrings = {
          price: data.price,
          excludingTax: this.context.excludingTax,
        };
        viewModel.$price.html(this.options.priceWithoutTaxTemplate(priceStrings));
      }

      if (viewModel.$priceWithTax.length) {
        const priceStrings = {
          price: data.price,
          includingTax: this.context.includingTax,
        };
        viewModel.$priceWithTax.html(this.options.priceWithTaxTemplate(priceStrings));
      }*/

      if (viewModel.$saved.length) {
        const priceStrings = {
          price: data.price,
          savedString: this.context.priceYouSave,
        };
        viewModel.$saved.html(this.options.priceSavedTemplate(priceStrings));
      }

      if (data.image) {
        this.callbacks.switchImage(data.image);
      }

      this.$productMessage.empty().removeClass('alert-success alert-error');

      if (data.purchasing_message) {
        this.$productMessage.html(data.purchasing_message).addClass('alert-error');
      }

      if (!data.purchasable || !data.instock) {
        viewModel.$addToCart
          .addClass(this.options.buttonDisabledClass)
          .prop('disabled', true)
          .children('[data-button-text]')
          .text(this.context.soldOut);

      } else {
        let buttonText = this.context.addToCart;
        if (viewModel.$addToCart.is('[data-button-preorder]')) {
          buttonText = this.context.preOrder;
        }

        viewModel.$addToCart
          .removeClass(this.options.buttonDisabledClass)
          .prop('disabled', false)
          .children('[data-button-text]')
          .text(buttonText);
      }

      //for bundleb2b
      this.$shoppinglistContainer.find(">.button").removeClass("disabled").removeAttr("disabled");
      if (sessionStorage.getItem("bundleb2b_user") && sessionStorage.getItem("bundleb2b_user") != "none") {
        if (data.sku) {
          const current_sku = data.sku;
          const priceObj = data.price.without_tax || data.price.with_tax; //formatted
          const base_price_value = priceObj.value;
          const base_price_symbol = (priceObj.formatted).substring(0, 1);

          /*if (data.variantId || data.v3_variant_id) {
              this.updateTierPriceRange(current_sku, base_price_value, base_price_symbol);
              this.setTierPriceByQty(current_sku, 1);
          } else {
              this.$tierPriceContainer.hide();
          }*/

          const $form = $('form[data-cart-item-add]', this.$scope);
          //const product_id = $('[name="product_id"]', $form).val();
          const product_id = this.productId;
          let variant_id;
          const variants = this.catalog_products[product_id] || [];
          for (var i = 0; i < variants.length; i++) {
            if (variants[i].variant_sku.toLowerCase() == current_sku.toLowerCase()) {
              variant_id = variants[i].variant_id;
            }
          }
          if (variant_id) {

            this.updateTierPriceRange(current_sku, base_price_value);
            const tierPriceValue = this.getMainProductTierPrice(current_sku, 1);
            if (tierPriceValue) {
              this.gMasterPrcie = tierPriceValue;
            }

            const $selectPickListOption = $('[data-product-attribute="product-list"] input.form-radio:checked', this.$scope);
            if ($selectPickListOption.length > 0) {
              let pickListArr = [];
              $.each($selectPickListOption, (index, picklist) => {
                const pickedOptionId = $(picklist).attr("name").replace("attribute[", "").replace("]", "");
                const pickedOptionValue = $(picklist).attr("value");
                const pickedProductId = $(picklist).attr("data-product-id");
                pickListArr.push({
                  "pickedOptionId": pickedOptionId,
                  "pickedOptionValue": pickedOptionValue,
                  "pickedProductId": pickedProductId
                });

              });

              this.getVariantOptions(product_id, variant_id, pickListArr);
            } else {

              if (tierPriceValue) {
                this.setProductPriceText(tierPriceValue);

              }
            }
          } else {
            if (viewModel.$price.length) {
              const priceStrings = {
                price: data.price,
                excludingTax: this.context.excludingTax,
              };
              viewModel.$price.html(this.options.priceWithoutTaxTemplate(priceStrings));
            }

            if (viewModel.$priceWithTax.length) {
              const priceStrings = {
                price: data.price,
                includingTax: this.context.includingTax,
              };
              viewModel.$priceWithTax.html(this.options.priceWithTaxTemplate(priceStrings));
            }
          }
        } else {
          if (viewModel.$price.length) {
            const priceStrings = {
              price: data.price,
              excludingTax: this.context.excludingTax,
            };
            viewModel.$price.html(this.options.priceWithoutTaxTemplate(priceStrings));
          }

          if (viewModel.$priceWithTax.length) {
            const priceStrings = {
              price: data.price,
              includingTax: this.context.includingTax,
            };
            viewModel.$priceWithTax.html(this.options.priceWithTaxTemplate(priceStrings));
          }
        }


      } else {
        if (viewModel.$price.length) {
          const priceStrings = {
            price: data.price,
            excludingTax: this.context.excludingTax,
          };
          viewModel.$price.html(this.options.priceWithoutTaxTemplate(priceStrings));
        }

        if (viewModel.$priceWithTax.length) {
          const priceStrings = {
            price: data.price,
            includingTax: this.context.includingTax,
          };
          viewModel.$priceWithTax.html(this.options.priceWithTaxTemplate(priceStrings));
        }
      }
    });
  }

  /**
   *
   * Add a product to cart
   *
   */
  _addProductToCart(event) {
    const form = this.$el.find('[data-product-form]')[0];
    const $form = $(form);

    // Do not do AJAX if browser doesn't support FormData OR
    if (window.FormData === undefined || !(this.$el.has(form))) {
      return;
    }

    event.preventDefault();

    this.callbacks.willUpdate($form);

    // Add item to cart
    utils.api.cart.itemAdd(new FormData(form), (err, response) => {
      let isError = false;

      if (err || response.data.error) {
        isError = true;
        response = err || response.data.error;
      } else {
        $('body').trigger('cart-quantity-update');
      }

      this._updateMessage(isError, response);
      this.callbacks.didUpdate(isError, response, $form);
    });
  }

  _toggleSpinner(event) {
    this.$el.find('.spinner').toggleClass('visible');
  }

  _updateMessage(isError, response) {
    let message = '';

    if (isError) {
      message = response;

      setTimeout(() => {
        this.$el.find('.product-add-button-wrapper .spinner').removeClass('visible');
      });
    } else {
      message = this.context.addSuccess;
      message = message
        .replace('*product*', this.$el.find('[data-product-details]').data('product-title'))
        .replace('*cart_link*', `<a href=${this.context.urlsCart}>${this.context.cartLink}</a>`)
        .replace('*continue_link*', `<a href='/'>${this.context.homeLink}</a>`)
        .replace('*checkout_link*', `<a href=${this.context.urlsCheckout}>${this.context.checkoutLink}</a>`);

      setTimeout(() => {
        this.$el.find('.product-add-button-wrapper .spinner').removeClass('visible');
      }, 800);
    }

    this.$productMessage.html(message).toggleClass('alert-error', isError).toggleClass('alert-success', !isError);

    if ($(this.$el).hasClass('single-product-wrap')) {
      $('html, body').animate({
        scrollTop: $('[data-product-message]').offset().top - 40
      }, 1000);
    }
  }

  _updateAttributes(data) {
    if (data === undefined) {
      return;
    }

    const behavior = data.out_of_stock_behavior;
    const inStockIds = data.in_stock_attributes;
    const outOfStockMessage = ` (${data.out_of_stock_message})`;

    if (behavior !== 'hide_option' && behavior !== 'label_option') {
      return;
    }

    $('[data-product-attribute-value]', this.$el).each((i, attribute) => {
      const $attribute = $(attribute);
      const attrId = parseInt($attribute.data('product-attribute-value'), 10);

      if (inStockIds.indexOf(attrId) !== -1) {
        this._enableAttribute($attribute, behavior, outOfStockMessage);
      } else {
        this._disableAttribute($attribute, behavior, outOfStockMessage);
      }
    });
  }

  _disableAttribute($attribute, behavior, outOfStockMessage) {
    if (behavior === 'hide_option') {
      $attribute.hide();
    } else {
      if (this._getAttributeType($attribute) === 'set-select') {
        $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
      } else {
        $attribute.addClass('option-unavailable');
      }
    }
  }

  _enableAttribute($attribute, behavior, outOfStockMessage) {
    if (behavior === 'hide_option') {
      $attribute.show();
    } else {
      if (this._getAttributeType($attribute) === 'set-select') {
        $attribute.html($attribute.html().replace(outOfStockMessage, ''));
      } else {
        $attribute.removeClass('option-unavailable');
      }
    }
  }

  _getAttributeType($attribute) {
    const $parent = $attribute.closest('[data-product-attribute]');
    return $parent ? $parent.data('product-attribute') : null;
  }


  //for bundleb2b
  getLists() {
    const bypass_store_hash = `${config.storeHash}`;
    const bypass_email = this.context.customer.email;
    const bypass_customer_id = this.context.customer.id;

    if (!bypass_customer_id) {
      //this.$overlay_product.hide();

      return;

    }

    this.$shoppinglistContainer.find(">.button").addClass("loading disabled").attr("disabled", true);
    this.$shoppinglistContainer.show();

    $.ajax({
      type: "GET",
      url: `${config.apiRootUrl}/requisitionlist?store_hash=${bypass_store_hash}&company_id=${this.bypass_company_id}&customer_id=${bypass_customer_id}`,
      success: (data) => {
        console.log(data);
        const $shoppinglistDropdown = this.$shoppinglistContainer.find("#shoppinglist-dropdown");

        if (data) {
          if (data.length > 0) {
            const listsData = data;
            for (let i = 0; i < listsData.length; i++) {
              const listData = listsData[i];
              console.log(listData);
              const listDataString = JSON.stringify(listData).replace(/\'/g, "&#39");
              /*if (gRoleId == 0 && listData.status == "30") {
                $shoppinglistDropdown.append(`<li><button type="button" class="button" add-to-list data-list-id="${listData.id}" data-list-status="${listData.status}" data-list-data='${JSON.stringify(listData)}'>Add to ${listData.name}</button></li>`);
              }
              if (gRoleId != 0 && listData.status == "0") {
                $shoppinglistDropdown.append(`<li><button type="button" class="button" add-to-list data-list-id="${listData.id}" data-list-status="${listData.status}" data-list-data='${JSON.stringify(listData)}'>Add to ${listData.name}</button></li>`);

              }*/
              if (this.gRoleId == 0) {
                // junior buyer
                if (listData.status == "30") {
                  $shoppinglistDropdown.append(`<li><button type="button" class="button" add-to-list data-list-id="${listData.id}" data-list-status="${listData.status}" data-list-data='${listDataString}'>Add to ${listData.name}</button></li>`);
                }

              } else if (this.gRoleId == 10) {
                // salerep
                if (listData.status == "0" && listData.customer_id == bypass_customer_id) {
                  $shoppinglistDropdown.append(`<li><button type="button" class="button" add-to-list data-list-id="${listData.id}" data-list-status="${listData.status}" data-list-data='${listDataString}'>Add to ${listData.name}</button></li>`);
                }
              } else if (this.gRoleId == 1 || this.gRoleId == 2) {
                // admin and Senior buyer
                if (listData.status == "0") {
                  $shoppinglistDropdown.append(`<li><button type="button" class="button" add-to-list data-list-id="${listData.id}" data-list-status="${listData.status}" data-list-data='${listDataString}'>Add to ${listData.name}</button></li>`);
                }
              }


            }

          }

          $shoppinglistDropdown.append(`<li data-list-id><a href="/shopping-lists/" class="button">Create a new list</a></li>`);
          //this.$overlay_product.hide();
          this.$shoppinglistContainer.find(">.button").removeClass("disabled loading").removeAttr("disabled");
        }

      },
      error: (jqXHR, textStatus, errorThrown) => {
        //this.$overlay_product.hide();
        this.$shoppinglistContainer.find(">.button").removeClass("disabled loading").removeAttr("disabled");
        console.log(JSON.stringify(jqXHR));
      }
    });



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
  updateCatalogPrice(cartItemsArr, cartId, cartAddResponse) {
    const bypass_store_hash = `${config.storeHash}`;
    const cartItemObj = cartItemsArr[cartItemsArr.length - 1];
    delete cartItemObj.option_text;
    console.log("putdata", JSON.stringify(cartItemObj));

    this.handlePickListOptions(cartItemObj, () => {
      console.log("putdata2", JSON.stringify(cartItemObj));
      $.ajax({
        type: "PUT",
        url: `${config.apiRootUrl}/cart?store_hash=${bypass_store_hash}&cart_id=${cartId}`,
        data: JSON.stringify(cartItemObj),
        success: (data) => {
          console.log("update catalog price", data);

          cartItemsArr.pop();
          if (cartItemsArr.length == 0) {
            console.log("update price done.");
            let catalog_priceValue;
            const cartItems = data.data.line_items.physical_items;
            for (let j = 0; j < cartItems.length; j++) {
              const product_id = cartItems[j].product_id;
              if (product_id == $("input[name=product_id]", this.scope).val()) {
                catalog_priceValue = cartItems[j].sale_price;
              }
            }
            this.$overlay_b2b.hide();
            this._updateMessage(false, cartAddResponse);
            $('body').trigger('cart-quantity-update');


          } else {
            this.updateCatalogPrice(cartItemsArr, cartId, cartAddResponse);
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          this.$overlay_b2b.hide();
          alert("update catalog price error");
        }
      });
    });



  }

  //for bundleb2b
  addProductToCartBundleb2b(itemArr) {
    const $addToCartBtn = $("#form-action-addToCart", this.scope);
    //const form = $("[data-cart-item-add]", this.scope)[0];
    const form = this.$el.find('[data-product-form]')[0];
    const originalBtnVal = $addToCartBtn.val();
    const waitMessage = $addToCartBtn.data('waitMessage');
    $addToCartBtn
      .val(waitMessage)
      .prop('disabled', true);


    const item = itemArr[itemArr.length - 1];

    console.log("add item to cart", item);

    //utils.api.cart.itemAdd(this.filterEmptyFilesFromForm(new FormData(form)), (err, response) => {
    utils.api.cart.itemAdd(new FormData(form), (err, response) => {
      debugger
      const errorMessage = err || response.data.error;
      if (errorMessage) {
        this.$overlay_b2b.hide();
        this._updateMessage(true, errorMessage);
        return;
      }

      // $addToCartBtn
      //   .val(originalBtnVal)
      //   .prop('disabled', false);


      // pgw
      $('body').trigger('cart-quantity-update');



      // Open preview modal and update content
      console.log(response);
      //const cartItemHash = response.data.cart_item.hash;
      const cartAddResponse = response;


      // update catalog price
      const options = {
        template: {
          content: 'b2b/cart-content-data',
          totals: 'cart/footer'
        },
      };
      utils.api.cart.getContent(options, (err, response) => {
        //console.log(response.content);
        debugger
        const divEle = document.createElement("div");
        $(divEle).html(response.content);
        const $items = $(divEle).find(".item");
        if ($items.length > 0) {

          let cartItemsArr = [];
          let cartItemsObj = {};
          let cartQuantity = 0;
          const gCatalogId = sessionStorage.getItem("catalog_id");

          $.each($items, (index, item) => {
            //console.log(item);
            const $cartItem = $(item);
            const itemId = $cartItem.attr("data-item-id");
            const itemSku = $cartItem.attr("data-item-sku");
            const itemProductId = $cartItem.attr("data-item-productId");
            const itemQty = parseInt($cartItem.attr("data-item-quantity"));
            const itemOptions = $cartItem.attr("data-item-options");

            let itemVariantId;
            const variants = this.catalog_products[itemProductId];
            if (variants && variants.length > 0) {
              for (let i = 0; i < variants.length; i++) {
                const variant_sku = variants[i].variant_sku;
                if (variant_sku.toLowerCase() == itemSku.toLowerCase()) {
                  itemVariantId = variants[i].variant_id;
                }
              }

            }

            cartQuantity += parseInt(itemQty);
            //const itemCatalogPrice = catalog_products[itemProductId] || cartItem.salePrice;

            if (cartItemsObj[`${itemProductId}-${itemVariantId}`]) {
              for (let j = 0; j < cartItemsArr.length; j++) {
                if (cartItemsArr[j].product_id == itemProductId && cartItemsArr[j].variant_id == itemVariantId && cartItemsArr[j].option_text == itemOptions) {
                  cartItemsArr[j].quantity += parseInt(itemQty);
                }
              }
            } else {
              cartItemsObj[`${itemProductId}-${itemVariantId}`] = "true";
            }


            const cartItemObj = {
              "item_id": itemId,
              "product_id": itemProductId,
              "variant_id": itemVariantId,
              "quantity": itemQty,
              "catalog_id": gCatalogId,
              "option_text": itemOptions
            };

            cartItemsArr.push(cartItemObj);

          });

          //update cart counter
          const $body = $('body');
          const $cartCounter = $('.navUser-action .cart-count');

          $cartCounter.addClass('cart-count--positive');
          $body.trigger('cart-quantity-update', cartQuantity);
          console.log("cartItems", cartItemsArr);

          //$overlay.hide();

          let cartId;
          $.ajax({
            type: "GET",
            url: "/api/storefront/carts",
            contentType: "application/json",
            accept: "application/json",
            async: false,
            success: function(data) {
              console.log(data);
              if (data && data.length > 0) {
                cartId = data[0].id;

              }
            }
          });
          this.updateCatalogPrice(cartItemsArr, cartId, cartAddResponse);
        }

      });


    });
  }

  //for bundleb2b
  //replace cart contents with new items
  replaceCart(cartItemArr, itemArr) {
    const cartitem = cartItemArr[cartItemArr.length - 1];
    console.log("delete cartitem...", cartitem);

    this.$overlay_b2b.show();

    utils.api.cart.itemRemove(cartitem.id, (err, response) => {
      if (response.data.status === 'succeed') {
        cartItemArr.pop();

        if (cartItemArr.length > 0) {
          this.replaceCart(cartItemArr, itemArr);
        } else {
          console.log("cart items removed, adding new items");
          this.addProductToCartBundleb2b(itemArr);
        }
      } else {
        this.$overlay_b2b.hide();
        sweetAlert({
          text: response.data.errors.join('\n'),
          type: 'error',
        });
      }

    });

  }


  /*replaceCart(cartItemArr, cartId, itemArr) {

      for (let i = 0; i < cartItemArr.length; i++) {
          const cartitem = cartItemArr[i];
          $.ajax({
              type: "DELETE",
              url: `/api/storefront/carts/${cartId}/items/${cartitem.id}`,
              contentType: "application/json",
              accept: "application/json",
              success: (data) => {
                  console.log(data);
                  if (typeof data == 'undefined') {
                      console.log("remove all items end.")
                      this.addProductToCartBundleb2b(itemArr);

                  }

              },
              error: (jqXHR, textStatus, errorThrown) => {
                  this.$overlay_b2b.hide();

                  swal({
                      type: "error",
                      text: `${jqXHR.responseText.error}`
                  });
                  console.log("error", JSON.stringify(jqXHR));
              }
          });
      }
  }*/

  /**
   *
   * Add a product to cart
   *
   */
  addProductToCartB2B(event) {
    debugger
    const form = this.$el.find('[data-product-form]')[0];
    const $form = $(form);

    // Do not do AJAX if browser doesn't support FormData
    if (window.FormData === undefined) {
      return;
    }

    console.log("add to cart");

    // Prevent default
    event.preventDefault();

    let itemArr = [];
    const productObj = {};
    productObj.product_id = $(form).find("input[name='product_id']").val();
    productObj.quantity = $(form).find("input[name='qty[]']").val();
    itemArr.push(productObj);
    console.log(itemArr);



    let variant_id;
    const product_id = $(form).find("input[name='product_id']").val();

    const product_variant_sku = $("[data-product-sku]", this.$scope).text().trim();

    const variants = this.catalog_products[product_id] || [];
    for (var i = 0; i < variants.length; i++) {
      if (variants[i].variant_sku.toLowerCase() == product_variant_sku.toLowerCase()) {
        variant_id = variants[i].variant_id;
      }
    }
    if (!variant_id) {
      alert("This product or option has no variant id");
      return;
    }


    this.$overlay_b2b.show();
    let cartItemIDs = [];
    let cartId;

    $.ajax({
      type: "GET",
      url: "/api/storefront/carts",
      contentType: "application/json",
      accept: "application/json",
      async: true,
      success: (data) => {
        if (data && data.length > 0) {
          cartId = data[0].id;
          //cartItemIDs = data[0].lineItems.physicalItems;
          const cartItemIDs_all = data[0].lineItems.physicalItems;
          cartItemIDs = cartItemIDs_all.filter(function(item) {
            return item.parentId == null;
          });
        }

        console.log(cartItemIDs);

        console.log("number of items in cart: ", cartItemIDs.length);
        if (cartItemIDs.length > 0) { //if there are items in cart notify user
          this.$overlay_b2b.hide();
          sweetAlert({
            title: "The shopping cart isn't empty",
            html: "<div class='nonempty-cart'><p>You have items in your shopping cart. Would you like to merge items in this order with items of this shopping cart or replace them?</p>" +
              "<p>Select Cancel to stay on the current page.</p></div><div style='margin-top:20px;'><button class='button' id='cart-merge-btn'>Merge</button><button class='button button--secondary' id='cart-replace-btn'>Replace</button><button class='swal2-cancel styled' id='cart-cancel-btn'>Cancel</button></div>",
            showCancelButton: false,
            showConfirmButton: false
          });
          const $mergeBtn = $('#cart-merge-btn');
          const $replaceBtn = $('#cart-replace-btn');
          const $cancelBtn = $('#cart-cancel-btn');

          $mergeBtn.on('click', () => {
            sweetAlert.close();
            this.$overlay_b2b.show();
            this.addProductToCartBundleb2b(itemArr);
          });
          $replaceBtn.on('click', () => {
            sweetAlert.close();
            this.$overlay_b2b.show();
            this.replaceCart(cartItemIDs, itemArr);
          });
          $cancelBtn.on('click', () => {
            sweetAlert.close();
          });
        } else {
          this.$overlay_b2b.show();
          this.addProductToCartBundleb2b(itemArr);
        }

      },
      error: (jqXHR, textStatus, errorThrown) => {
        this.$overlay_b2b.hide();

        sweetAlert({
          type: "error",
          text: "There has some error, please try again"
        });
        console.log("error", JSON.stringify(jqXHR));
      }
    });

  }

  addProductToCartDefault(event, form) {
    const $addToCartBtn = $('#form-action-addToCart', $(event.target));
    const originalBtnVal = $addToCartBtn.val();
    const waitMessage = $addToCartBtn.data('waitMessage');

    // Do not do AJAX if browser doesn't support FormData
    if (window.FormData === undefined) {
      return;
    }

    // Prevent default
    event.preventDefault();

    $addToCartBtn
      .val(waitMessage)
      .prop('disabled', true);

    this.$overlay_b2b.show();

    // Add item to cart
    utils.api.cart.itemAdd(this.filterEmptyFilesFromForm(new FormData(form)), (err, response) => {
      const errorMessage = err || response.data.error;

      $addToCartBtn
        .val(originalBtnVal)
        .prop('disabled', false);

      this.$overlay_b2b.hide();

      // Guard statement
      if (errorMessage) {
        // Strip the HTML from the error message
        const tmp = document.createElement('DIV');
        tmp.innerHTML = errorMessage;

        return sweetAlert({
          text: tmp.textContent || tmp.innerText,
          type: 'error',
        });
      }

      // Open preview modal and update content
      if (this.previewModal) {
        this.previewModal.open();

        this.updateCartContent(this.previewModal, response.data.cart_item.hash);
      } else {
        this.$overlay_b2b.show();
        // if no modal, redirect to the cart page
        this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
      }
    });
  }

  //for bundleb2b
  updateTierPriceRange(sku, base_price) {
    const current_sku = sku;
    const product_id = $("input[name='product_id']", this.$scope).val();
    let hasTierPrice = false;
    if (this.catalog_products && this.catalog_products[product_id]) {
      const variants = this.catalog_products[product_id];

      for (let i = 0; i < variants.length; i++) {
        const variant_sku = variants[i].variant_sku;
        if (variant_sku.toLowerCase() == current_sku.toLowerCase()) {
          hasTierPrice = true;
          const tier_price = variants[i].tier_price;
          let lis = "";

          if (tier_price.length == 1 && tier_price[0].qty == "1") {
            this.$tierPriceContainer.hide();
            return;
          }

          for (let j = 0; j < tier_price.length; j++) {
            const price = tier_price[j].price;
            let startQty = tier_price[j].qty;
            let endQty;

            let priceSavedText = "";
            if (tier_price[j].type == "fixed") {
              priceSavedText = `pay only ${this.gPriceSymbol}${pricesStyle(price, 2)} each`;

            } else {

              //priceSavedText = `get ${price}% off`;
              const priceValue = base_price - base_price * price / 100;
              priceSavedText = `pay only ${this.gPriceSymbol}${pricesStyle(priceValue, 2)} each`;

            }

            if (tier_price[j + 1]) {
              endQty = tier_price[j + 1].qty;
            }
            if (endQty) {
              if (startQty == (endQty - 1)) {
                lis += `<li>Buy ${startQty} and ${priceSavedText}</li>`;

              } else {
                lis += `<li>Buy ${startQty} - ${endQty} and ${priceSavedText}</li>`;
              }
            } else {
              lis += `<li>Buy ${startQty} or above and ${priceSavedText}</li>`;
            }
          }

          this.$tierPriceContainer.find("ul").html(lis);
        }
      }

    }
    if (hasTierPrice) {
      this.$tierPriceContainer.show();
    } else {
      this.$tierPriceContainer.hide();
    }

  }

  //for bundleb2b
  // not used
  setTierPriceByQty(variantSku, qty) {

    if (!variantSku) {
      return;
    }

    const productId = $('[name="product_id"]', this.$scope).val();

    if (this.catalog_products && this.catalog_products[productId]) {
      /*const $price = $("[data-product-price-without-tax]", this.$scope) || $("[data-product-price-with-tax]", this.$scope);
      const base_price = $price.text().trim();
      const base_price_symbol = base_price.substring(0, 1);
      const base_price_value = base_price.replace("$", "");*/
      const base_price_value = this.getMainProductBasePrice();
      console.log(base_price_value);

      const variantSkus = this.catalog_products[productId];
      let tier_price_array = [];
      for (let i = 0; i < variantSkus.length; i++) {
        if (variantSkus[i].variant_sku == variantSku) {
          tier_price_array = variantSkus[i].tier_price;
        }
      }

      let tier_price;
      for (let j = 0; j < tier_price_array.length; j++) {
        const price_type = tier_price_array[j].type;
        const tier_qty = tier_price_array[j].qty;
        const price = tier_price_array[j].price;

        if (qty >= tier_qty) {
          if (price_type == "fixed") {
            tier_price = price;

          } else {
            tier_price = base_price_value - base_price_value * price / 100;
          }
        }
      }

      if (tier_price) {
        tier_price = parseFloat(tier_price).toFixed(2);
        this.setProductPriceText(tier_price);
        this.gMasterPrcie = tier_price;

      }
    }
  }

  // for bundleb2b
  getMainProductTierPrice(variantSku, qty) {
    let tier_price;

    if (!variantSku) {
      return false;
    }

    const productId = $('[name="product_id"]', this.$scope).val();

    if (this.catalog_products && this.catalog_products[productId]) {
      /*const $price = $("[data-product-price-without-tax]", this.$scope) || $("[data-product-price-with-tax]", this.$scope);
      const base_price = $price.text().trim();
      const base_price_symbol = base_price.substring(0, 1);
      const base_price_value = base_price.replace("$", "");*/
      const base_price_value = this.getMainProductBasePrice();
      console.log(base_price_value);

      const variantSkus = this.catalog_products[productId];
      let tier_price_array = [];
      for (let i = 0; i < variantSkus.length; i++) {
        if (variantSkus[i].variant_sku == variantSku) {
          tier_price_array = variantSkus[i].tier_price;
        }
      }

      tier_price = base_price_value;
      for (let j = 0; j < tier_price_array.length; j++) {
        const price_type = tier_price_array[j].type;
        const tier_qty = tier_price_array[j].qty;
        const price = tier_price_array[j].price;

        if (qty >= tier_qty) {
          if (price_type == "fixed") {
            tier_price = price;

          } else {
            tier_price = base_price_value - base_price_value * price / 100;
          }
        }
      }

      if (tier_price) {
        tier_price = parseFloat(tier_price).toFixed(2);
      }
    }

    return tier_price;
  }

  // for bundleb2b
  getVariantOptions(product_id, variant_id, pickListArr) {
    const bypass_store_hash = `${config.storeHash}`;

    $.ajax({
      type: "GET",
      url: `${config.apiRootUrl}/productvariants?store_hash=${bypass_store_hash}&product_id=${product_id}&variant_id=${variant_id}`,
      success: (data) => {
        console.log("sku options", data);
        console.log(pickListArr);
        let hasCustomPrice = true;

        let productPrice = parseFloat(this.gMasterPrcie).toFixed(2);
        console.log(this.gTierPrice);
        console.log("price start -------");
        console.log(productPrice);

        if (data && data.option_list) {
          const options = data.option_list;

          for (let i = 0; i < pickListArr.length; i++) {
            const pickedOptionId = pickListArr[i].pickedOptionId;
            const pickedOptionValue = pickListArr[i].pickedOptionValue;
            const pickedProductId = pickListArr[i].pickedProductId;

            let showCustomPrice = true;

            for (let j = 0; j < options.length; j++) {
              const optionId = options[j].option_id;
              const optionValue = options[j].option_value;

              if (pickedOptionId == optionId && pickedOptionValue == optionValue) {
                showCustomPrice = false;
                hasCustomPrice = false;
              }
            }

            if (showCustomPrice) {
              productPrice = parseFloat(parseFloat(productPrice) + parseFloat(this.gTierPrice[pickedProductId] || 0)).toFixed(2);
              console.log("+" + this.gTierPrice[pickedProductId] || 0);
            }
          }


        }

        // call back function
        if (hasCustomPrice) {
          this.$tierPriceContainer.hide();
        }
        productPrice = parseFloat(productPrice).toFixed(2);
        this.setProductPriceText(productPrice);
        console.log(productPrice);
        console.log("price end-------");
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("error", JSON.stringify(jqXHR));
      }
    });
  }

  // for bundleb2b
  // for simple products
  getTierPriceByProductId(productId, qty) {
    if (!productId) {
      return;
    }

    productId = parseInt(productId);

    if (this.gTierPrice[productId]) {
      return;
    }

    $.ajax({
      type: "GET",
      url: `${config.apiRootUrl}/getCatalogproduct?store_hash=${config.storeHash}&id=${productId}`,
      success: (data) => {
        if (!data) {
          return;
        }

        let tier_price;
        const base_price = data.price;

        if (this.catalog_products && this.catalog_products[productId]) {
          const variantSkus = this.catalog_products[productId];
          const tier_price_array = variantSkus[0].tier_price;
          const base_price_value = base_price;

          for (let j = 0; j < tier_price_array.length; j++) {
            const price_type = tier_price_array[j].type;
            const tier_qty = tier_price_array[j].qty;
            const price = tier_price_array[j].price;

            if (qty >= tier_qty) {
              if (price_type == "fixed") {
                tier_price = price;

              } else {

                if (base_price_value) {
                  tier_price = base_price_value - base_price_value * price / 100;
                } else {
                  tier_price = new_price;
                }
              }
            }
          }

          if (tier_price) {
            tier_price = parseFloat(tier_price).toFixed(2);
          }
        } else {
          tier_price = base_price;
        }

        this.gTierPrice[productId] = tier_price;
        console.log(this.gTierPrice);

      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("error", JSON.stringify(jqXHR));
      }
    });

  }

  // for bundleb2b
  initProductListOptionPrice() {
    debugger
    const $pickListOptions = $('.form-field[data-product-attribute="product-list"]', this.$scope);
    if ($pickListOptions.length > 0) {
      $.each($pickListOptions, (index, option) => {
        const $formRadios = $(option).find("input.form-radio");
        $.each($formRadios, (i, radio) => {
          const productId = $(radio).attr("data-product-id");
          //console.log(productId);
          this.getTierPriceByProductId(productId, 1);

        });

      });
    }
  }

  // for bundleb2b
  setProductPriceText(priceValue) {
    //const $price = $("[data-product-price-without-tax]", this.$scope) || $("[data-product-price-with-tax]", this.$scope);
    const $price = $(".product-price [data-product-price]", this.$scope);
    const $savedPrice = $(".product-price [data-product-price-saved]", this.$scope);
    $price.text(`${this.gPriceSymbol}${pricesStyle(priceValue, 2)}`);
    $savedPrice.hide();
  }

  // for bundleb2b
  getMainProductBasePrice() {
    //const $price = $("[data-product-price-without-tax]", this.$scope) || $("[data-product-price-with-tax]", this.$scope);
    /*const $price = $(".product-price [data-product-price]", this.$scope);
    const base_price = $price.text().trim();
    const base_price_symbol = base_price.substring(0, 1);
    const base_price_value = base_price.replace("$", "").replace(",", "");
    return base_price_value;*/

    const gBasePrice = $("[b2b-product-base-price]", this.$scope).attr("b2b-product-base-price");
    return gBasePrice;
  }

  // for bundleb2b -- simple products
  getVariantIdByProductId(productId) {
    let variantId;

    if (this.catalog_products && this.catalog_products[productId]) {
      const variantSkus = this.catalog_products[productId];
      variantId = variantSkus[0].variant_id;
    }
    return variantId;
  }

  // for bundleb2b
  filterEmptyFilesFromForm(formData) {
    try {
      for (const [key, val] of formData) {
        if (val instanceof File && !val.name && !val.size) {
          formData.delete(key);
        }
      }
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }

    return formData;
  }
}
