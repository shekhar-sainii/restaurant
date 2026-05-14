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

  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "Email address is required"));
    }
    const { User } = require("../../models");
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json(new ApiResponse(httpStatus.NOT_FOUND, null, "No account associated with this email address"));
    }

    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const origin = req.headers.origin || (process.env.NODE_ENV === "production" ? "https://restaurant-kohl-phi.vercel.app" : "http://localhost:3000");
    const resetLink = `${origin}/reset-password?token=${resetToken}`;

    const emailService = require("../../emails/email.service");
    await emailService.sendPasswordReset(user, resetLink);

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Password reset instructions sent to your email"));
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "Valid session token and minimum 6 character password required"));
    }
    const { User } = require("../../models");
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(httpStatus.BAD_REQUEST).json(new ApiResponse(httpStatus.BAD_REQUEST, null, "Password reset token is invalid or has expired"));
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Your password has been successfully reset. You may now log in."));
  });
}

module.exports = new AuthController();
