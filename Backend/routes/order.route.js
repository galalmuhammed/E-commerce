const express = require("express");
const router = express.Router();
const { placeOrder, getOrders, getOrderById, updateOrder, removeOrderItem } = require("../controllers/order.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Place order
router.post("/", authMiddleware, placeOrder);

// Get all user orders
router.get("/", authMiddleware, getOrders);

// Get single order
router.get("/:id", authMiddleware, getOrderById);

// Update an order
router.put("/:id", authMiddleware, updateOrder);

// Remove item from an order
router.delete("/:orderId/items/:itemId", authMiddleware, removeOrderItem);

module.exports = router;
