const express = require("express");
const userController = require("./user.controller");
const { verifyAccessToken, upload } = require("../../middlewares");

const router = express.Router();

router.use(verifyAccessToken);

router.get("/profile", userController.getProfile);
router.put("/profile", upload.single('image'), userController.updateProfile);

module.exports = router;
