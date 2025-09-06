const User = require("../models/users.model");
const bcrypt = require("bcryptjs");

// Helper function to hash passwords
const hashed = async (hashNumber, password) => {
  return await bcrypt.hash(password, hashNumber);
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    if (req.userInfo.role !== "admin" && req.userInfo.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to this page..."
      });
    }

    const users = await User.find({ isDeleted: false });
    if (users.length > 0) {
      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users: users
      });
    } else {
      res.status(404).json({
        success: false,
        message: "there are no users registered..."
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register User
exports.registerUser = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty"
      });
    }

    const { username, password, email } = req.body;

    if (username !== username.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "You can't include uppercase letters in your username."
      });
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists. Please try a different one."
      });
    }

    const hashedPassword = await hashed(10, password);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: `${username} has been registered as a ${newUser.role[0].toUpperCase() + newUser.role.slice(1)}.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Promote user to admin
exports.adminPromotion = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "No ID provided. Please add an ID in the URL."
      });
    }

    // only admins and owner can promote a user to an admin
    if (req.userInfo.role !== "admin" && req.userInfo.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized user..."
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: `${user.username} has been deleted.`
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "This user is already an admin."
      });
    }

    if (user.role === "owner") {
      return res.status(403).json({
        success: false,
        message: "You can't promote an owner."
      });
    }

    user.role = "admin";
    await user.save();

    return res.status(200).json({
      success: true,
      message: `${user.username} is now an admin.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Demote admin to user
exports.adminDemotion = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "No ID provided. Please add an ID in the URL."
      });
    }

    // Only admins and owners are authorized to to demote
    if (req.userInfo.role !== "admin" && req.userInfo.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Un authorized user..."
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: `${user.username} has been deleted.`
      });
    }

    if (user.role === "user") {
      return res.status(400).json({
        success: false,
        message: "This user is already a regular user."
      });
    }

    if (req.userInfo.role === "admin" && user.role === "admin") {
      user.role = "user";
      await user.save();
      return res.status(200).json({
        success: true,
        message: `${user.username} has been demoted to user.`
      });
    }

    if (req.userInfo.role === "admin" && user.role === "owner") {
      return res.status(403).json({
        success: false,
        message: "You can't demote the owner."
      });
    }

    if (req.userInfo.role === "owner" && user.role === "owner") {
      return res.status(403).json({
        success: false,
        message: "You can't demote yourself."
      });
    }

    if (req.userInfo.role === "owner" && user.role === "admin") {
      user.role = "user";
      await user.save();
      return res.status(200).json({
        success: true,
        message: `${user.username} has been demoted to user.`
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.userInfo.role !== "owner" && req.userInfo.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized user..."
      });
    }

    const getId = req.params.id;
    if (!getId) {
      return res.status(400).json({
        success: false,
        message: "No ID provided. Please add an ID in the URL."
      });
    }

    let user;
    try {
      user = await User.findOne({ _id: getId });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format."
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: `${user.username} has been deleted.`
      });
    }

    if (req.userInfo.role === "admin" && user.role === "admin") {
      user.isDeleted = true;
      await user.save();
      return res.status(201).json({
        success: true,
        message: `${user.username} is deleted successfully.`
      });
    }

    if (req.userInfo.role === "admin" && user.role === "owner") {
      return res.status(400).json({
        success: false,
        message: `${user.role} cannot be deleted.`
      });
    }

    if (req.userInfo.role === "owner" && user.role === "owner") {
      return res.status(400).json({
        success: false,
        message: `${user.role} cannot be deleted.`
      });
    }

    if (req.userInfo.role === "owner" && user.role === "admin") {
      user.isDeleted = true;
      await user.save();
      return res.status(201).json({
        success: true,
        message: `${user.username} is deleted successfully.`
      });
    }

    if (req.userInfo.role === "owner" && user.role === "user") {
      user.isDeleted = true;
      await user.save();
      return res.status(201).json({
        success: true,
        message: `${user.username} is deleted successfully.`
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
