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
}

module.exports = new UserController();
