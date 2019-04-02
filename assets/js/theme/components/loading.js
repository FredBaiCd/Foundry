import $ from 'jquery';

export default function($scope, overlay) {
  const $body = $(document.body);
  const $loadingOverlay = $('.loading-overlay');

  $body.toggleClass('is-loading');
  $('.loading-progress').toggleClass('visible');

  if (overlay) {
    if ($body.hasClass('is-loading')) {
      $scope
        .css('position', 'relative')
        .prepend(`<div class='loading-overlay'><div class='loading-progress'><span>`);

      setTimeout(() => {
        $('.loading-overlay').addClass('visible');
      }, 10);
    } else {
      $loadingOverlay.removeClass('visible').one('trend', () => {
        $loadingOverlay.remove();
      });
    }
  }
}
