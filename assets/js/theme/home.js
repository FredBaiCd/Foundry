import $ from 'jquery';
import PageManager from '../PageManager';
import ThemeUtilities from './global/theme-utilities';
import Carousel from './components/Carousel';

export default class Home extends PageManager {
  constructor() {
    super();
    this.utilities = new ThemeUtilities();
  }

  loaded(next) {
    this.Carousel = new Carousel({
      el: '[data-carousel-slides]',
      delay: this.context.carouselDelay,
      nav: '[data-carousel-pagination]',
    });

    next();
  }
}
