export default class ProductView {
  constructor(product) {
    this.product = product;
  }

  render() {
    const template = document.getElementById('js-product-template');
    this.productElement = template.content.cloneNode(true);

    this.#el('name').textContent = this.product.name;
    this.#el('description').textContent = this.product.description;
    this.#el('price').textContent = `P${this.product.price}`;
    this.#el('image').src = this.product.imageUrl;
    this.#el('quantity').name = `qty_${this.product.id}`;

    this.#handleQtyControls();

    return this.productElement;
  }

  reload() {
    this.#updateQtyDisplay();
  }

  #updateQtyDisplay() {
    const qty = parseInt(this.#el('quantity').value);

    if (qty > 0) {
      this.#el('decrement').style.display = 'flex';
      this.#el('qtyDisplay').style.display = 'block';
      this.#el('qtyDisplay').textContent = qty;
    } else {
      this.#el('decrement').style.display = 'none';
      this.#el('qtyDisplay').style.display = 'none';
    }
  }

  #handleQtyControls() {
    this.#el('decrement').addEventListener('click', () => {
      const currentQty = parseInt(this.#el('quantity').value);
      if (currentQty > 0) this.#el('quantity').value = currentQty - 1;

      this.reload();
    });

    this.#el('add').addEventListener('click', () => {
      const currentQty = parseInt(this.#el('quantity').value);
      if (currentQty < this.product.available) this.#el('quantity').value = currentQty + 1;

      this.reload();
    });
  }

  #el(key) {
    if (this._elements) return this._elements[key];

    this._elements = { 
      name: this.productElement.querySelector('.js-product-name'),
      description: this.productElement.querySelector('.js-product-description'),
      price: this.productElement.querySelector('.js-product-price'),
      image: this.productElement.querySelector('.js-product-image'),
      quantity: this.productElement.querySelector('.js-product-quantity'),
      qtyDisplay: this.productElement.querySelector('.js-quantity-display'),
      decrement: this.productElement.querySelector('.js-decrement-btn'),
      add: this.productElement.querySelector('.js-add-to-cart-btn'),
      unavailableText: this.productElement.querySelector('.js-unavailable-text'),
      availabilityText: this.productElement.querySelector('.js-availability-text'),
    };

    return this._elements[key];
  }
}