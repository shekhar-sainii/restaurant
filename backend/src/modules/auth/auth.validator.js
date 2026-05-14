const { body } = require("express-validator");

const authValidator = {
  login: [
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("identifier").optional().notEmpty().withMessage("Identifier is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body().custom((value) => {
      if (!value.email && !value.identifier) {
        throw new Error("Email or Identifier is required");
      }
      return true;
    }),
  ],
  register: [
    body("name").notEmpty().withMessage("Name is required"),
    body("mobile").notEmpty().withMessage("Mobile is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
};

module.exports = authValidator;
