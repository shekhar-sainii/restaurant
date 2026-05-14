const categoryRepository = require("./category.repository");

class CategoryService {
  async getAllCategories(db, tenantId = null) {
    const filter = { isActive: true };
    if (tenantId) filter.tenantId = tenantId;
    return await categoryRepository.find(db, filter, { sort: { sortOrder: 1 } });
  }

  async getCategoryBySlug(db, slug) {
    return await categoryRepository.findOne(db, { slug, isActive: true });
  }
}

module.exports = new CategoryService();
