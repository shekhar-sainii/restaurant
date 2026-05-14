const jwt = require("jsonwebtoken");
const config = require("../../config/env.config");
const authRepository = require("./auth.repository");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("../../utils/httpStatus");
const emailService = require("../../emails/email.service");

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(db, userData, tenantId = null) {
    const { email, mobile, password, name } = userData;

    // Scope uniqueness check to tenant
    const existingEmail = await authRepository.findByEmail(db, email);
    if (existingEmail && (!tenantId || existingEmail.tenantId === tenantId)) {
      throw new ApiError(httpStatus.CONFLICT, "Email already registered");
    }

    const existingMobile = await authRepository.findByMobile(db, mobile);
    if (existingMobile && (!tenantId || existingMobile.tenantId === tenantId)) {
      throw new ApiError(httpStatus.CONFLICT, "Mobile number already registered");
    }

    const user = await authRepository.create(db, {
      tenantId,
      name, email, mobile, password,
      role: "USER",
    });

    const accessToken  = this.generateToken(user._id, config.jwt.accessExpiration, config.jwt.accessSecret);
    const refreshToken = this.generateToken(user._id, config.jwt.refreshExpiration, config.jwt.refreshSecret);
    user.refreshToken = refreshToken;
    await user.save();

    emailService.sendWelcome(user).catch(err =>
      console.error("[EmailService] Welcome email failed:", err.message)
    );

    return { user, accessToken, refreshToken };
  }

  async login(db, identifier, password, tenantId = null) {
    if (!identifier || typeof identifier !== "string") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials or missing identifier");
    }

    const user = identifier.includes("@")
      ? await authRepository.findByEmail(db, identifier)
      : await authRepository.findByMobile(db, identifier);

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    const pwdMatch = await user.isPasswordCorrect(password);
    if (!pwdMatch) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    if (!user.isActive) {
      throw new ApiError(httpStatus.FORBIDDEN, "Account is disabled");
    }

    const accessToken  = this.generateToken(user._id, config.jwt.accessExpiration, config.jwt.accessSecret);
    const refreshToken = this.generateToken(user._id, config.jwt.refreshExpiration, config.jwt.refreshSecret);
    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  generateToken(userId, expires, secret) {
    const payload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
    };
    return jwt.sign(payload, secret, { expiresIn: expires });
  }

  /**
   * Google Login Strategy
   */
  async googleLogin(db, credential) {
    if (!credential) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Google credential required");
    }

    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(config.googleClientId);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Google token");
    }

    const { sub: googleId, email, name } = payload;

    // 1. Find user by googleId or email
    let user = await authRepository.findByGoogleId(db, googleId);
    
    if (!user) {
      user = await authRepository.findByEmail(db, email);
      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        user = await authRepository.create(db, {
          name: name || "Gourmet Gourmet",
          email,
          googleId,
          role: "USER"
        });
      }
    }

    if (!user.isActive) {
      throw new ApiError(httpStatus.FORBIDDEN, "Account is disabled");
    }

    const accessToken = this.generateToken(user._id, config.jwt.accessExpiration, config.jwt.accessSecret);
    const refreshToken = this.generateToken(user._id, config.jwt.refreshExpiration, config.jwt.refreshSecret);

    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }
}

module.exports = new AuthService();
