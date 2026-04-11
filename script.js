const LAZY_CAPYBARA_URL = 'https://script.google.com/macros/s/AKfycbxWJXAn5WA2OciKoZ9bgLLPWcrIMCA5G3F-Aq8HHMtlK5Ua85Bj3-EtGBxutVbVWemfZQ/exec';
const PRODUCT_COLUMNS = ['id', 'name', 'description', 'category', 'price', 'imageUrl'];


document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const clientSecret = params.get('s');

    const formData = JSON.stringify({ client_secret: clientSecret });
    const response = await fetch(LAZY_CAPYBARA_URL, { method: 'POST', body: formData });

    const text = await response.text();
    const data = JSON.parse(text);

    const products = data.products ? loadProducts(data.products) : [];

    console.log(data);

    const orderForm = document.getElementById('orderForm');
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(orderForm);
      console.log(Object.fromEntries(formData));
    });
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
  
  const updateDisplay = () => {
    const value = parseInt(quantityInput.value);
    if (value > 0) {
      decrementBtn.style.display = 'flex';
      quantityDisplay.style.display = 'block';
      quantityDisplay.textContent = value;
    } else {
      decrementBtn.style.display = 'none';
      quantityDisplay.style.display = 'none';
    }
  };
  
  addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    quantityInput.value = parseInt(quantityInput.value) + 1;
    updateDisplay();
  });
  
  decrementBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const newValue = Math.max(0, parseInt(quantityInput.value) - 1);
    quantityInput.value = newValue;
    updateDisplay();
  });

  list.appendChild(productElement);
}

