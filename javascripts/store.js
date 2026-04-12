import productsJson from '../data/products.json' with { type: 'json' };
import ProductRepository from './product_repository.js';
import CategoryView from './category_view.js';
import Basket from './basket.js';
import BasketButton from './basket_button.js';
import BasketView from './basket_view.js';
import OrderForm from './order_form.js';

let loadingMessageInterval = null;

ProductRepository.init(productsJson, { excludeOutOfStock: true });

const LOADING_MESSAGES = [
  "Seeing what's fresh and ready...",
  "Counting what's left in the pantry...",
  "Making every treat look irresistible...",
  "Putting on our chef's hat to prepare your order..."
];

document.addEventListener('DOMContentLoaded', async () => {
  new OrderForm();
  new BasketButton();
  new BasketView();

  showLoadingComponent();
  startSequentialLoadingMessages();
  renderProducts();

  Basket.init();

  // Add listener to My Basket button
  const viewCartBtn = document.getElementById('view-cart-btn');
  viewCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showCartModal();
  });

  // Add close button listener
  const modalClose = document.querySelector('.modal-close');
  modalClose.addEventListener('click', (e) => {
    e.preventDefault();
    hideCartModal();
  });
});

function renderProducts() {
  ProductRepository.eachByCategory((category, products) => {
    const categoryView = new CategoryView(category, products);
    document.getElementById('js-categories').appendChild(categoryView.render());
  });

  hideLoadingComponent();
  const orderForm = document.getElementById('orderForm');
  const stickyFooter = document.querySelector('.sticky-footer');
  orderForm.style.display = 'block';
  stickyFooter.style.display = 'flex';
}
  
function showCartModal() {
  const modal = document.getElementById('js-cart-modal');
  modal.style.display = 'block';
}

function hideCartModal() {
  const modal = document.getElementById('js-cart-modal');
  modal.style.display = 'none';
}

function startSequentialLoadingMessages() {
  let messageIndex = 0;
  const loadingText = document.querySelector('.loading-text');
  
  // Set initial message
  loadingText.textContent = LOADING_MESSAGES[messageIndex];
  
  // Change message every 800ms
  loadingMessageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
    loadingText.textContent = LOADING_MESSAGES[messageIndex];
  }, 2000);
}

function showLoadingComponent() {
  const loadingComponent = document.getElementById('js-loading-component');
  const stickyFooter = document.querySelector('.sticky-footer');
  loadingComponent.style.display = 'flex';
  document.getElementById('orderForm').style.display = 'none';
  document.getElementById('js-success-component').style.display = 'none';
  stickyFooter.style.display = 'none';
}

function hideLoadingComponent() {
  if (loadingMessageInterval) {
    clearInterval(loadingMessageInterval);
    loadingMessageInterval = null;
  }
  const loadingComponent = document.getElementById('js-loading-component');
  loadingComponent.style.display = 'none';
}

function showSuccessComponent() {
  const successComponent = document.getElementById('js-success-component');
  const orderForm = document.getElementById('orderForm');
  const stickyFooter = document.querySelector('.sticky-footer');
  orderForm.style.display = 'none';
  stickyFooter.style.display = 'none';
  successComponent.style.display = 'flex';
}