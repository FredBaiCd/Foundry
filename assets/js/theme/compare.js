import PageManager from '../PageManager';
import ProductUtils from './product/product-utils';

export default class Compare extends PageManager {
  constructor() {
    super();

    this.productUtils = new ProductUtils($('.compare-action-row td'));
  }

  loaded(next) {
    this.productUtils.init();
  }
}
