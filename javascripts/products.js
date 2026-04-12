export default class Products {
  constructor(json) {
    this.products = {};

    json.forEach((product, index) => {
      // Generate a product ID
      const id = index + 1;
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