import Basket from './basket.js';

const INFINITE_AVAILABILITY = -1;
const DEFAULT_MAX_QTY = 100;

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

    this.reload();
    this.#handleQtyControls();

    return this.productElement;
  }

  reload() {
    this.#syncQtyWithBasket();

    this.#updateQtyDisplay();
    this.#updateQtyControls();
    this.#updateAvailabilityText();
  }

  #syncQtyWithBasket() {
    const qtyInBasket = Basket.get(this.product.id) || 0;
    this.#el('quantity').value = qtyInBasket;
  }

  #updateQtyDisplay() {
    const qty = parseInt(this.#el('quantity').value);

    if (qty > 0) {
      this.#el('qtyDisplay').style.display = 'block';
      this.#el('qtyDisplay').textContent = qty;
    } else {
      this.#el('qtyDisplay').style.display = 'none';
    }
  }

  #updateQtyControls() {
    const addBtn = this.#el('add');
    const decrementBtn = this.#el('decrement');

    if (this.#canIncrementQty()) {
      addBtn.style.opacity = '1';
      addBtn.style.cursor = 'pointer';
      addBtn.style.pointerEvents = 'auto';
    } else {
      addBtn.style.opacity = '0.5';
      addBtn.style.cursor = 'not-allowed';
      addBtn.style.pointerEvents = 'none';
    }

    if (this.#canDecrementQty()) {
      decrementBtn.style.display = 'flex';
    } else {
      decrementBtn.style.display = 'none';
    }
  }

  #updateAvailabilityText() {
    const available = parseInt(this.product.available);

    // No need to show anything if availability is infinite or out of stock
    if (available === INFINITE_AVAILABILITY || available === 0) return;

    const availabilityText = this.#el('availabilityText');
    const remaining = available - this.#currentQty();

    availabilityText.textContent = `${remaining} available`;
    availabilityText.style.display = 'block';
  }


  #handleQtyControls() {
    this.#el('decrement').addEventListener('click', (e) => {
      e.preventDefault();

      if (this.#canDecrementQty()) {
        Basket.removeProduct(this.product.id);
        this.reload();
      }
    });

    this.#el('add').addEventListener('click', (e) => {
      e.preventDefault();

      if (this.#canIncrementQty()) {
        Basket.addProduct(this.product.id);
        this.reload();
      }
    });
  }

  #canIncrementQty() {
    if (parseInt(this.product.available) === INFINITE_AVAILABILITY) return true;

    return this.#currentQty() < this.product.available && this.#currentQty() < DEFAULT_MAX_QTY;
  }

  #canDecrementQty() {
    return this.#currentQty() > 0;
  }

  #currentQty() {
    return parseInt(this.#el('quantity').value);
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