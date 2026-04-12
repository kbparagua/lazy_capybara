import productsJson from '../data/products.json' with { type: 'json' };
import Products from './products.js';
import CategoryView from './category_view.js';

const LAZY_CAPYBARA_URL = 'https://script.google.com/macros/s/AKfycbxWJXAn5WA2OciKoZ9bgLLPWcrIMCA5G3F-Aq8HHMtlK5Ua85Bj3-EtGBxutVbVWemfZQ/exec';

// Supported actions
const LOAD_DATA_ACTION = 'load_data';
const PLACE_ORDER_ACTION = 'place_order';

const PRODUCT_COLUMNS = ['id', 'name', 'description', 'category', 'price', 'imageUrl', 'available'];

let allProducts = {};

const CLIENT_SECRET = (new URLSearchParams(window.location.search)).get('s');

const CART_STORAGE_KEY = 'lazy_capybara_cart';

let loadingMessageInterval = null;

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

function saveCartToLocalStorage() {
  const cart = {};
  const quantityInputs = document.querySelectorAll('.js-product-quantity');
  quantityInputs.forEach(input => {
    const quantity = parseInt(input.value) || 0;
    if (quantity > 0) {
      cart[input.name] = quantity;
    }
  });
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  if (cartData) {
    try {
      const cart = JSON.parse(cartData);
      const quantityInputs = document.querySelectorAll('.js-product-quantity');
      quantityInputs.forEach(input => {
        if (cart[input.name]) {
          input.value = cart[input.name];
        }
      });
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
    }
  }
}

function clearCartFromLocalStorage() {
  localStorage.removeItem(CART_STORAGE_KEY);
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

function updateBasketButton() {
  let itemCount = 0;
  let totalAmount = 0;
  
  const quantityInputs = document.querySelectorAll('.js-product-quantity');
  quantityInputs.forEach(input => {
    const quantity = parseInt(input.value) || 0;
    if (quantity > 0) {
      itemCount += quantity;
      const productId = input.name.replace('qty_', '');
      const product = allProducts[productId];
      if (product) {
        totalAmount += (parseFloat(product.price) || 0) * quantity;
      }
    }
  });
  
  const basketItemsEl = document.querySelector('.basket-items');
  const basketTotalEl = document.querySelector('.basket-total');
  
  const itemText = itemCount === 1 ? '1 item' : `${itemCount} items`;
  basketItemsEl.textContent = itemText;
  basketTotalEl.textContent = `P${totalAmount.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', async () => {
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
    updateBasketButton();
});

function renderProducts() {
  const allProducts = new Products(productsJson);

  allProducts.eachByCategory((category, products) => {
    const categoryView = new CategoryView(category, products);
    document.getElementById('js-categories').appendChild(categoryView.render());
  });

  hideLoadingComponent();
  const orderForm = document.getElementById('orderForm');
  const stickyFooter = document.querySelector('.sticky-footer');
  orderForm.style.display = 'block';
  stickyFooter.style.display = 'flex';
}

function appendProductToList(product, list) {
  const template = document.getElementById('js-product-template');
  const productElement = template.content.cloneNode(true);

  productElement.querySelector('.js-product-name').textContent = product.name;
  productElement.querySelector('.js-product-description').textContent = product.description;
  productElement.querySelector('.js-product-price').textContent = `P${product.price}`;
  productElement.querySelector('.js-product-image').src = product.imageUrl;
  const quantityInput = productElement.querySelector('.js-product-quantity');
  quantityInput.name = `qty_${product.id}`;
  
  const decrementBtn = productElement.querySelector('.js-decrement-btn');
  const quantityDisplay = productElement.querySelector('.js-quantity-display');
  const addBtn = productElement.querySelector('.js-add-to-cart-btn');
  const unavailableText = productElement.querySelector('.js-unavailable-text');
  const availabilityText = productElement.querySelector('.js-availability-text');
  
  const availableQuantity = parseInt(product.available) || 0;
  const isAvailable = availableQuantity > 0;
  
  const productItem = productElement.firstElementChild;
  
  if (!isAvailable) {
    addBtn.style.display = 'none';
    unavailableText.style.display = 'block';
    unavailableText.textContent = 'sorry, this is currently out of stock';
    availabilityText.style.display = 'none';
    productItem.classList.add('out-of-stock');
  } else {
    availabilityText.textContent = `${availableQuantity} available`;
  }
  
  const updateDisplay = () => {
    const value = parseInt(quantityInput.value);
    const remaining = availableQuantity - value;
    
    if (value > 0) {
      decrementBtn.style.display = 'flex';
      quantityDisplay.style.display = 'block';
      quantityDisplay.textContent = value;
    } else {
      decrementBtn.style.display = 'none';
      quantityDisplay.style.display = 'none';
    }
    
    // Update availability text and disable + button if max quantity reached
    if (isAvailable) {
      availabilityText.textContent = `${remaining} available`;
      
      if (value >= availableQuantity) {
        addBtn.style.opacity = '0.5';
        addBtn.style.cursor = 'not-allowed';
        addBtn.style.pointerEvents = 'none';
      } else {
        addBtn.style.opacity = '1';
        addBtn.style.cursor = 'pointer';
        addBtn.style.pointerEvents = 'auto';
      }
    }
    
    // Update Place Order button state
    updatePlaceOrderButtonState();
    
    // Update basket button
    updateBasketButton();
    
    // Save cart to localStorage
    saveCartToLocalStorage();
  };
  
  addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAvailable) {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue < availableQuantity) {
        quantityInput.value = currentValue + 1;
        updateDisplay();
      }
    }
  });
  
  decrementBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const newValue = Math.max(0, parseInt(quantityInput.value) - 1);
    quantityInput.value = newValue;
    updateDisplay();
  });

  list.appendChild(productElement);
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
      if (product) {
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
