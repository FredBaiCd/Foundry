import $ from 'jquery';
import _ from 'lodash';
import Flickity from 'flickity';
import isElementInViewport from './Inview';

export default class Carousel {

  constructor(opts = {}) {
    this.options = $.extend({
      el: '[data-carousel-slides]',
      delay: '100',
      nav: '[data-carousel-pagination]',
    }, opts);

    this.flickity = new Flickity(this.options.el, {
      prevNextButtons: false,
      pageDots: true,
      wrapAround: true,
      autoPlay: this.options.delay,
      imagesLoaded: true,
      accessibility: false,
    });

    this._bindArrowButtons();
    this._bindEvents();

    // Dynamically set slider heights based on content
    this.flickity.on('cellSelect', function() {
      const $slideMaxHeight = $('[data-carousel-slides]').find('.is-selected').height();
      $('[data-carousel-slides]').find('.flickity-viewport').css({
        'max-height': $slideMaxHeight
      });
    });
  }

  _bindArrowButtons() {
    // Slideshow arrows
    $('[data-carousel-nav-item]').on('click', this.options.nav, (event) => {
      event.preventDefault();
      const $target = $(event.currentTarget);
      if ($target.data('carousel-pagination') === 'next') {
        this.flickity.next(true);
      } else {
        this.flickity.previous(true);
      }
    });
  }

  _bindEvents() {
    // Reset slider's max-height on window resize
    $(window).on('resize', _.debounce((event) => {
      const $slideMaxHeight = $('[data-carousel-slides]').find('.is-selected').height();
      $('[data-carousel-slides]').find('.flickity-viewport').css({
        'max-height': $slideMaxHeight
      });
    }, 200));

    // Play / Pause slider when in / out of viewport
    $(window).on('scroll', _.debounce(() => {
      if (isElementInViewport($(this.options.el)[0])) {
        this._playSlider();
      } else {
        this._pauseSlider();
      }
    }, 200));

    // Stop the player from firing a bunch in the background
    $(window).on('blur', () => {
      this._pauseSlider();
    });

    $(window).on('focus', () => {
      this._playSlider();
    });
  }

  _pauseSlider() {
    if(this.flickity.player.isPlaying){
      this.flickity.deactivatePlayer();
    }
  }

  _playSlider() {
    if(!this.flickity.player.isPlaying){
      this.flickity.activatePlayer();
    }
  }
}
