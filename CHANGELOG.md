# Change Log

## [1.13.0] - 2017-05-18

### Added
- Unsubscribe page for when users remove themselves from mailing lists (fixes THEME-1269)
- Markup and theme settings to support Optimized Checkout

### Changed
- Added commit tag for bc-tabs


### [1.12.0] - 2017-04-27

### Changed
- Default for "Show pages in nav is now false"
- Added option for the "All {category}" link in the nav

### Fixed
- Fix an outlying bug causing display issues in checkboxes on certain forms
- Fixed issue that allowed users to click the Add To Cart button multiple times before the first click had processed (fixes THEME_1266)
- Added missing event to fix quick shop Firefox bug


### [1.11.2] - 2017-03-23

#### Changed
- The way the all link shows in the dropdown, no unneeded links for top level pages without links

#### Fixed
- options are now hidden on quickshop if they should be
- Added "show more" link to facets in faceted search


### [1.11.1] - 2017-03-16

### Fixed
- RSS syndication page corrected to display content

### [1.11.0] - 2017-03-02

#### Added
- Theme setting to show/hide 'Home' link in main nav
- Theme setting to show/hide content pages in main nav
- Theme setting to display categories in main nav or in 'Shop' menu link
- Theme setting to toggle "as low as" pricing language on product grids
- Ability to show brands (with view all link), categories or pages in footer menu

#### Changed
- In dropdowns all parent links are now able to toggle sub-navs and are duplicated so they are still accessible

### Fixed
- Category dropdowns now support 4 levels

### [1.10.2] - 2017-02-23

### Fixed
- Updated product option change trigger on page load (testing for unavailable options) (fixes THEME_1215)
- Adjusted 'add to cart' button text for unavailable products on compare page
- Product option photos no longer break slide show on quickshop
- Shipping Calculator works on Countries without State/Provence requirement on page load
- Spacing on product grid fixes when more then 15 products displayed.
- Remove duplicate of footer.scripts
- Fixed toolbar buttons in account templates (Account.js core reference)

### Added
- Added product discount prices to cart page and mini cart (fixes THEME_1217)

### [1.10.1] - 2017-02-16

### Changed
- Update contact form captcha
- Fix bulk pricing in Quick Shop
- Fix max-length for characters in form text fields

### Added
- Add more quantity options for product grids
- Add spot for physical shop address and phone number

### [1.10.0] - 2017-02-01

### Changed
- Convert build system to use NPM/Webpack instead of JSPM/SystemJS

### [1.1.15] - 2016-12-15

### Changed
- Allow required checkboxes to validate for product customizations
- Resolve conflict between Flickity product slideshow and homepage slideshow
- Fix XSS bug with search form (fixes THEME_1173)
- Fix shipping calculator country and state fields
- Allow merchants to change shipping method after choosing one

### Added
- Automatically scroll to product message when product is added to cart
- Add close button to Quick Shop

### [1.1.14] - 2016-11-17

### Added
- Added lang attribute to html tag, remove unused IE-conditional tags
- Added Apple Pay payment icon

### [1.1.13] - 2016-11-10

### Added
- Apple Pay

### Changed
- Remove product customization checkbox default value
- Remove header and footer from unavailable pages

### [1.1.12] - 2016-11-3

### Changed
- Converted theme to use JSON-LD for schama.org structured data

### [1.1.11] - 2016-10-27

### Added
- Add name definition to structured data on product pages

### [1.1.10] - 2016-10-20

### Changed
- Fix alignment issue for product rows of three or five products
- Fix z-index issue with swatches overlapping other swatch option sets
- Fix swatch pattern hover preview image size
- Fix login and new customer styles on smaller breakpoints

### Added
- Added pagination to brand listings template (fixes THEME_1047)

### [1.1.9] - 2016-10-13

### Changed
- Allow multiple estimations for the shipping calculator. (fixes THEME_1120)
- Fix issue where product filtering did not display the correct amount of filter items. (fixes THEME_1124)
- Fixed issue where store maintenance message would not display. (fixes THEME_1123)
- Prevent cart from displaying gift certificate options when it's disabled. (fixes THEME_1127)

### [1.1.8] - 2016-8-30

### Added
- Reviews throttle properly when throttler is enabled from the control panel (fixes THEME_1103)

### [1.1.7] - 2016-8-25

### Added
- Added gift wrapping image preview to cart and fixed up borders on gift wrap section (fixes THEME_990)

### Changed
- Increased product image thumbnail sizes from 120x120 to 360x360 to increase resolution
- Fixed removing products on cart page redirecting to homepage on IE
- Fixed products staying in cart after clicking "x" on Android if there are more than two products in the cart

### [1.1.6] - 2016-8-17

#### Changed
- Fixed faceted search in search template

### [1.1.5] - 2016-8-4

#### Changed
- Added nofollow attribute to faceted search links

### [1.1.4] - 2016-7-28

#### Changed
- Fixed a google fonts conflict in the Theme Editor

### [1.1.3] - 2016-7-19

#### Added
- Added nofollow attribute to BC/PxU footer credits (fixed theme_972)

### [1.1.2] - 2016-6-30

#### Changed
- Removed reference to BC-Twitter JSPM module

### [1.1.1] - 2016-6-23

#### Changed
- Fix add to wish list button font
- Fix product image switching in QuickShop

#### Added
- Add classes to product meta details
- Add theme copyright option (fixes theme_1053)

### [1.1.0] - 2016-6-16

#### Added
- Theme settings for different logo positioning
- Better support for multiple navigation tiers

### [1.0.18] - 2016-6-9

#### Added
- Prevent newsletter signup form from showing when disabled in the CP (fixed theme_1044)

### [1.0.17] - 2016-6-2

#### Changed
- Fix issue where variant images wouldn't scale correctly if the image loaded before the .js

### [1.0.16] - 2016-5-27

#### Changed
- Only show currency converter if there are more then one currencies enabled
- Fix mobile currency converter functionality (fixes theme_1023)

#### Added
- Add swatch pattern product option hover effect from (fixes theme_1029)
- Add max-width and max-height dimensions to checkout page logo (fixes theme_1012)

### [1.0.15] - 2016-05-12

#### Changed
- Product images gallery will no longer show a sliver of the next image (fixes theme_1008)
- Pagination will now work properly (fixes theme_978)

### [1.0.14] - 2016-5-5

#### Changed
- Exposed $ to global window scope in app.js to fix Paypal / Braintree issue

### [1.0.13] - 2016-04-28

#### Changed

- Stop forcing images to full width
- Fix bug in signup where the state dropdown wasn't refreshing properly

### [1.0.12] - 2016-4-21

- Remove option to select 0 product reviews
- Fix bug where account page actions were not displaying
- Stylize UPS shipping quotes
- Include conditional syndicated content in page template (fixes theme_982)

#### Changed

- Adjusted quick shop gallery thumbnail layout styles
- Increase product grid item image size from 300 to 750

### [1.0.11] - 2016-3-31

#### Changed

- Adjusted quick shop gallery thumbnail layout styles
- Increase product grid item image size from 300 to 750

### [1.0.10] - 2016-3-29

#### Added
- Theme setting for product page reviews count (fixes theme_952)
- Conditional for customer account links (fixes theme_951)

### [1.0.9] - 2016-3-24

#### Changed
- Fixed carousel / quick cart z-index conflict
- Fix 'add to cart' spinner animation z-index conflict

#### Added
- Add missing 'pick one' product page lang string

### [1.0.8] - 2016-3-17

#### Changed
- Fixed product stock options issue (fixes theme_908)
- Updated social media button conditionals

#### Added
- Facebook like button integration (fixes theme_932)

### [1.0.7] - 2016-3-10

#### Changed
- Update tax display settings
- Fix dropdown / carousel z-index conflict
- Fix large image sources when using product variant images
- Refactor currency converter select options width
- Adjust category nav for top-tier access (fixes theme_869)
- Fix product slideshow thumbnail gutters

#### Added
- Add missing placeholder text string

### [1.0.6] - 2016-3-4

#### Changed
- Replaced existing product slideshow with Flickity
- Fixed product variant image switching bug (fixes theme_922)

### [1.0.5] - 2016-2-25

#### Added
- Add checkout.scss
- Add paypal checkout button (fixes theme_911)
- Add wishlists to app.js

#### Changed
- Update core module
- Update product option swatch pattern image
- Adjusted various image size definitions
- Update shipping estimator button style
- Remove outdated account templates

### [1.0.4] - 2016-2-19

#### Added
- Added sitemap link (fixes theme_883)
- Added conditional for wishlist links (fixes theme_881)
- Added conditional for review ratings (fixes theme_873)

### [1.0.3] - 2016-2-13

#### Changed
- Fixed bug re: related products formatting

### [1.0.2] - 2016-1-25

#### Changed
- Variant screenshots

#### Added
- Correct demo urls

### [1.0.1] - 2016-1-25

#### Changed
- Removed unsupported payment icons
- Reduced retina logo's max width
- Refactored button styles
- Overhauled schema settings layout

#### Added
- Products per row settings
- Container default width settings

### [1.0.0] - 2016-1-21

#### Added
- Theme screenshots

### [0.0.9] - 2016-1-20

#### Changed
- Mobile footer newsletter display

#### Added
- Banner background color theme setting

### [0.0.8] - 2016-1-19

#### Changed
- Currency converter style
- Variant styles
- Account page styles

#### Added
- Alternative header layout setting
- App snippets

### [0.0.7] - 2016-1-18

#### Changed
- Adjusted variant settings
- Removed homepage newsletter module
- Reformatted and refactored most scss

#### Added
- Flickity to replace pxu carousel
- Footer credits

### [0.0.6] - 2016-1-15

#### Added
- Added change log to directory root
