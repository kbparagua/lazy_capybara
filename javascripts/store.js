import productsJson from '../data/products.json' with { type: 'json' };
import ProductRepository from './product_repository.js';
import CategoryView from './category_view.js';
import Basket from './basket.js';
import BasketButton from './basket_button.js';

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
  Basket.init();
  new BasketButton();

  showLoadingComponent();
  startSequentialLoadingMessages();
  renderProducts();

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
  const cartItems = getCartItems();
  populateCartModal(cartItems);
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

function getCartItems() {
  const cartItems = [];
  const quantityInputs = document.querySelectorAll('.js-product-quantity');
  
  quantityInputs.forEach(input => {
    const quantity = parseInt(input.value);
    if (quantity > 0) {
      const productId = input.name.replace('qty_', '');
      const product = allProducts[productId];
      if (product) ;{
        cartItems.push({
          ...product,
          quantity: quantity
        });
      }
    }
  });
  
  return cartItems;
}

function populateCartModal(cartItems) {
  const modalItemsContainer = document.getElementById('js-modal-items');
  modalItemsContainer.innerHTML = '';
  
  if (cartItems.length === 0) {
    modalItemsContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Your basket is empty</p>';
    updateModalSummary([]);
    return;
  }
  
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

function updateModalSummary(cartItems) {
  let totalItems = 0;
  let totalAmount = 0;
  
  cartItems.forEach(item => {
    totalItems += item.quantity;
    totalAmount += (parseFloat(item.price) || 0) * item.quantity;
  });
  
  const totalItemsEl = document.getElementById('js-total-items');
  const totalAmountEl = document.getElementById('js-total-amount');
  
  const itemText = totalItems === 1 ? '1 item' : `${totalItems} items`;
  totalItemsEl.textContent = itemText;
  totalAmountEl.textContent = `P${totalAmount.toFixed(2)}`;
}

function updateCartItemQuantity(productId, change) {
  const quantityInput = document.querySelector(`.js-product-quantity[name="qty_${productId}"]`);
  if (quantityInput) {
    const product = allProducts[productId];
    const availableQuantity = product ? (parseInt(product.available) || 0) : 0;
    
    let newValue = Math.max(0, parseInt(quantityInput.value) + change);
    
    // Don't allow exceeding available quantity
    if (availableQuantity > 0) {
      newValue = Math.min(newValue, availableQuantity);
    }
    
    quantityInput.value = newValue;
    
    // Update the display on the product item if visible
    const productItem = quantityInput.closest('.product-item');
    if (productItem && productItem.offsetParent !== null) {
      const quantityDisplay = productItem.querySelector('.js-quantity-display');
      const decrementBtn = productItem.querySelector('.js-decrement-btn');
      const addBtn = productItem.querySelector('.js-add-to-cart-btn');
      const availabilityText = productItem.querySelector('.js-availability-text');
      
      if (newValue > 0) {
        decrementBtn.style.display = 'flex';
        quantityDisplay.style.display = 'block';
        quantityDisplay.textContent = newValue;
      } else {
        decrementBtn.style.display = 'none';
        quantityDisplay.style.display = 'none';
      }
      
      // Update availability text and button state
      if (availabilityText && availableQuantity > 0) {
        const remaining = availableQuantity - newValue;
        availabilityText.textContent = `${remaining} available`;
        
        if (newValue >= availableQuantity) {
          addBtn.style.opacity = '0.5';
          addBtn.style.cursor = 'not-allowed';
          addBtn.style.pointerEvents = 'none';
        } else {
          addBtn.style.opacity = '1';
          addBtn.style.cursor = 'pointer';
          addBtn.style.pointerEvents = 'auto';
        }
      }
    }
    
    // Refresh the modal display and update button state
    showCartModal();
    updatePlaceOrderButtonState();
    updateBasketButton();
    
    // Save cart to localStorage
    saveCartToLocalStorage();
  }
}
