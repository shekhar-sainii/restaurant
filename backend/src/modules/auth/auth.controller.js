const authService = require("./auth.service");
const tenantService = require("../super-admin/tenant.service");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const httpStatus = require("../../utils/httpStatus");

class AuthController {
  register = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.db, req.body, req.tenantId || null);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, { user, accessToken }, "Registration successful"));
  });

  registerRestaurant = asyncHandler(async (req, res) => {
    const result = await tenantService.createTenant({ ...req.body, immediateActive: false });
    return res.status(httpStatus.CREATED).json(
      new ApiResponse(httpStatus.CREATED, result, "Restaurant registration submitted. Awaiting approval.")
    );
  });

  login = asyncHandler(async (req, res) => {
    const { identifier, email, password } = req.body;
    const loginId = identifier || email;

    const { user, accessToken, refreshToken } = await authService.login(req.db, loginId, password, req.tenantId || null);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { user, accessToken }, "Login successful"));
  });

  logout = asyncHandler(async (req, res) => {
    res.clearCookie("refreshToken");
    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Logout successful"));
  });

  googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body;
    const { user, accessToken, refreshToken } = await authService.googleLogin(req.db, credential);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, { user, accessToken }, "Google login successful"));
  });
}

module.exports = new AuthController();
