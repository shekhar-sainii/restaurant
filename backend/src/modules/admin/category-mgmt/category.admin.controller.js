const express = require("express");
const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const httpStatus = require("../../../utils/httpStatus");
const categoryRepository = require("../../category/category.repository");
const { upload } = require("../../../middlewares");

const router = express.Router();

const assertOwnership = (doc, tenantId) => {
  if (tenantId && doc && doc.tenantId !== tenantId) {
    const ApiError = require("../../../utils/ApiError");
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied to this resource");
  }
};

class CategoryAdminController {
  listCategories = asyncHandler(async (req, res) => {
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};
    const categories = await categoryRepository.find(req.db, filter, { sort: { sortOrder: 1 } });
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, categories, "Categories fetched successfully"));
  });

  getCategory = asyncHandler(async (req, res) => {
    const category = await categoryRepository.findById(req.db, req.params.id);
    assertOwnership(category, req.tenantId);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, category));
  });

  createCategory = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (req.tenantId) data.tenantId = req.tenantId;
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const category = await categoryRepository.create(req.db, data);
    return res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, category, "Category created successfully"));
  });

  updateCategory = asyncHandler(async (req, res) => {
    const existing = await categoryRepository.findById(req.db, req.params.id);
    assertOwnership(existing, req.tenantId);
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const category = await categoryRepository.updateById(req.db, req.params.id, data);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, category, "Category updated successfully"));
  });

  deleteCategory = asyncHandler(async (req, res) => {
    const existing = await categoryRepository.findById(req.db, req.params.id);
    assertOwnership(existing, req.tenantId);
    await categoryRepository.deleteById(req.db, req.params.id);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Category deleted successfully"));
  });
}

const controller = new CategoryAdminController();
router.get("/",    controller.listCategories);
router.get("/:id", controller.getCategory);
router.post("/",   upload.single("image"), controller.createCategory);
router.put("/:id", upload.single("image"), controller.updateCategory);
router.delete("/:id", controller.deleteCategory);

module.exports = { controller, router };
