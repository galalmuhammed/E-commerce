const Order = require("../models/order.model");
const Cart = require("../models/cart.model");

// Place Order
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId, isDeleted: false }).populate("products.product");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Create snapshot of cart products
    const orderProducts = cart.products.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot
    }));

    // Calculate total price
    const totalPrice = orderProducts.reduce((acc, item) => acc + item.priceSnapshot * item.quantity, 0);

    // Create order
    const order = new Order({
      user: userId,
      products: orderProducts,
      totalPrice,
      address: req.body?.address || "",
      phone: req.body?.phone || "",
      message: req.body?.notes || req.body?.message || ""
    });

    await order.save();

    // Clear cart after placing order
    cart.products = [];
    await cart.save();

    return res.status(201).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get all user orders
exports.getOrders = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    const orders = await Order.find({ user: userId }).populate("products.product");

    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId }).populate("products.product");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Update order (status)
exports.updateOrder = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const isAdmin = req.userInfo.isAdmin || false; // depends on your middleware
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // User can only cancel their own "pending" orders
    if (!isAdmin) {
      if (order.user.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Not authorized to update this order" });
      }
      if (status !== "cancelled") {
        return res.status(403).json({ success: false, message: "Users can only cancel their own orders" });
      }
      if (order.status !== "pending") {
        return res.status(400).json({ success: false, message: "Only pending orders can be cancelled" });
      }
    }

    order.status = status;
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Remove an item from an order
exports.removeOrderItem = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { orderId, itemId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Prevent editing finalized orders
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, message: "Cannot modify a completed/cancelled order" });
    }

    // Find the item index in products array
    const itemIndex = order.products.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in order" });
    }

    // Remove the item
    order.products.splice(itemIndex, 1);

    // If no items left, cancel the order
    if (order.products.length === 0) {
      order.status = "cancelled";
      order.totalPrice = 0;
    } else {
      // Recalculate totalPrice
      order.totalPrice = order.products.reduce((acc, item) => acc + item.priceSnapshot * item.quantity, 0);
    }

    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
