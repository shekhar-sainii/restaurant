const productRepository = require("./product.repository");

class ProductService {
  /**
   * Helper to calculate active price based on day-wise rules
   */
  _calculateActivePrice(product) {
    const today = new Date().getDay(); // 0 is Sunday
    const rule = product.dayWisePricing?.find((r) => r.day === today);

    let activePrice = product.price;
    let activeDiscountedPrice = product.discountedPrice;

    if (rule) {
      if (rule.specialPrice) {
        activeDiscountedPrice = rule.specialPrice;
      } else if (rule.discountPercentage) {
        const rulePrice = activePrice * (1 - rule.discountPercentage / 100);
        // Take the lower of current discount or rule discount
        activeDiscountedPrice = activeDiscountedPrice ? Math.min(activeDiscountedPrice, rulePrice) : rulePrice;
      }
    }

    // Process variations if they exist
    const variations = product.variations?.map((v) => {
      let vPrice = v.price;
      let vDiscountedPrice = v.discountedPrice;
      if (rule && rule.discountPercentage) {
        vDiscountedPrice = vPrice * (1 - rule.discountPercentage / 100);
      }
      return { ...v.toObject(), price: vPrice, discountedPrice: vDiscountedPrice };
    });

    return {
      ...product.toObject(),
      price: activePrice,
      discountedPrice: activeDiscountedPrice,
      variations,
    };
  }

  async getAllProducts(db, filter = {}, tenantId = null) {
    const query = { ...filter, isAvailable: true };
    if (tenantId) query.tenantId = tenantId;
    const products = await productRepository.find(
      db,
      query,
      { sort: { sortOrder: 1 }, populate: "categoryId" }
    );
    return products.map((p) => this._calculateActivePrice(p));
  }

  async getProductById(db, id) {
    const product = await productRepository.findById(db, id, { populate: "categoryId" });
    if (!product) return null;
    return this._calculateActivePrice(product);
  }
}

module.exports = new ProductService();
