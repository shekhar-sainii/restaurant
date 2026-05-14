const BaseRepository = require("../../common/repository/base.repository");
const { Order } = require("../../models");

class OrderRepository extends BaseRepository {
  constructor() {
    super("Order", Order);
  }
}

module.exports = new OrderRepository();
