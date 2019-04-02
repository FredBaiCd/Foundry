import $ from 'jquery';
/*
 * Runs things on page load.
 * Currently just testing for touch events, might do more, might get replaced with Modernizr
 */

export default class ThemeInit {

  constructor() {
    this._bindCheckboxes();
    this._dismissable();
  }

  // -------------------------- Faceted search checkboxes -------------------------- //

  // fake a label/checkbox interaction even though it's a dummy checkbox with an anchor
  // to be run on any pages with faceted search
  _bindCheckboxes() {
    $(document.body).on('click', '[data-faceted-search-facet]', (event) => {
      event.preventDefault();
      const $checkbox = $(event.currentTarget).find('.facet-checkbox');

      // need to wrap in a timeout to bypass the preventDefault
      setTimeout(function () {
        $checkbox.prop('checked', !$checkbox.prop('checked'));
        $checkbox.blur();
      }, 1);
    });
  }

  // -------------------------- Dismissable messages -------------------------- //

  _dismissable() {
    $('body').on('click', '.message .dismiss', (event) => {
      event.preventDefault();
      const $target = $(event.currentTarget);
      const $message = $target.parent('.message');

      $message.one('trend', () => {
        $message.addClass('hidden');
      });

      $message.addClass('dismissed');
    });
  }

};
