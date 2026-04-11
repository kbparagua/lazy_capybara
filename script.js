const LAZY_CAPYBARA_URL = 'https://script.google.com/macros/s/AKfycbxWJXAn5WA2OciKoZ9bgLLPWcrIMCA5G3F-Aq8HHMtlK5Ua85Bj3-EtGBxutVbVWemfZQ/exec';

// Supported actions
const LOAD_DATA_ACTION = 'load_data';
const PLACE_ORDER_ACTION = 'place_order';

const PRODUCT_COLUMNS = ['id', 'name', 'description', 'category', 'price', 'imageUrl', 'available'];

let allProducts = {};

const CLIENT_SECRET = (new URLSearchParams(window.location.search)).get('s');

async function sendRequest(action, data) {
  const stringifiedData = JSON.stringify({ client_secret: CLIENT_SECRET, action, ...data });
  const response = await fetch(LAZY_CAPYBARA_URL, { method: 'POST', body: stringifiedData });
  const json = await response.json();

  console.log(`response for action ${action}:`);
  console.log(json);

  return json;
}

async function loadData() {
  const response = await sendRequest(LOAD_DATA_ACTION, {});

  if (response.products) {
    loadProducts(response.products);
  } else {
    console.error("Invalid response from server");
  }
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
  loadData();

  const orderForm = document.getElementById('orderForm');
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(orderForm);
    const entries = Object.fromEntries(formData);

    await placeOrder(entries);
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

function loadProducts(rawData) {
  const categories = {};
  const products = {};

  for (let i = 0; i < rawData.length; i++) {
    const product = {};
    for (let j = 0; j < PRODUCT_COLUMNS.length; j++) {
      product[PRODUCT_COLUMNS[j]] = rawData[i][j];
    }

    if (product.id == '') break;

    products[product.id] = product;

    categories[product.category] = categories[product.category] || [];
    categories[product.category].push(product);
  }

  allProducts = products;
  console.log(categories);
  renderCategories(categories);
}

function renderCategories(categories) {
  for (const category in categories) {
    const template = document.getElementById('js-category-template');
    const categoryElement = template.content.cloneNode(true);

    categoryElement.querySelector('.js-category-name').textContent = category;
    
    const productList = categoryElement.querySelector('.js-product-list');
    const products = categories[category];
    products.forEach(product => {
      appendProductToList(product, productList);
    });

    document.getElementById('js-categories').appendChild(categoryElement);
  };
  
  // Hide loading component and show form
  const loadingComponent = document.getElementById('js-loading-component');
  const orderForm = document.getElementById('orderForm');
  loadingComponent.style.display = 'none';
  orderForm.style.display = 'block';
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
  
  if (!isAvailable) {
    addBtn.style.display = 'none';
    unavailableText.style.display = 'block';
    unavailableText.textContent = 'Out of Stock';
    availabilityText.style.display = 'none';
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
  }
}

