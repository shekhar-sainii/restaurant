const express = require("express");
const authController = require("./auth.controller");
const authValidator = require("./auth.validator");
const { validate } = require("../../middlewares");

const router = express.Router();

router.post("/register", authController.register);
router.post("/register-restaurant", authController.registerRestaurant);
router.post("/login", authValidator.login, validate, authController.login);
router.post("/logout", authController.logout);
router.post("/google-login", authController.googleLogin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
