import productsJson from '../data/products.json' with { type: 'json' };
import ProductRepository from './product_repository.js';
import CategoryView from './category_view.js';
import Basket from './basket.js';
import BasketButton from './basket_button.js';
import BasketView from './basket_view.js';
import OrderForm from './order_form.js';
import Loading from './loader.js';
import SuccessModal from './success_modal.js';

const Params = {
  availability: null,
  verificationCode: null,

  init: function () {
    const params = new URLSearchParams(window.location.search);
    const encodedAvailability = params.get('a');
    const encodedVerificationCode = params.get('v');

    if (!encodedAvailability || !encodedVerificationCode) throw 'invalid parameters';

    this.availability = JSON.parse(atob(encodedAvailability));
    this.verificationCode = atob(encodedVerificationCode);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    Params.init();
  }
  catch (error) {
    window.location.href = 'error.html';
    return;
  }

  ProductRepository.init(
    productsJson,
    { excludeOutOfStock: true, availability: Params.availability }
  );

  new OrderForm();
  BasketButton.init();
  new BasketView();
  new Loading();  
  new SuccessModal();

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