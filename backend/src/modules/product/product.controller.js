const productService = require("./product.service");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const httpStatus = require("../../utils/httpStatus");

class ProductController {
  getProducts = asyncHandler(async (req, res) => {
    // Always filter by tenantId — from middleware (public routes) or authenticated user
    const tenantId = req.tenantId || req.user?.tenantId || null;
    const products = await productService.getAllProducts(req.db, req.query, tenantId);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, products));
  });

  getProduct = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.db, req.params.id);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, product));
  });
}

module.exports = new ProductController();
