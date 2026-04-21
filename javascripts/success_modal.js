import EventBus from './event_bus.js';
import Basket from './basket.js';
import { formatCurrency } from './helper.js';

export default class SuccessModal {
  constructor() {
    this.element = document.getElementById('js-success-component');
    this.receiptContainer = document.getElementById('js-success-receipt');
    EventBus.addEventListener('order:submit:finished', () => this.#show());
  }

  #show() {
    console.log('show success modal');
    this.#renderReceipt();
    this.element.style.display = 'flex';
    document.body.classList.add('success-active');

    const orderForm = document.getElementById('orderForm');
    const stickyFooter = document.querySelector('.sticky-footer');

    if (orderForm) orderForm.style.display = 'none';
    if (stickyFooter) stickyFooter.style.display = 'none';

    Basket.clear();
  }

  #renderReceipt() {
    let itemsHtml = '';
    Basket.each((product, qty) => {
      const itemTotal = parseFloat(product.price) * qty;
      itemsHtml += `
        <div class="receipt-row">
          <div class="receipt-col-desc">
            <span class="receipt-item-name">${product.name}</span>
            <span class="receipt-item-qty">${qty} x ${formatCurrency(product.price)}</span>
          </div>
          <div class="receipt-col-price">${formatCurrency(itemTotal)}</div>
        </div>
      `;
    });

    this.receiptContainer.innerHTML = `
      <div class="receipt">
        <div class="receipt-title">ORDER RECEIPT</div>
        <div class="receipt-body">
          ${itemsHtml}
        </div>
        <div class="receipt-footer">
          <div class="receipt-row total">
            <span>TOTAL AMOUNT</span>
            <span>${formatCurrency(Basket.total())}</span>
          </div>
        </div>
      </div>
    `;
  }
}