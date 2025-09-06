const express = require("express");
const { getAllUsers, registerUser, adminPromotion, adminDemotion, deleteUser } = require("../controllers/users.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// get all users
router.get("/", authMiddleware, getAllUsers);

// register a user
router.post("/", registerUser);

// promoting  user to admin
router.put("/promote/:id", authMiddleware, adminPromotion);

// demoting admin to uesr
router.put("/demote/:id", authMiddleware, adminDemotion);

router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
