
const storage = {};

export default {
  init() {
    storage.products = JSON.parse(localStorage.getItem('basket')) || {};
  },

  get(id) {
    return storage.products[id] || 0;
  },

  addProduct(id, qty = 1) {
    storage.products[id] = (storage.products[id] || 0) + qty;
    this.persist();
  },

  removeProduct(id, qty = 1) {
    if (!storage.products[id]) return;

    storage.products[id] = Math.max(0, storage.products[id] - qty);
    
    if (storage.products[id] === 0) {
      delete storage.products[id];
    }

    this.persist();
  },

  persist() {
    localStorage.setItem('basket', JSON.stringify(storage.products));
  }
};