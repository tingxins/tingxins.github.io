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

  var mobileMenuButton = document.querySelector('.btn-mobile-menu');
  var mobileNavigation = document.querySelector('#mobile-navigation');

  if (mobileMenuButton && mobileNavigation) {
    var mobileMenuIcon = mobileMenuButton.querySelector('.btn-mobile-menu__icon');
    var mobileCloseIcon = mobileMenuButton.querySelector('.btn-mobile-close__icon');
    var isEnglish = document.documentElement.lang === 'en';
    var menuLabels = {
      open: isEnglish ? 'Open navigation menu' : '打开导航菜单',
      close: isEnglish ? 'Close navigation menu' : '关闭导航菜单'
    };

    function setMobileMenuOpen(isOpen) {
      mobileNavigation.classList.toggle('is-open', isOpen);
      mobileMenuButton.setAttribute('aria-expanded', String(isOpen));
      mobileMenuButton.setAttribute('aria-label', isOpen ? menuLabels.close : menuLabels.open);
      mobileMenuIcon.classList.toggle('hidden', isOpen);
      mobileCloseIcon.classList.toggle('hidden', !isOpen);
    }

    mobileMenuButton.addEventListener('click', function() {
      setMobileMenuOpen(!mobileNavigation.classList.contains('is-open'));
    });

    mobileNavigation.addEventListener('click', function(event) {
      if (event.target.closest('a')) setMobileMenuOpen(false);
    });

    document.addEventListener('click', function(event) {
      if (mobileNavigation.classList.contains('is-open') && !mobileNavigation.contains(event.target) && !mobileMenuButton.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    });

    window.addEventListener('resize', function() {
      if (window.matchMedia && !window.matchMedia('(max-width: 960px)').matches) setMobileMenuOpen(false);
    });
  }

});
