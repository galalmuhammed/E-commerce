const express = require("express");
const { getAllProduct, getProductById, addProduct, updateProduct, deleteProduct } = require("../controllers/products.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware"); // your multer middleware
const { checkIfAdmin } = require("../middlewares/admin.middleware");
const { normalizeImageUrls } = require("../middlewares/image-url.middleware");

const router = express.Router();

// get all products
router.get("/", normalizeImageUrls, getAllProduct);

// get product by id
router.get("/:id", normalizeImageUrls, getProductById);

// add product
router.post("/", authMiddleware, checkIfAdmin, upload.single("image"), normalizeImageUrls, addProduct);

// edit product
router.put("/:id", authMiddleware, checkIfAdmin, upload.single("image"), normalizeImageUrls, updateProduct);

// delte product
router.delete("/:id", authMiddleware, checkIfAdmin, deleteProduct);

module.exports = router;
