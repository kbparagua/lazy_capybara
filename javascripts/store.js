import productsJson from '../data/products.json' with { type: 'json' };
import ProductRepository from './product_repository.js';
import CategoryView from './category_view.js';
import Basket from './basket.js';
import BasketButton from './basket_button.js';
import BasketView from './basket_view.js';
import OrderForm from './order_form.js';
import Loading from './loading.js';

ProductRepository.init(productsJson, { excludeOutOfStock: true });

document.addEventListener('DOMContentLoaded', async () => {
  new OrderForm();
  new BasketButton();
  new BasketView();
  new Loading();  

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
    const categoryView = CategoryView.create(category, products);
    document.getElementById('js-categories').appendChild(categoryView);
  });

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

function showSuccessComponent() {
  const successComponent = document.getElementById('js-success-component');
  const orderForm = document.getElementById('orderForm');
  const stickyFooter = document.querySelector('.sticky-footer');
  orderForm.style.display = 'none';
  stickyFooter.style.display = 'none';
  successComponent.style.display = 'flex';
}