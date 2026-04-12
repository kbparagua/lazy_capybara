import productsJson from '../data/products.json' with { type: 'json' };
import ProductRepository from './product_repository.js';
import CategoryView from './category_view.js';
import Basket from './basket.js';
import BasketButton from './basket_button.js';
import BasketView from './basket_view.js';

const LAZY_CAPYBARA_URL = 'https://script.google.com/macros/s/AKfycbxWJXAn5WA2OciKoZ9bgLLPWcrIMCA5G3F-Aq8HHMtlK5Ua85Bj3-EtGBxutVbVWemfZQ/exec';

// Supported actions
const LOAD_DATA_ACTION = 'load_data';
const PLACE_ORDER_ACTION = 'place_order';

const PRODUCT_COLUMNS = ['id', 'name', 'description', 'category', 'price', 'imageUrl', 'available'];

let allProducts = {};

const CLIENT_SECRET = (new URLSearchParams(window.location.search)).get('s');

const CART_STORAGE_KEY = 'lazy_capybara_cart';

let loadingMessageInterval = null;

ProductRepository.init(productsJson, { excludeOutOfStock: true });

const LOADING_MESSAGES = [
  "Seeing what's fresh and ready...",
  "Counting what's left in the pantry...",
  "Making every treat look irresistible...",
  "Putting on our chef's hat to prepare your order..."
];

async function sendRequest(action, data) {
  const stringifiedData = JSON.stringify({ client_secret: CLIENT_SECRET, action, ...data });
  const response = await fetch(LAZY_CAPYBARA_URL, { method: 'POST', body: stringifiedData });
  const json = await response.json();

  console.log(`response for action ${action}:`);
  console.log(json);

  return json;
}

async function placeOrder(orderData) {
  console.log("Placing order with data:", orderData);
  const response = await sendRequest(PLACE_ORDER_ACTION, { order: orderData });

  return true;
}

function isCartEmpty() {
  const quantityInputs = document.querySelectorAll('.js-product-quantity');
  for (let input of quantityInputs) {
    if (parseInt(input.value) > 0) {
      return false;
    }
  }
  return true;
}

function updatePlaceOrderButtonState() {
  const customerNameInput = document.getElementById('js-customer-name');
  const placeOrderBtn = document.querySelector('.place-order-btn');
  
  if (customerNameInput && placeOrderBtn) {
    const hasCustomerName = customerNameInput.value.trim() !== '';
    const hasItems = !isCartEmpty();
    placeOrderBtn.disabled = !hasCustomerName || !hasItems;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  new BasketButton();
  new BasketView();

  showLoadingComponent();
  startSequentialLoadingMessages();
  renderProducts();

  Basket.init();

  const orderForm = document.getElementById('orderForm');
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading component
    showLoadingComponent();
    startSequentialLoadingMessages();
    
    const formData = new FormData(orderForm);
    const entries = Object.fromEntries(formData);

    const success = await placeOrder(entries);
    
    if (success) {
      clearCartFromLocalStorage();
      hideLoadingComponent();
      hideCartModal();
      showSuccessComponent();
    }
  });

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

    // Add listener to customer name input
    const customerNameInput = document.getElementById('js-customer-name');
    customerNameInput.addEventListener('input', updatePlaceOrderButtonState);
    
    // Initial check
    updatePlaceOrderButtonState();
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