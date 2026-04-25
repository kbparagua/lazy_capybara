// By default product is unlimited
const DEFAULT_AVAILABILITY = -1;

class ProductRepository {
  init(json, opts = {}) {
    this.products = {};
    this.excludeOutOfStock = opts.excludeOutOfStock || false;
    const availability = opts.availability || {};

    console.log(json);
    console.log(availability);

    const clone = structuredClone(json);
    clone.forEach((product, index) => {
      // Generate a product ID
      const id = index + 1;

      if (availability[id] == null)  {
        product.available = DEFAULT_AVAILABILITY;
      } else {
        // Override product availability if provided in options
        product.available = availability[id];
      }

      // Skip out of stock products if excludeOutOfStock is true
      if (this.excludeOutOfStock && product.available === 0) return;

      this.products[id] = { id, ...product };
    });
  }

  find(id) {
    return this.products[id] || null;
  }

  each(callback) {
    Object.values(this.products).forEach(callback);
  }

  eachByCategory(callback) {
    Object.entries(this.#groupedByCategory()).forEach(([category, products]) => {
      callback(category, products);
    });
  }

  #groupedByCategory() {
    if (this._groupedByCategory) return this._groupedByCategory;

    const grouped = {};
    this.each(product => {
      if (!grouped[product.category]) grouped[product.category] = [];
      grouped[product.category].push(product);
    });

    return this._groupedByCategory = grouped;
  }
}

export default new ProductRepository();