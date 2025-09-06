require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db.js");
const cors = require("cors");
const path = require("path");

connectDB();
const server = express();

server.use(cors());
server.use(express.json());
// Serve uploaded images statically
server.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
server.use("/api/user", require("./routes/users.route.js")); // Note: you need to create the put method to update the user
server.use("/api/login", require("./routes/auth.route.js"));
server.use("/api/categories", require("./routes/category.route.js"));
server.use("/api/products", require("./routes/products.route.js"));
server.use("/api/cart", require("./routes/cart.route.js"));
server.use("/api/order", require("./routes/order.route.js"));
server.use("/api/testimonials", require("./routes/testimonial.route.js"));
server.use("/api/faqs", require("./routes/faq.route.js"));
server.use("/api/contact", require("./routes/contact.route.js"));

// Running Server
server.listen(process.env.PORT, "localhost", () => {
  console.log("Server is running on port " + process.env.PORT);
});
