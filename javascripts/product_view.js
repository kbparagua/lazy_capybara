import Basket from './basket.js';
import EventBus from './event_bus.js';

const INFINITE_AVAILABILITY = -1;
const DEFAULT_MAX_QTY = 100;

const selectors = {
  template: '.js-product-template',
  name: '.js-product-name',
  description: '.js-product-description',
  price: '.js-product-price',
  image: '.js-product-image',
  quantity: '.js-product-quantity',
  qtyDisplay: '.js-quantity-display',
  remove: '.js-decrement-btn',
  add: '.js-add-to-cart-btn',
  unavailableText: '.js-unavailable-text',
  availabilityText: '.js-availability-text'
};

export default class ProductView {
  static create(product) {
    return (new ProductView(product)).render();
  }

  constructor(product) {
    this.product = product;
    EventBus.addEventListener('basket:updated', () => this.reload());
  }

  render() {
    const template = document.querySelector(selectors.template);
    this.el = template.content.cloneNode(true);
    this.els = this.#fetchElements();

    this.els.name.textContent = this.product.name;
    this.els.description.textContent = this.product.description;
    this.els.price.textContent = `P${this.product.price}`;
    this.els.image.src = this.product.imageUrl;
    this.els.quantity.name = `qty_${this.product.id}`;

    this.reload();
    this.#handleQtyControls();

    return this.el;
  }

  reload() {
    this.#syncQtyWithBasket();
    this.#updateQtyDisplay();
    this.#updateQtyControls();
    this.#updateAvailabilityText();
  }

  #syncQtyWithBasket() {
    const qtyInBasket = Basket.get(this.product.id) || 0;
    this.els.quantity.value = qtyInBasket;
  }

  #updateQtyDisplay() {
    const currentQty = this.#currentQty();

    if (currentQty > 0) {
      this.els.qtyDisplay.style.display = 'block';
      this.els.qtyDisplay.textContent = currentQty;
    } else {
      this.els.qtyDisplay.style.display = 'none';
    }
  }

  #updateQtyControls() {
    if (this.#canAdd()) {
      this.els.addBtn.style.opacity = '1';
      this.els.addBtn.style.cursor = 'pointer';
      this.els.addBtn.style.pointerEvents = 'auto';
    } else {
      this.els.addBtn.style.opacity = '0.5';
      this.els.addBtn.style.cursor = 'not-allowed';
      this.els.addBtn.style.pointerEvents = 'none';
    }

    if (this.#canRemove()) {
      this.els.removeBtn.style.display = 'flex';
    } else {
      this.els.removeBtn.style.display = 'none';
    }
  }

  #updateAvailabilityText() {
    const available = parseInt(this.product.available);

    // No need to show anything if availability is infinite or out of stock
    if (available === INFINITE_AVAILABILITY || available === 0) return;

    const remaining = available - this.#currentQty();
    this.els.availabilityText.textContent = `${remaining} available`;
    this.els.availabilityText.style.display = 'block';
  }


  #handleQtyControls() {
    this.els.removeBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (this.#canRemove()) {
        Basket.removeProduct(this.product.id);
        this.reload();
      }
    });

    this.els.addBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (this.#canAdd()) {
        Basket.addProduct(this.product.id);
        this.reload();
      }
    });
  }

  #canAdd() {
    if (parseInt(this.product.available) === INFINITE_AVAILABILITY) return true;

    return this.#currentQty() < this.product.available && this.#currentQty() < DEFAULT_MAX_QTY;
  }

  #canRemove() {
    return this.#currentQty() > 0;
  }

  #currentQty() {
    return parseInt(this.els.quantity.value);
  }

  #fetchElements() {
    return { 
      name: this.el.querySelector(selectors.name),
      description: this.el.querySelector(selectors.description),
      price: this.el.querySelector(selectors.price),
      image: this.el.querySelector(selectors.image),
      quantity: this.el.querySelector(selectors.quantity),
      qtyDisplay: this.el.querySelector(selectors.qtyDisplay),
      removeBtn: this.el.querySelector(selectors.remove),
      addBtn: this.el.querySelector(selectors.add),
      unavailableText: this.el.querySelector(selectors.unavailableText),
      availabilityText: this.el.querySelector(selectors.availabilityText),
    };
  }
}