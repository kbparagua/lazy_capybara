const CLIENT_SECRET = (new URLSearchParams(window.location.search)).get('s');
const LAZY_CAPYBARA_URL = 'https://script.google.com/macros/s/AKfycbxWJXAn5WA2OciKoZ9bgLLPWcrIMCA5G3F-Aq8HHMtlK5Ua85Bj3-EtGBxutVbVWemfZQ/exec';
const PLACE_ORDER_ACTION = 'place_order';

import EventBus from './event_bus.js';

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

    const formData = new FormData(this.element);
    const entries = Object.fromEntries(formData);

    console.log("Placing order with data:", entries);
    // const stringifiedData = JSON.stringify({ client_secret: CLIENT_SECRET, action: PLACE_ORDER_ACTION, ...entries });
    // const response = await fetch(LAZY_CAPYBARA_URL, { method: 'POST', body: stringifiedData });
    // const json = await response.json();

    // console.log("Received response:", json);
    setTimeout(() => {
      EventBus.dispatchEvent(new CustomEvent('order:submit:finished'));
    }, 3000)

    return true;
  }
}