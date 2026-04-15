import EventBus from './event_bus.js';
import ProductRepository from './product_repository.js';

const storage = {};

export default {
  init() {
    storage.products = JSON.parse(localStorage.getItem('basket')) || {};
    EventBus.dispatchEvent(new CustomEvent('basket:updated')); 
  },

  get(id) {
    return (storage.products || {})[id] || 0;
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

  clear() {
    storage.products = {};
    EventBus.dispatchEvent(new CustomEvent('basket:updated')); 

    this.persist();
  },

  count() {
    return Object.values(storage.products).reduce((sum, qty) => sum + qty, 0);
  },

  total() {
    return Object.entries(storage.products).reduce((total, [id, qty]) => {
      const product = ProductRepository.find(id);
      return total + (product ? product.price * qty : 0);
    }, 0);
  },

  each(callback) {
    Object.entries(storage.products).forEach(([id, quantity]) => {
      const product = ProductRepository.find(id);
      if (product) {
        callback(product, quantity);
      }
    });
  },

  persist() {
    localStorage.setItem('basket', JSON.stringify(storage.products));
  }
};