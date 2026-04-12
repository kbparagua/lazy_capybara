import ProductView from "./product_view.js";

export default class CategoryView {
  constructor(category, products) {
    this.category = category;
    this.products = products;
  }

  render() {
    this.categoryElement = document.getElementById('js-category-template').content.cloneNode(true);
    this.categoryElement.querySelector('.js-category-name').textContent = this.category;

    this.products.forEach(product => {
      this.#appendProductToList(product);
    });

    return this.categoryElement;
  }

  #appendProductToList(product) {
    const productView = new ProductView(product);
    this.categoryElement.querySelector('.js-product-list').appendChild(productView.render());
  };
}