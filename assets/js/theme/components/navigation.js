import $ from 'jquery';

export default class Navigation {
  constructor(el) {
    this.$window = $(window);
    this.$body = $(document.body);
    this.$navigation = $(el);

    this.$primaryTier = $('[data-primary-tier]', this.$navigation);
    this.$primaryTierToggle = $('[data-primary-toggle] > a', this.$primaryTier);
    this.$flyoutTier = $('[data-flyout-tier]', this.$navigation);
    this.$flyoutTierToggle = $('[data-flyout-toggle]', this.$navigation);

    this.$branding = $('.header-branding');
    this.$searchToggle = $('.search-toggle > a', this.$navigation);
    this.$mobileNavToggle = $('.navigation-toggle-mobile-wrapper');

    this._navigationLayout();
    this._bindEvents();
  }

  _bindEvents() {

    // Toggle primary tiers
    this.$primaryTierToggle.on('click', (event) => {
      const $target = $(event.currentTarget);
      const $parent = $target.parent();
      const $tier = $target.siblings('ul');

      event.preventDefault();

      this._toggleDropdown($parent, $tier);
    });

    this.$flyoutTier.on('close-fly-outs', (event, data) => {
      const $tier = data.$siblingTier;

      $tier.find('.visible.active').each((i, el) => {
        const $tier = $(el);
        const $parent = $tier.parent();
        const $toggle = $parent.find('> a');

        this._toggleFlyout($toggle, $parent, $tier);
      });
    });

    // Toggle flyout tiers
    this.$flyoutTierToggle.on('click', (event) => {
      const $target = $(event.currentTarget);
      const $parent = $target.parent();
      const $tier = $target.siblings('ul');

      event.preventDefault();

      this._toggleFlyout($target, $parent, $tier);
    });

    // Close all tiers on ESC press
    this.$body.on('keyup', (event) => {
      if (event.keyCode == 27) {
        this._closeAllTiers();
      }
    });

    // Close all tiers on body click
    this.$navigation.on('click', (event) => {
      event.stopPropagation();
    });

    this.$body.on('click', () => {
      if ($('ul.active', this.$navigation).length) {
        this._closeAllTiers();
      }
    });

    // Toggle mobile navigation
    this.$mobileNavToggle.on('click', (event) => {
      event.preventDefault();
      this._toggleMobileNav();
    });

    // Toggle search form
    this.$searchToggle.on('click', (event) => {
      event.preventDefault();
      this._toggleSearch();
    });
  }

  // Toggle primary tiers
  _toggleDropdown($parent, $tier) {

   // Close on any open menus
   $parent.siblings('.menu-open').each((index, el)=>{
     const $sibling = $(el);
     const $siblingTier = $sibling.find(`> [data-flyout-tier]`);

     $sibling.removeClass('menu-open');
     $siblingTier.removeClass('visible active');

     $siblingTier.trigger('close-fly-outs', {$siblingTier});
   });

    if (!$tier.hasClass('visible active')) {
      $parent.addClass('menu-open');
      $tier.addClass('visible active');
    } else {
     $parent.removeClass('menu-open');
      $tier.removeClass('visible active');
    }
  }

  // Toggle flyout tiers
  _toggleFlyout($target, $parent, $tier) {
    const $activeFlyouts = $parent.siblings('.menu-open');
    const rightDistance = this.$window.width() - ($parent.offset().left + $parent.width());

    $activeFlyouts.each((index, tier) => {
      const $tier = $(tier);

      $tier.toggleClass('menu-open active');
      $tier.find('> .nav-icon').toggleClass('icon-minus icon-plus');
      $tier.find('> .nav-submenu').toggleClass('visible active');
    });

    if (rightDistance > 238) {
      $tier.addClass('fly-right');
    } else {
      $tier.addClass('fly-left');
    }

    if (!$target.hasClass('nav-submenu-toggle')) {
      $target.toggleClass('icon-plus icon-minus');
    }

    if ($target.hasClass('nav-submenu-toggle')) {
      $target.siblings('i').toggleClass('icon-plus icon-minus');
    }

    if (!$parent.hasClass('menu-open')) {
      $parent.addClass('menu-open active');
      $tier.toggleClass('visible active');
    } else {
      $parent.removeClass('menu-open active');
      $tier.toggleClass('visible active');
    }
  }

  // Close all tiers
  _closeAllTiers() {
    const $tiers = this.$navigation.find('ul');

    for (let i = 0; i < $tiers.length; i++) {
      let $tier = $($tiers[i]);

      if ($tier.parent().hasClass('menu-open')) {
        $tier.parent().find('ul').removeClass('visible active');
        $tier.parent().find('.nav-icon').removeClass('icon-minus').addClass('icon-plus');
        $tier.parent().removeClass('menu-open');
      }
    }
  }

  // Toggle mobile navigation
  _toggleMobileNav() {
    this.$primaryTier.toggleClass('visible hidden');

    if (this.$mobileNavToggle.hasClass('menu-open')) {
      this.$body.removeClass('mobile-nav-open').addClass('mobile-nav-closed');
      this.$mobileNavToggle.toggleClass('menu-open');
    } else {
      this.$body.removeClass('mobile-nav-closed').addClass('mobile-nav-open');
      this.$mobileNavToggle.toggleClass('menu-open');
    }
  }

  // Toggle search form
  _toggleSearch() {
    $('.search-form-wrapper', this.$navigation).toggleClass('visible');
    $('.search-input', this.$navigation).focus();
  }

  // Alternate header positioning
  _navigationLayout() {
    if ($('.navigation-alternate').hasClass('navigation-left')) {
      this.$primaryTier.insertBefore('.header-branding');
    }
    this.$primaryTier.addClass('show-menu');
    this.$branding.addClass('show-branding');
  }
}
