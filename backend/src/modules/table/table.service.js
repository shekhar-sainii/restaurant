const tableRepository = require("./table.repository");

class TableService {
  async getTableByNumber(db, tableNumber, tenantId) {
    return await tableRepository.findOne(db, { tableNumber, tenantId });
  }

  async getAllTables(db, tenantId) {
    return await tableRepository.find(db, { tenantId });
  }
}

module.exports = new TableService();
