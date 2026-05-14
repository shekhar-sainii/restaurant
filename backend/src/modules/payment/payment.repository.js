const BaseRepository = require("../../common/repository/base.repository");
const { Payment } = require("../../models");

class PaymentRepository extends BaseRepository {
  constructor() {
    super("Payment", Payment);
  }
}

module.exports = new PaymentRepository();
