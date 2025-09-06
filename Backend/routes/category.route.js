const express = require("express");
const { getAllCategories, addCategory, updateCategory, deleteCategory } = require("../controllers/category.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkIfAdmin } = require("../middlewares/admin.middleware");

const router = express.Router();

// get all categories
router.get("/", getAllCategories);

// add category
router.post("/", authMiddleware, checkIfAdmin, addCategory);

// edit category
router.put("/:id", authMiddleware, checkIfAdmin, updateCategory);

// delte category
router.delete("/:id", authMiddleware, checkIfAdmin, deleteCategory);

module.exports = router;
