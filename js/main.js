$(document).ready(function() {

  var productTransitionLinks = document.querySelectorAll('a.product-transition-link');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Array.prototype.forEach.call(productTransitionLinks, function(productTransitionLink) {
    productTransitionLink.addEventListener('click', function(event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reducedMotion || document.documentElement.classList.contains('is-transitioning-to-products')) return;

      event.preventDefault();

      try {
        window.sessionStorage.setItem('tx-products-entry', 'home');
      } catch (error) {}

      document.documentElement.classList.add('is-transitioning-to-products');

      window.setTimeout(function() {
        window.location.assign(productTransitionLink.href);
      }, 480);
    });
  });

  window.addEventListener('pageshow', function() {
    document.documentElement.classList.remove('is-transitioning-to-products');
  });

  window.addEventListener('hashchange', function() {
    if (window.location.hash === '#blog') {
      window.location.replace(window.location.pathname + window.location.search);
    }
  });

  if (window.location.pathname.substring(0, 5) == "/tag/") {
    $('.panel-cover').addClass('panel-cover--collapsed');
  }

  $('.btn-mobile-menu__icon').click(function() {
    if ($('.navigation-wrapper').css('display') == "block") {
      $('.navigation-wrapper').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
        $('.navigation-wrapper').toggleClass('visible animated bounceOutUp');
        $('.navigation-wrapper').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
      });
      $('.navigation-wrapper').toggleClass('animated bounceInDown animated bounceOutUp');

    } else {
      $('.navigation-wrapper').toggleClass('visible animated bounceInDown');
    }
    $('.btn-mobile-menu__icon').toggleClass('fa fa-list fa fa-angle-up animated fadeIn');
  });

});
