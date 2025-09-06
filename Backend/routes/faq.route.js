const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkIfAdmin } = require("../middlewares/admin.middleware");

const { addQuestion, getApprovedFAQs, getAllFAQs, updateQuestion, deleteQuestion, answerFAQ } = require("../controllers/faq.controller");

// Admin only (must come before other routes to avoid conflicts)
router.get("/admin", authMiddleware, checkIfAdmin, getAllFAQs);
router.put("/admin/:id", authMiddleware, checkIfAdmin, updateQuestion);
router.delete("/admin/:id", authMiddleware, checkIfAdmin, deleteQuestion);
router.put("/admin/:id/answer", authMiddleware, checkIfAdmin, answerFAQ);

// Public
router.get("/", getApprovedFAQs);

// User submits question
router.post("/", authMiddleware, addQuestion);

module.exports = router;
