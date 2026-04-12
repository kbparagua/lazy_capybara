export default class ProductView {
  constructor(product) {
    this.product = product;
  }

  render() {
    const template = document.getElementById('js-product-template');
    const productElement = template.content.cloneNode(true);

    productElement.querySelector('.js-product-name').textContent = this.product.name;
    productElement.querySelector('.js-product-description').textContent = this.product.description;
    productElement.querySelector('.js-product-price').textContent = `P${this.product.price}`;
    productElement.querySelector('.js-product-image').src = this.product.imageUrl;
    const quantityInput = productElement.querySelector('.js-product-quantity');
    quantityInput.name = `qty_${this.product.id}`;

    return productElement;
  }
}