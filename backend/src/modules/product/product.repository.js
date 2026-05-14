const BaseRepository = require("../../common/repository/base.repository");
const { Product } = require("../../models");

class ProductRepository extends BaseRepository {
  constructor() {
    super("Product", Product);
  }
}

module.exports = new ProductRepository();
