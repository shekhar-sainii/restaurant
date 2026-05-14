const express = require("express");
const tableRepository = require("../../table/table.repository");
const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const httpStatus = require("../../../utils/httpStatus");

const assertOwnership = (doc, tenantId) => {
  if (tenantId && doc && doc.tenantId !== tenantId) {
    const ApiError = require("../../../utils/ApiError");
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied to this resource");
  }
};

class TableAdminController {
  getTables = asyncHandler(async (req, res) => {
    await tableRepository.syncOccupancy(req.db);
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};
    const tables = await tableRepository.find(req.db, filter, { sort: { tableNumber: 1 } });
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, tables));
  });

  getTable = asyncHandler(async (req, res) => {
    const table = await tableRepository.findById(req.db, req.params.id);
    assertOwnership(table, req.tenantId);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, table));
  });

  releaseTable = asyncHandler(async (req, res) => {
    const existing = await tableRepository.findById(req.db, req.params.id);
    assertOwnership(existing, req.tenantId);
    const table = await tableRepository.updateById(req.db, req.params.id, { status: "AVAILABLE", activeOrderId: null });
    const socketManager = require("../../../sockets/socketManager");
    socketManager.emit("table:updated", table);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, table, "Table released"));
  });

  createTable = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (req.tenantId) data.tenantId = req.tenantId;
    const table = await tableRepository.create(req.db, data);
    return res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, table, "Table created"));
  });

  updateTable = asyncHandler(async (req, res) => {
    const existing = await tableRepository.findById(req.db, req.params.id);
    assertOwnership(existing, req.tenantId);
    const table = await tableRepository.updateById(req.db, req.params.id, req.body);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, table, "Table updated"));
  });

  deleteTable = asyncHandler(async (req, res) => {
    const existing = await tableRepository.findById(req.db, req.params.id);
    assertOwnership(existing, req.tenantId);
    await tableRepository.deleteById(req.db, req.params.id);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Table deleted"));
  });
}

const controller = new TableAdminController();
const router = express.Router();

router.get("/",           controller.getTables);
router.get("/:id",        controller.getTable);
router.patch("/:id/release", controller.releaseTable);
router.post("/",          controller.createTable);
router.put("/:id",        controller.updateTable);
router.delete("/:id",     controller.deleteTable);

module.exports = { controller, router };
