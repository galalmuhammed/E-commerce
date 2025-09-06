exports.checkIfAdmin = async (req, res, next) => {
  if (req.userInfo.role !== "admin" && req.userInfo.role !== "owner") {
    return res.status(403).json({
      success: false,
      message: "Unauthorized user..."
    });
  }

  next();
};
