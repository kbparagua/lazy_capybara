import EventBus from './event_bus.js';
import Basket from './basket.js';

const selectors = {
  itemCount: '.js-basket-item-count',
  totalAmount: '.js-basket-total'
};

export default class BasketButton {
  static init() {
    const els = {
      itemCount: document.querySelector(selectors.itemCount),
      totalAmount: document.querySelector(selectors.totalAmount)
    };

    EventBus.addEventListener('basket:updated', () => {
      els.itemCount.textContent = `${Basket.count()} items`;
      els.totalAmount.textContent = `P${Basket.total().toFixed(2)}`;
    });
  }
}