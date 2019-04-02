import _ from 'lodash';

const priceTemplates = {
  withoutTax: _.template(`
    <% if (price.without_tax) { %>
      <span data-product-price>
        <%= price.without_tax.formatted %>
      </span>
    <% } %>

    <% if (price.rrp_without_tax) { %>
      <span class="price-rrp" data-product-rrp>
        <%= price.rrp_without_tax.formatted %>
      </span>
    <% } %>
  `),

  withTax: _.template(`
    <% if (price.with_tax) { %>
      <span data-product-price>
        <%= price.with_tax.formatted %>
      </span>
    <% } %>

    <% if (price.rrp_with_tax) { %>
      <span class="price-rrp" data-product-rrp>
        <%= price.rrp_with_tax.formatted %>
      </span>
    <% } %>
  `),

  saved: _.template(`
    <% if (price.saved) { %>
      (<%= savedString %> <%= price.saved.formatted %>)
    <% } %>
    `),
};

export { priceTemplates as default };
