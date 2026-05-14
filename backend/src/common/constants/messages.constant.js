const MESSAGES = {
  SUCCESS: {
    DEFAULT: "Operation successful",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    FETCHED: "Resource fetched successfully",
  },
  ERROR: {
    DEFAULT: "Something went wrong",
    NOT_FOUND: "Resource not found",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Forbidden access",
    VALIDATION: "Validation error",
    CONFLICT: "Conflict error",
    INTERNAL: "Internal server error",
  },
  AUTH: {
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logout successful",
    REGISTER_SUCCESS: "Registration successful",
    INVALID_CREDENTIALS: "Invalid email/mobile or password",
    TOKEN_EXPIRED: "Token has expired",
    TOKEN_INVALID: "Invalid token",
  },
};

module.exports = MESSAGES;
