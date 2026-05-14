const express = require("express");
const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const httpStatus = require("../../../utils/httpStatus");
const productRepository = require("../../product/product.repository");
const { upload } = require("../../../middlewares");

const router = express.Router();

// Helper: verify product belongs to tenant
const assertOwnership = (product, tenantId) => {
  if (tenantId && product && product.tenantId !== tenantId) {
    const ApiError = require("../../../utils/ApiError");
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied to this resource");
  }
};

class ProductAdminController {
  listProducts = asyncHandler(async (req, res) => {
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};
    const products = await productRepository.find(req.db, filter, { populate: "categoryId" });
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, products, "Products fetched successfully"));
  });

  getProduct = asyncHandler(async (req, res) => {
    const product = await productRepository.findById(req.db, req.params.id);
    assertOwnership(product, req.tenantId);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, product));
  });

  createProduct = asyncHandler(async (req, res) => {
    const productData = { ...req.body };
    if (req.tenantId) productData.tenantId = req.tenantId;
    if (req.file) productData.image = `/uploads/${req.file.filename}`;
    const product = await productRepository.create(req.db, productData);
    return res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, product, "Product created successfully"));
  });

  updateProduct = asyncHandler(async (req, res) => {
    const existing = await productRepository.findById(req.db, req.params.id);
    assertOwnership(existing, req.tenantId);
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    const product = await productRepository.updateById(req.db, req.params.id, updateData);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, product, "Product updated successfully"));
  });

  deleteProduct = asyncHandler(async (req, res) => {
    const existing = await productRepository.findById(req.db, req.params.id);
    assertOwnership(existing, req.tenantId);
    await productRepository.deleteById(req.db, req.params.id);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Product deleted successfully"));
  });
}

const controller = new ProductAdminController();
router.get("/",    controller.listProducts);
router.get("/:id", controller.getProduct);
router.post("/",   upload.single("image"), controller.createProduct);
router.put("/:id", upload.single("image"), controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

module.exports = { controller, router };
