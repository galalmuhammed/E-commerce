const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkIfAdmin } = require("../middlewares/admin.middleware");

const { addTestimonial, getApprovedTestimonials, getAllTestimonials, updateTestimonial, deleteTestimonial } = require("../controllers/testimonial.controller");

// Admin only (must come before other routes to avoid conflicts)
router.get("/admin", authMiddleware, checkIfAdmin, getAllTestimonials);
router.put("/admin/:id", authMiddleware, checkIfAdmin, updateTestimonial);
router.delete("/admin/:id", authMiddleware, checkIfAdmin, deleteTestimonial);

// Public
router.get("/", getApprovedTestimonials);

// User adds testimonial
router.post("/", authMiddleware, addTestimonial);

module.exports = router;
