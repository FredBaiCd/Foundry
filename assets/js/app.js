import 'babel-polyfill';
import async from 'async';
import Account from './theme/core/Account';
import Auth from './theme/auth';
import Blog from './theme/Blog';
import Brand from './theme/Brand';
import Brands from './theme/Brands';
import Cart from './theme/Cart';
import Category from './theme/Category';
import Compare from './theme/Compare';
import ContactUs from './theme/ContactUs';
import Errors from './theme/Errors';
import GiftCertificate from './theme/core/GiftCertificate';
import Global from './theme/global';
import Home from './theme/home';
import OrderComplete from './theme/OrderComplete';
import Page from './theme/Page';
import Product from './theme/product';
import Search from './theme/Search';
import Sitemap from './theme/Sitemap';
import Subscribe from './theme/Subscribe';
import Wishlist from './theme/Wishlist';

const PageClasses = {
  mapping: {
    "pages/account/orders/all": Account,
    "pages/account/orders/completed": Account,
    "pages/account/orders/details": Account,
    "pages/account/orders/invoice": Account,
    "pages/account/addresses": Account,
    "pages/account/add-address": Account,
    "pages/account/add-return": Account,
    "pages/account/add-wishlist": Wishlist,
    "pages/account/recent-items": Account,
    "pages/account/download-item": Account,
    "pages/account/edit": Account,
    "pages/account/inbox": Account,
    "pages/account/return-saved": Account,
    "pages/account/returns": Account,
    "pages/auth/login": Auth,
    "pages/auth/account-created": Auth,
    "pages/auth/create-account": Auth,
    "pages/auth/forgot-password": Auth,
    "pages/blog": Blog,
    "pages/blog-post": Blog,
    "pages/brand": Brand,
    "pages/brands": Brands,
    "pages/cart": Cart,
    "pages/category": Category,
    "pages/compare": Compare,
    "pages/contact-us": ContactUs,
    "pages/errors/403": Errors,
    "pages/errors/404": Errors,
    "pages/errors/500": Errors,
    "pages/errors/generic": Errors,
    "pages/gift-certificate/purchase": GiftCertificate,
    "pages/gift-certificate/balance": GiftCertificate,
    "pages/gift-certificate/redeem": GiftCertificate,
    "global": Global,
    "pages/home": Home,
    "pages/order-complete": OrderComplete,
    "pages/page": Page,
    "pages/product": Product,
    "pages/search": Search,
    "pages/sitemap": Sitemap,
    "pages/subscribed": Subscribe,
    'pages/account/wishlist-details': Wishlist,
    'pages/account/wishlists': Wishlist
  },
  /**
   * Getter method to ensure a good page type is accessed.
   * @param page
   * @returns {*}
   */
  get(page) {
    if (this.mapping[page]) {
      return this.mapping[page];
    }
    return false;
  },
};

/**
 *
 * @param {Object} pageObj
 */
function series(pageObj) {
  async.series([
    pageObj.before.bind(pageObj), // Executed first after constructor()
    pageObj.loaded.bind(pageObj), // Main module logic
    pageObj.after.bind(pageObj), // Clean up method that can be overridden for cleanup.
  ], (err) => {
    if (err) {
      throw new Error(err);
    }
  });
}

/**
 * Loads the global module that gets executed on every page load.
 * Code that you want to run on every page goes in the global module.
 * @param {object} pages
 * @returns {*}
 */
function loadGlobal(pages) {
  const Global = pages.get('global');
  return new Global;
}

/**
 *
 * @param {function} pageFunc
 * @param {} pages
 */
function loader(pageFunc, pages) {
  if (pages.get('global')) {
    const globalPageManager = loadGlobal(pages);
    globalPageManager.context = pageFunc.context;

    series(globalPageManager);
  }
  series(pageFunc);
}

/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param templateFile String
 * @param context
 * @returns {*}
 */
window.stencilBootstrap = function stencilBootstrap(templateFile, context = {}) {
  const pages = PageClasses;

  context = JSON.parse(context);

  return {
    load() {
      // Expose jQuery to global scope
      // Fixes an issue with PayPal on the cart page
      window.$ = $;

      $(() => {
        const PageTypeFn = pages.get(templateFile); // Finds the appropriate module from the pageType object and store the result as a function.

        if (PageTypeFn) {
          const pageType = new PageTypeFn();
          pageType.context = context;
          return loader(pageType, pages);
        }

        throw new Error(`${templateFile} Module not found`);
      });
    },
  };
};
