const tableService = require("./table.service");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const httpStatus = require("../../utils/httpStatus");

class TableController {
  getTable = asyncHandler(async (req, res) => {
    const table = await tableService.getTableByNumber(req.db, req.params.tableNumber, req.tenantId);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, table));
  });

  getTables = asyncHandler(async (req, res) => {
    const tables = await tableService.getAllTables(req.db, req.tenantId);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, tables));
  });
}

module.exports = new TableController();
