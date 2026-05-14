const userService = require("./user.service");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const httpStatus = require("../../utils/httpStatus");

class UserController {
  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(req.user._id);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, user));
  });

  updateProfile = asyncHandler(async (req, res) => {
    const updateData = { ...req.body };
    
    // Accept image if uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const user = await userService.updateProfile(req.user._id, updateData);
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, user, "Profile updated"));
  });

  updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "New password must be at least 6 characters long"));
    }
    const { User } = require("../../models");
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "User account not found"));
    }
    if (currentPassword) {
      const isCorrect = await user.isPasswordCorrect(currentPassword);
      if (!isCorrect) {
        return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "Current password is incorrect"));
      }
    }
    user.password = newPassword;
    await user.save();
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Password updated successfully"));
  });
}

module.exports = new UserController();
