const User = require("../models/users.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty"
      });
    }

    const { username, password } = req.body;

    if (username !== username.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "You can't include uppercase letters in your username."
      });
    }

    if (!username || !password) {
      return res.status(403).json({
        success: false,
        message: "Both username and password are required"
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credintials."
      });
    }

    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: `${user.username} has been deleted.`
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credintials."
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login success",
      accessToken
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
