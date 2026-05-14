const express = require("express");
const tableController = require("./table.controller");

const router = express.Router();

router.get("/", tableController.getTables);
router.get("/:tableNumber", tableController.getTable);

module.exports = router;
