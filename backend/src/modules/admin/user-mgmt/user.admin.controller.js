const express = require("express");
const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const httpStatus = require("../../../utils/httpStatus");
const { User } = require("../../../models");
const { upload } = require("../../../middlewares");

const router = express.Router();

const assertOwnership = (user, tenantId) => {
  if (tenantId && user && user.tenantId !== tenantId) {
    const ApiError = require("../../../utils/ApiError");
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied to this resource");
  }
};

class UserAdminController {
  getUsers = asyncHandler(async (req, res) => {
    // Tenant admin sees only own tenant users; super admin sees all
    const filter = req.tenantId
      ? { tenantId: req.tenantId, role: { $in: ["USER", "KITCHEN", "DELIVERY"] } }
      : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, users, "Users retrieved successfully"));
  });

  updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    assertOwnership(user, req.tenantId);
    const { name, mobile } = req.body;
    const updateData = { name, mobile };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, updated, "User updated successfully"));
  });

  updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    assertOwnership(user, req.tenantId);
    const updated = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, updated, "User role updated successfully"));
  });

  toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    assertOwnership(user, req.tenantId);
    user.isActive = !user.isActive;
    await user.save();
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, user, `User ${user.isActive ? "unblocked" : "blocked"} successfully`));
  });

  deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    assertOwnership(user, req.tenantId);
    await User.findByIdAndDelete(req.params.id);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "User deleted successfully"));
  });
}

const controller = new UserAdminController();
router.get("/",              controller.getUsers);
router.put("/:id",           upload.single("image"), controller.updateUser);
router.patch("/:id/role",    controller.updateUserRole);
router.patch("/:id/status",  controller.toggleUserStatus);
router.delete("/:id",        controller.deleteUser);

module.exports = { controller, router };
