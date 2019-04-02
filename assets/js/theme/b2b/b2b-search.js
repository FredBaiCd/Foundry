import config from './config';
import './tools/jqPaginator.js';
import urlUtils from '../common/url-utils';
import Url from 'url';
import $ from "jquery";
import pricesStyle from './prices-style';

export default function(keywords) {
	// non-b2b user
	if (!sessionStorage.getItem("bundleb2b_user") || sessionStorage.getItem("bundleb2b_user") == "none") {
		return;
	}
	let pageSize = 30;
	let pageNumber = 1;

	// b2b user info
	const b2bUserInfo = JSON.parse(sessionStorage.getItem("bundleb2b_user"));
	const gRoleId = b2bUserInfo.role_id;
	let gCatalogId;
	if (b2bUserInfo.catalog_id) {
		gCatalogId = b2bUserInfo.catalog_id;
	}
	if (sessionStorage.getItem("catalog_id")) {
		gCatalogId = sessionStorage.getItem("catalog_id");
	}

	const catalog_products = JSON.parse(sessionStorage.getItem("catalog_products"));


	let selectedFacets = {};
	let ajaxUrl = `${config.apiRootUrl}/search?store_hash=${config.storeHash}&keywords=${keywords}&is_facets=1&catalog_id=${gCatalogId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

	const search = function(url, _callback) {
		let promise = new Promise((resolve, reject) => {
			$.ajax({
				type: 'GET',
				url: url,
				success: function(data) {
					if (data.code == 200) {
						resolve(data.response)
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			})
		});
		return promise;
	};
	search(ajaxUrl).then(res => {
		_initFacets(res);
		_initProducts(res);
		$("#b2b_search_result_count").text(`${res.total_count || 0} results for '${keywords}'`);

		if (res.total_count == 0) {
			$("#jqPagination").html("");
			$(".page-sidebar-b2b").remove();
			return;
		}

		$("#jqPagination").jqPaginator({
			totalPages: Math.ceil(res.total_count / pageSize),
			visiblePages: 5,
			currentPage: pageNumber,
			onPageChange: (num, type) => {
				if (pageNumber == num) return;
				pageNumber = num;
				ajaxUrl = `${config.apiRootUrl}/search?store_hash=${config.storeHash}&keywords=${keywords}&is_facets=1&catalog_id=${gCatalogId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
				search(ajaxUrl).then(res => {
					_initFacets(res);
					_initProducts(res);
					$("#b2b_search_result_count").text(`${res.total_count || 0} results for '${keywords}'`);
				});
			}
		});
	});

	const _initProducts = function(res) {
		let ul = $("#b2b_search_result").find(".product-grid-list");
		ul.empty();

		let prods = res.payload;
		if (!prods || prods.length == 0) {
			return;
		}

		for (let i in prods) {
			let base_price = prods[i].base_price;
			let tier_price;
			let catalog_price = base_price;
			const product_id = prods[i].product_id;
			const variantArr = catalog_products[product_id] || [];
			if (variantArr.length == 1) {
				tier_price = variantArr[0].tier_price || [];
				catalog_price = getCatalogPrice(base_price, tier_price, 1);
			}

			let rrp_price = `<span class="price-rrp">$${pricesStyle(base_price, 2)}</span>`;

			if (base_price == catalog_price) {
				rrp_price = "";
			}

			catalog_price = parseFloat(catalog_price).toFixed(2);

			let pro_bg_a = `
				<a class="cropped-thumbnail-block" href="${prods[i].product_url}" title="${prods[i].product_name}" style="background-image:url(${prods[i].primary_image.standard_url});">
                    <img src="${prods[i].primary_image.standard_url}" alt="${prods[i].product_name}">
                </a>`;
			let figcaption = "";
			/*let figcaption = `<figcaption class="card-figcaption"><div class="card-figcaption-body">` +
				`<a class="button button--small card-figcaption-button quickview" data-product-id="${prods[i].product_id}">Quick view</a>` +
				`<label class="button button--small card-figcaption-button" for="compare-${prods[i].product_id}">Compare ` +
				`<input type="checkbox" name="products[]" value="${prods[i].product_id}" id="compare-${prods[i].product_id}" data-compare-id="${prods[i].product_id}">` +
				`</label>` +
				`<a href="/cart.php?action=add&product_id=${prods[i].product_id}" data-event-type="product-click" class="button button--small card-figcaption-button">Add to Cart</a>` +
				`</div></figcaption>`;*/

			let card_body = `
			    <h3 class="product-item-title">
			      <a href="${prods[i].product_url}" title="${prods[i].product_name}">
			        ${prods[i].product_name}
			      </a>
			    </h3>

			    <div class="product-grid-item-price">
			      <div class="product-price" itemprop="offers" itemscope="" itemtype="http://schema.org/Offer">
			        <span class="price-without-tax">
			          <span data-product-price-wrapper="without-tax">
			            <span data-product-price="">
			              $${pricesStyle(catalog_price, 2)}
			            </span>
			            ${rrp_price}
			          </span>
			        </span>
			      </div>
			    </div>`;

			ul.append(`<article class="product-grid-item">` +
				`<figure class="product-grid-item-thumbnail cropped-thumbnail aspect-three-by-two">${pro_bg_a}${figcaption}</figure>` +
				`<div class="product-grid-item-details">${card_body}</div>` +
				`</article>`)
		}
	}

	const _initFacets = function(res) {
		selectedFacets = {};
		const facets = res.facets;

		const $productFiltersContainer = $("#product-filters-container");
		let filterHtml = "";
		let facetsCount = facets.length;
		for (let i = 0; i < facetsCount; i++) {
			const facet = facets[i];
			const facetHtml = getFacetHtml(facet.type_name, facet.buckets, facet.attribute);
			if (facetHtml.trim() != "") {
				filterHtml += `
				<div class="product-filters-block" data-attribute="${facet.attribute}">
	                <div class="product-filters-title open">
	                    <h3>${facet.title}</h3>
	                    <div class="product-filters-title--toggle">
	                        <span class="toggle-open">&plus;</span>
	                        <span class="toggle-close">&minus;</span>
	                    </div>
	                </div>
	                <ul class="product-filters-list open">
	                    ${facetHtml}
	                </ul>
	            </div>`;
			}

		}

		$productFiltersContainer.html(filterHtml);
		if (filterHtml.trim() == "") {
			$("#faceted-search-container-b2b").remove();
		}

		console.log(selectedFacets);
		_bindEvents();

	}

	const getFacetHtml = function(type_name, buckets, attribute) {
		let facetHtml = "";

		switch (type_name) {
			case "select":
				facetHtml += "";
				for (let j = 0; j < buckets.length; j++) {
					const bucket = buckets[j];
					const bucket_value = bucket.value;
					const isChecked = bucket.select ? 'checked' : '';
					if (bucket.count > 0) {
						facetHtml += `
					    <li>
	                        <label data-facet-search data-facet-attribute="${attribute}" data-facet-value="${bucket_value}" for="noid"><input type="checkbox" value="${bucket.value}" ${isChecked}><span>${bucket.title}</span> <span>(${bucket.count})</span></label>
	                    </li>`;

						if (isChecked) {
							selectedFacets[attribute] = selectedFacets[attribute] || [];
							selectedFacets[attribute].push(bucket_value + "");
						}
					}
				}
				break;
			case "slider":
				facetHtml += "";
				for (let j = 0; j < buckets.length; j++) {
					const bucket = buckets[j];
					const bucket_value = bucket.value;
					const isChecked = bucket.select ? 'checked' : '';

					if (bucket.left != 0 || bucket.right != 0) {
						selectedFacets[attribute] = selectedFacets[attribute] || [];
						selectedFacets[attribute].push(bucket.left);
						selectedFacets[attribute].push(bucket.right);

						facetHtml += `<li><a href="javascript:void(0);" class="clear-price-range" data-faceted-search-range="clear">Clear</a><div class="form-minMaxRow">
		                    <div class="form-field">
		                        <input name="min_price" placeholder="Min." min="0" class="form-input form-input--small" required="" type="number" value="${bucket.left}">
		                    </div>

		                    <div class="form-field">
		                        <input name="max_price" placeholder="Max." min="0" class="form-input form-input--small" required="" type="number" value="${bucket.right}">
		                    </div>

		                    <div class="form-field">
		                        <button class="button button--small" type="button" data-faceted-search-range>
		                            Update
		                        </button>
		                    </div>
		                </div></li>`;
					} else {
						facetHtml += `<li><div class="form-minMaxRow">
		                    <div class="form-field">
		                        <input name="min_price" placeholder="Min." min="0" class="form-input form-input--small" required="" type="number" value="">
		                    </div>

		                    <div class="form-field">
		                        <input name="max_price" placeholder="Max." min="0" class="form-input form-input--small" required="" type="number" value="">
		                    </div>

		                    <div class="form-field">
		                        <button class="button button--small" type="button" data-faceted-search-range>
		                            Update
		                        </button>
		                    </div>
		                </div></li>`;

					}

				}
				break;
			default:

		}
		return facetHtml;

	}

	const _bindEvents = function() {
		$(".product-filters-title").unbind().bind('click', function() {
			$(this).toggleClass("open").next('.product-filters-list').toggleClass("open");
		});

		$("[data-facet-search]").unbind().bind('click', function(event) {
			pageNumber = 1;
			//event.preventDefault();
			console.log("facet click");
			const $inputCheckBox = $(this).find('input[type="checkbox"]');
			if ($inputCheckBox.length > 0 && $inputCheckBox.prop("checked") == true) {
				$inputCheckBox.prop("checked", false);

			} else {
				$inputCheckBox.prop("checked", true);

			}
			const facetAttribute = $(this).attr('data-facet-attribute');
			const facetValue = $(this).attr('data-facet-value');

			if (selectedFacets[facetAttribute]) {
				//exist facet
				let value_arr = selectedFacets[facetAttribute];
				const value_index = $.inArray(facetValue, value_arr);
				if (value_index == -1) {
					// new value, add
					value_arr.push(facetValue);
				} else {
					// exist value, remove
					value_arr.splice(value_index, 1);
				}

				// if no values, remove the filter
				if (value_arr.length == 0) {
					delete selectedFacets[facetAttribute];
				}

			} else {
				// new facet
				selectedFacets[facetAttribute] = [facetValue];
			}

			let filterString = ""; //filtersBy={"category_id":%20"23|41|39|61"}

			$.each(selectedFacets, function(facet, values) {
				const valuesString = values.join("|");
				filterString += `,"${facet}":"${valuesString}"`;
			});

			if (filterString.trim() != "") {
				filterString = filterString.substring(1, filterString.length);
				filterString = "&filtersBy={" + filterString + "}";
			}

			let ajaxUrl2 = `${config.apiRootUrl}/search?store_hash=${config.storeHash}&keywords=${keywords}&is_facets=1&catalog_id=${gCatalogId}${filterString}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
			console.log(ajaxUrl2);
			ajaxUrl2 = encodeURI(ajaxUrl2);
			console.log(ajaxUrl2);
			search(ajaxUrl2).then(res => {
				console.log(res);

				_initFacets(res);
				_initProducts(res);
				$("#b2b_search_result_count").text(`${res.total_count || 0} results for '${keywords}'`);

				if (res.total_count == 0) {
					$("#jqPagination").html("");
					//$(".page-sidebar-b2b").remove();
					return;
				}
				$("#jqPagination").jqPaginator({
					totalPages: Math.ceil(res.total_count / pageSize),
					visiblePages: 5,
					currentPage: pageNumber,
					onPageChange: (num, type) => {
						if (pageNumber == num) return;
						pageNumber = num;
						ajaxUrl = `${config.apiRootUrl}/search?store_hash=${config.storeHash}&keywords=${keywords}&is_facets=1&catalog_id=${gCatalogId}${filterString}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
						ajaxUrl = encodeURI(ajaxUrl);
						search(ajaxUrl).then(res => {
							_initFacets(res);
							_initProducts(res);
							$("#b2b_search_result_count").text(`${res.total_count || 0} results for '${keywords}'`);
						});
					}
				});

			});

		});

		$("[data-faceted-search-range]").unbind().bind('click', (event) => {
			pageNumber = 1;
			const $target = $(event.currentTarget);
			const $minPrice = $('input[name="min_price"]');
			const $maxPrice = $('input[name="max_price"]');
			const minPriceValue = $minPrice.val();
			const maxPriceValue = $maxPrice.val();

			if (minPriceValue == "" || maxPriceValue == "") {
				return alert("Please enter price range");
			}
			if (minPriceValue == 0 && maxPriceValue == 0) {
				return alert("Please enter price range");
			}
			if (parseInt(minPriceValue) > parseInt(maxPriceValue)) {
				return alert("Min price can't be bigger than Max price");
			}

			if ($target.attr("data-faceted-search-range") == "clear") {
				delete selectedFacets["base_price"];
			} else {
				selectedFacets["base_price"] = [minPriceValue, maxPriceValue];
			}


			let filterString = ""; //filtersBy={"category_id":%20"23|41|39|61"}

			$.each(selectedFacets, function(facet, values) {
				const valuesString = values.join("|");
				filterString += `,"${facet}":"${valuesString}"`;
			});

			if (filterString.trim() != "") {
				filterString = filterString.substring(1, filterString.length);
				filterString = "&filtersBy={" + filterString + "}";
			}

			let ajaxUrl2 = `${config.apiRootUrl}/search?store_hash=${config.storeHash}&keywords=${keywords}&is_facets=1&catalog_id=${gCatalogId}${filterString}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
			console.log(ajaxUrl2);
			ajaxUrl2 = encodeURI(ajaxUrl2);
			console.log(ajaxUrl2);
			search(ajaxUrl2).then(res => {
				console.log(res);

				_initFacets(res);
				_initProducts(res);
				$("#b2b_search_result_count").text(`${res.total_count || 0} results for '${keywords}'`);

				if (res.total_count == 0) {
					$("#jqPagination").html("");
					//$(".page-sidebar-b2b").remove();
					return;
				}
				$("#jqPagination").jqPaginator({
					totalPages: Math.ceil(res.total_count / pageSize),
					visiblePages: 5,
					currentPage: pageNumber,
					onPageChange: (num, type) => {
						if (pageNumber == num) return;
						pageNumber = num;
						ajaxUrl = `${config.apiRootUrl}/search?store_hash=${config.storeHash}&keywords=${keywords}&is_facets=1&catalog_id=${gCatalogId}${filterString}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
						ajaxUrl = encodeURI(ajaxUrl);
						search(ajaxUrl).then(res => {
							_initFacets(res);
							_initProducts(res);
							$("#b2b_search_result_count").text(`${res.total_count || 0} results for '${keywords}'`);
						});
					}
				});

			});


		});

	}

	const getCatalogPrice = function(base_price, tier_price_array, qty) {
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
