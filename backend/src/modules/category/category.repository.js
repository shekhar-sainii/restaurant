const BaseRepository = require("../../common/repository/base.repository");
const { Category } = require("../../models");

class CategoryRepository extends BaseRepository {
  constructor() {
    super("Category", Category);
  }
}

module.exports = new CategoryRepository();
