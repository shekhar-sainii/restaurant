const express = require("express");
const paymentController = require("./payment.controller");
const guestOrUser = require("../../middlewares/guestOrUser.middleware");

const router = express.Router();

router.post("/upi/initiate", guestOrUser, paymentController.initiateUpi);
router.post("/upi/verify",   guestOrUser, paymentController.verifyUtr);

module.exports = router;
