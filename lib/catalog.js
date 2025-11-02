// Temporary stub for build — replace with actual implementation.
// This file provides minimal exports used by pages that import lib/catalog.
// Replace getProducts and getProductById with your real data-access logic.
module.exports = {
  /**
   * Return an array of products.
   * Example: [{ id: 'p1', title: 'Product 1', price: 100 }]
   */
  getProducts: async () => {
    return [];
  },

  /**
   * Return a single product by id or null if not found.
   */
  getProductById: async (id) => {
    return null;
  }
};
