import EventBus from './event_bus.js';

const storage = {};

export default {
  init(allProducts) {
    this.allProducts = allProducts;
    storage.products = JSON.parse(localStorage.getItem('basket')) || {};
  },

  get(id) {
    return storage.products[id] || 0;
  },

  addProduct(id, qty = 1) {
    storage.products[id] = (storage.products[id] || 0) + qty;
    this.persist();

    EventBus.dispatchEvent(new CustomEvent('basket:updated')); 
  },

  removeProduct(id, qty = 1) {
    if (!storage.products[id]) return;

    storage.products[id] = Math.max(0, storage.products[id] - qty);
    
    if (storage.products[id] === 0) {
      delete storage.products[id];
    }

    this.persist();
    EventBus.dispatchEvent(new CustomEvent('basket:updated')); 
  },

  count() {
    return Object.values(storage.products).reduce((sum, qty) => sum + qty, 0);
  },

  total() {
    return Object.entries(storage.products).reduce((total, [id, qty]) => {
      const product = this.allProducts.find(id);
      return total + (product ? product.price * qty : 0);
    }, 0);
  },

  persist() {
    localStorage.setItem('basket', JSON.stringify(storage.products));
  }
};