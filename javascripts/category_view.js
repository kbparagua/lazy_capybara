import ProductView from "./product_view.js";

const selectors = {
  template: '.js-category-template',
  categoryName: '.js-category-name',
  productList: '.js-product-list'
};

export default class CategoryView {
  static create(category, products) {
    const el = document.querySelector(selectors.template).content.cloneNode(true);
    el.querySelector(selectors.categoryName).textContent = category;

    products.forEach(product => {
      const productView = new ProductView(product);
      el.querySelector(selectors.productList).appendChild(productView.render());
    });

    return el;
  }
}