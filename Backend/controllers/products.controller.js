const Product = require("../models/products.model");
const Category = require("../models/category.model");

// helper to normalize any stored path to web path under uploads
const toWebUploadsPath = (rawPath) => {
  if (!rawPath) return rawPath;
  const normalized = rawPath.replace(/\\\\/g, "/");
  // Already correct: "uploads/..."
  if (normalized.startsWith("uploads/")) return normalized;
  // Leading slash variant: "/uploads/..."
  if (normalized.startsWith("/uploads/")) return normalized.slice(1);
  // Contains uploads somewhere in the path
  const idx = normalized.toLowerCase().indexOf("/uploads/");
  if (idx !== -1) return normalized.slice(idx + 1);
  // Fallback: prefix just the filename
  const filename = normalized.split("/").pop();
  return `uploads/${filename}`;
};

// Get all products
exports.getAllProduct = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false })
      .populate("category")
      .lean();
    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products available",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const productDoc = await Product.findById(id).populate("category");

    if (!productDoc || productDoc.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found or deleted"
      });
    }

    const product = productDoc.toObject();

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;


    // Validate body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Add something to your body" });
    }

    if (!imagePath || !title?.trim() || !description?.trim() || !price || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Your body should include image, title, description, price, and category"
      });
    }

    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid category ID format: "${category}"` 
      });
    }

    // Check category exists by ID (consistent with updateProduct)
    const findCategory = await Category.findOne({ _id: category, isDeleted: false });
    
    if (!findCategory) {
      // Let's also check if the category exists at all (even if deleted)
      const anyCategory = await Category.findOne({ _id: category });
      if (anyCategory) {
        return res.status(404).json({ 
          success: false, 
          message: `Category with ID "${category}" exists but is deleted` 
        });
      } else {
        return res.status(404).json({ 
          success: false, 
          message: `Category with ID "${category}" not found` 
        });
      }
    }

    // Check duplicate title
    const existingProduct = await Product.findOne({ title: title.trim() });
    if (existingProduct) {
      return res.status(403).json({ success: false, message: `Product with title "${title}" already exists` });
    }

    const storedImagePath = toWebUploadsPath(imagePath);
    const product = await Product.create({
      image: storedImagePath,
      title: title.trim(),
      description: description.trim(),
      price,
      category: category, // Use the category ID directly
      ifDiscount: false,
      isDeleted: false
    });

    res.status(201).json({ success: true, message: "Product created successfully", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update existing product
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "No id provided" });

    const product = await Product.findById(id);
    if (!product || product.isDeleted) return res.status(404).json({ success: false, message: "Product not found or deleted" });

    const { title, description, price, category } = req.body;
    const image = req.file ? toWebUploadsPath(`uploads/${req.file.filename}`) : undefined;

    const updateFields = {};
    if (image) updateFields.image = image;
    if (title) {
      const trimmedTitle = title.trim();
      const duplicate = await Product.findOne({ title: trimmedTitle, _id: { $ne: id } });
      if (duplicate) return res.status(403).json({ success: false, message: `Product with title "${trimmedTitle}" already exists` });
      updateFields.title = trimmedTitle;
    }
    if (description) updateFields.description = description.trim();
    if (price) updateFields.price = price;
    if (category) {
      const findCategory = await Category.findOne({ _id: category, isDeleted: false });
      if (!findCategory) return res.status(404).json({ success: false, message: "Category not found" });
      updateFields.category = category;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true });

    res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Soft delete product
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "No id provided" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.isDeleted) return res.status(400).json({ success: false, message: "Product already deleted" });

    const deletedProduct = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    res.status(200).json({ success: true, message: "Product deleted successfully", data: deletedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
