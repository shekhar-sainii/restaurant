const BaseRepository = require("../../common/repository/base.repository");
const { Table } = require("../../models");

class TableRepository extends BaseRepository {
  constructor() {
    super("Table", Table);
  }

  /**
   * Automatically Reset occupied tables after 1 hour (Lazy Reset)
   */
  async syncOccupancy(db) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return await this.m(db).updateMany(
      { 
        status: "OCCUPIED", 
        updatedAt: { $lt: oneHourAgo } 
      },
      { 
        $set: { 
          status: "AVAILABLE",
          activeOrderId: null
        } 
      }
    );
  }
}

module.exports = new TableRepository();
