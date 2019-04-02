import PageManager from '../PageManager';
import FacetedSearch from './components/faceted-search';
import ThemeUtilities from './global/theme-utilities';
import ProductCompare from './global/product-compare';

export default class Brand extends PageManager {
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
  }

  _initializeFacetedSearch() {
    const requestOptions = {
      config: {
        category: {
          shop_by_price: true
        }
      },
      template: {
        productListing: 'brand/product-index',
        filters: 'brand/filters',
      }
    };

    const options = {
      blocker: '.progress-overlay',
      bodyClass: 'ajax-progress'
    };

    new FacetedSearch(requestOptions, options, (content) => {
      $('.product-grid-filters').html(content.filters);
      $('.product-grid-list').html(content.productListing);
    });
  }
}
