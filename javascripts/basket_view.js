import EventBus from './event_bus.js';
import Basket from './basket.js';

export default class BasketView {
  constructor() {
    this.element = document.getElementById('js-cart-modal');
    this.customerNameInput = document.getElementById('js-customer-name');
    this.customerNameInput.addEventListener('input', () => this.#updatePlaceOrderButtonState());

    EventBus.addEventListener('basket:updated', () => this.render());
  }

  render() {
    console.log('update basket view');

    this.#updateSummary();

    const itemsContainer = this.element.querySelector('#js-modal-items');
    itemsContainer.innerHTML = '';
  
    if (Basket.count() == 0) {
      itemsContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Your basket is empty</p>';
      return;
    }
  
    Basket.each((product, qty) => {
      console.log(product);
      const template = document.getElementById('js-modal-item-template');
      const itemElement = template.content.cloneNode(true);
      
      console.log(product);
      console.log('qty', qty);

      itemElement.querySelector('.modal-item-name').textContent = product.name;
      itemElement.querySelector('.modal-item-quantity').textContent = qty;
      itemElement.querySelector('.modal-item-price').textContent = `P${(product.price * qty).toFixed(2)}`;
      
      // Add product ID as data attribute
      // const modalItem = itemElement.querySelector('.modal-item');
      // modalItem.dataset.productId = product.id;

      // Add event listeners for increment/decrement buttons
      // const incrementBtn = itemElement.querySelector('.modal-item-increment-btn');
      // const decrementBtn = itemElement.querySelector('.modal-item-decrement-btn');
      
      // incrementBtn.addEventListener('click', (e) => {
      //   e.preventDefault();
      //   updateCartItemQuantity(item.id, 1);
      // });
      
      // decrementBtn.addEventListener('click', (e) => {
      //   e.preventDefault();
      //   updateCartItemQuantity(item.id, -1);
      // });

      itemsContainer.appendChild(itemElement);
    });

    this.#updatePlaceOrderButtonState();
  }

  #updateSummary() {
    let totalItems = 0;
    let totalAmount = 0;
  
    Basket.each((product, qty) => {
      totalItems += qty;
      totalAmount += (parseFloat(product.price) || 0) * qty;
    });
    
    const totalItemsEl = document.getElementById('js-total-items');
    const totalAmountEl = document.getElementById('js-total-amount');
    
    const itemText = totalItems === 1 ? '1 item' : `${totalItems} items`;
    totalItemsEl.textContent = itemText;
    totalAmountEl.textContent = `P${totalAmount.toFixed(2)}`;
  }

  #updatePlaceOrderButtonState() {
    const placeOrderBtn = document.querySelector('.place-order-btn');
    const customerName = this.customerNameInput.value.trim();
  
    placeOrderBtn.disabled = customerName === '' || Basket.count() === 0;
  }
}