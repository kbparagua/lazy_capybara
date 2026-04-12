import EventBus from './event_bus.js';
import Basket from './basket.js';

export default class BasketButton {
  constructor() {
    this.element = document.querySelector('.js-basket-btn');

    EventBus.addEventListener('basket:updated', () => this.#updateCount());
  }

  #updateCount() {
    const itemCount = document.querySelector('.js-basket-item-count');
    const totalAmount = document.querySelector('.js-basket-total');

    if (itemCount) {
      itemCount.textContent = `${Basket.count()} items`;
    }

    if (totalAmount) {
      totalAmount.textContent = `P${Basket.total().toFixed(2)}`;
    }
  }
}