const categoryService = require("./category.service");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const httpStatus = require("../../utils/httpStatus");

class CategoryController {
  getCategories = asyncHandler(async (req, res) => {
    const tenantId = req.tenantId || req.user?.tenantId || null;
    const categories = await categoryService.getAllCategories(req.db, tenantId);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, categories));
  });

  getCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryBySlug(req.db, req.params.slug);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, category));
  });
}

module.exports = new CategoryController();
