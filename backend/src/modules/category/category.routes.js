const express = require("express");
const categoryController = require("./category.controller");

const router = express.Router();

router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategory);

module.exports = router;
