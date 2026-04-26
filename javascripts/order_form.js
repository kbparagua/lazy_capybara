const LAZY_CAPYBARA_URL = 'https://script.google.com/macros/s/AKfycbxWJXAn5WA2OciKoZ9bgLLPWcrIMCA5G3F-Aq8HHMtlK5Ua85Bj3-EtGBxutVbVWemfZQ/exec'

import EventBus from './event_bus.js';
import Basket from './basket.js';
import Params from './params.js';

export default class OrderForm {
  constructor() {
    this.element = document.getElementById('orderForm');
    this.element.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.#submit();
    });
  }

  async #submit() {
    EventBus.dispatchEvent(new CustomEvent('order:submit:started'));

    const customer = this.element.querySelector('[data-customer-name]').value;
    const items = this.#items();
    const itemCount = Basket.count();
    const totalAmount = Basket.total();
    const verificationCode = Params.verificationCode;

    const payload = {
      secret: verificationCode,
      order: {
        customer,
        items,
        itemCount,
        totalAmount
      }
    };
    
    console.log('Placing order: ', payload);

    const stringifiedPayload = JSON.stringify(payload);
    const response = await fetch(LAZY_CAPYBARA_URL, { method: 'POST', body: stringifiedPayload });
    const json = await response.json();

    console.log("Received response:", json);

    if (json.success) {
      EventBus.dispatchEvent(new CustomEvent('order:submit:success'));
    } else {
      EventBus.dispatchEvent(new CustomEvent('order:submit:error'));
    }

    EventBus.dispatchEvent(new CustomEvent('order:submit:finished'));
  }

  #items() {
    const items = [];
    Basket.each((product, qty) => {
      const item = `${product.sku} x ${qty}`;
      items.push(item);
    });

    return items.join("\n");
  }
}