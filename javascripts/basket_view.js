import EventBus from './event_bus.js';
import Basket from './basket.js';

export default class BasketView {
  constructor() {
    this.element = document.querySelector('.js-cart-modal');
    EventBus.addEventListener('basket:updated', () => this.render());
  }

  render() {
    console.log('update basket view');

    const itemsContainer = this.element.getElementById('js-modal-items');
    itemsContainer.innerHTML = '';
  
    if (Basket.count() == 0) {
      itemsContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Your basket is empty</p>';
      // updateModalSummary([]);
      return;
    }
  
    Basket.
  cartItems.forEach(item => {
    const template = document.getElementById('js-modal-item-template');
    const itemElement = template.content.cloneNode(true);
    
    itemElement.querySelector('.modal-item-name').textContent = item.name;
    itemElement.querySelector('.modal-item-quantity').textContent = item.quantity;
    itemElement.querySelector('.modal-item-price').textContent = `P${(item.price * item.quantity).toFixed(2)}`;
    
    // Add product ID as data attribute
    const modalItem = itemElement.querySelector('.modal-item');
    modalItem.dataset.productId = item.id;
    
    // Add event listeners for increment/decrement buttons
    const incrementBtn = itemElement.querySelector('.modal-item-increment-btn');
    const decrementBtn = itemElement.querySelector('.modal-item-decrement-btn');
    
    incrementBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateCartItemQuantity(item.id, 1);
    });
    
    decrementBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateCartItemQuantity(item.id, -1);
    });
    
    modalItemsContainer.appendChild(itemElement);
  });
  
  // Update modal summary
  updateModalSummary(cartItems);
}
  }
}