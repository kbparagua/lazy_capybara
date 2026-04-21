import EventBus from './event_bus.js';
import Basket from './basket.js';

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
  }

  #renderReceipt() {
    let itemsHtml = '';
    Basket.each((product, qty) => {
      const itemTotal = (parseFloat(product.price) * qty).toFixed(2);
      itemsHtml += `
        <div class="receipt-row">
          <div class="receipt-col-desc">
            <span class="receipt-item-name">${product.name}</span>
            <span class="receipt-item-qty">${qty} x P${parseFloat(product.price).toFixed(2)}</span>
          </div>
          <div class="receipt-col-price">P${itemTotal}</div>
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
            <span>P${Basket.total().toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }
}