const express = require("express");
const { getItem, addToCart, editItem, deleteCart, deleteProduct } = require("../controllers/cart.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, getItem);
router.post("/", authMiddleware, addToCart);
router.put("/:id", authMiddleware, editItem);
router.delete("/:id", authMiddleware, deleteCart);
router.delete("/product/:id", authMiddleware, deleteProduct);

module.exports = router;
