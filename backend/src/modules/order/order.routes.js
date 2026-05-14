const express = require("express");
const orderController = require("./order.controller");
const { verifyAccessToken } = require("../../middlewares");
const guestOrUser = require("../../middlewares/guestOrUser.middleware");

const router = express.Router();

router.post("/", guestOrUser, orderController.createOrder);
router.get("/me", verifyAccessToken, orderController.getMyOrders);
router.post("/guest", orderController.getGuestOrders);
router.get("/:id", orderController.getOrder);

module.exports = router;
