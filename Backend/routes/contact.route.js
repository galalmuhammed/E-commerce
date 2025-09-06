const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { checkIfAdmin } = require("../middlewares/admin.middleware");

const { 
  addContact, 
  getAllContacts, 
  updateContact, 
  deleteContact, 
  answerContact,
  markAsRead
} = require("../controllers/contact.controller");

// User submits contact form
router.post("/", authMiddleware, addContact);

// Admin only (must come before other routes to avoid conflicts)
router.get("/admin", authMiddleware, checkIfAdmin, getAllContacts);
router.put("/admin/:id/read", authMiddleware, checkIfAdmin, markAsRead);
router.delete("/admin/:id", authMiddleware, checkIfAdmin, deleteContact);
router.put("/admin/:id", authMiddleware, checkIfAdmin, updateContact);
router.put("/admin/:id/answer", authMiddleware, checkIfAdmin, answerContact);

module.exports = router;
