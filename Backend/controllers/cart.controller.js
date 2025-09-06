const Cart = require("../models/cart.model");
const Product = require("../models/products.model");

// ==========================
// GET cart items for logged-in user
// ==========================
const getItem = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "products.product",
      select: "name price description",
      match: { isDeleted: false } // don’t show deleted products
    });

    if (!cart) {
      return res.status(200).json({ message: "Cart is empty", cart: [] });
    }

    // filter out deleted items before sending
    const activeProducts = cart.products.filter((p) => !p.isDeleted);

    return res.status(200).json({ ...cart.toObject(), products: activeProducts });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================
// ADD product to cart
// ==========================
const addToCart = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity, priceSnapshot: product.price, isDeleted: false }]
      });
    } else {
      const existingProduct = cart.products.find((p) => p.product.toString() === productId && !p.isDeleted);

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({
          product: productId,
          quantity,
          priceSnapshot: product.price,
          isDeleted: false
        });
      }
    }

    await cart.save();
    await cart.populate("products.product", "name price description");

    const activeProducts = cart.products.filter((p) => !p.isDeleted);

    return res.status(201).json({
      message: "Product added to cart successfully",
      cart: { ...cart.toObject(), products: activeProducts }
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================
// UPDATE quantity of a product
// ==========================
const editItem = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { id } = req.params; // subdocument _id of product in cart
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productInCart = cart.products.id(id);
    if (!productInCart || productInCart.isDeleted) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity <= 0) {
      productInCart.isDeleted = true;
    } else {
      productInCart.quantity = quantity;
    }

    await cart.save();
    await cart.populate("products.product", "name price description");

    const activeProducts = cart.products.filter((p) => !p.isDeleted);

    res.status(200).json({ message: "Cart updated successfully", cart: { ...cart.toObject(), products: activeProducts } });
  } catch (error) {
    console.error("Edit Cart Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================
// DELETE a product from cart (decrement by 1)
// ==========================
const deleteProduct = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const { id } = req.params; // subdocument _id of product in cart

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productInCart = cart.products.id(id);
    if (!productInCart || productInCart.isDeleted) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (productInCart.quantity > 1) {
      productInCart.quantity -= 1; // decrement quantity
    } else {
      productInCart.isDeleted = true; // soft delete if quantity is 1
    }

    await cart.save();
    await cart.populate("products.product", "name price description");

    const activeProducts = cart.products.filter((p) => !p.isDeleted);

    res.status(200).json({ message: "Product quantity updated/removed", cart: { ...cart.toObject(), products: activeProducts } });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================
// DELETE the entire cart (soft delete)
// ==========================
const deleteCart = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    // Find the cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Delete the cart completely from DB
    await Cart.deleteOne({ _id: cart._id });

    return res.status(200).json({
      success: true,
      message: "Cart deleted successfully"
    });
  } catch (error) {
    console.error("Delete Cart Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getItem, addToCart, editItem, deleteCart, deleteProduct };
