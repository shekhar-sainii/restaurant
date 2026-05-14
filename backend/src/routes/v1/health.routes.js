const express = require("express");
const mongoose = require("mongoose");
const ApiResponse = require("../../utils/ApiResponse");
const httpStatus = require("../../utils/httpStatus");

const router = express.Router();

router.get("/", (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  };
  try {
    res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, healthCheck));
  } catch (error) {
    healthCheck.message = error;
    res.status(503).json(new ApiResponse(503, healthCheck));
  }
});

module.exports = router;
