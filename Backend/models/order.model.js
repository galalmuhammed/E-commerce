const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        priceSnapshot: {
          type: Number,
          required: true
        }
      }
    ],
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    totalPrice: { type: Number, required: true, default: 0 },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    message: { type: String, default: "" }
  },
  { timestamps: true }
);

// Auto-calc total price before saving
orderSchema.pre("save", function (next) {
  this.totalPrice = this.products.reduce((acc, item) => acc + item.priceSnapshot * item.quantity, 0);
  next();
});

module.exports = mongoose.model("Order", orderSchema);
