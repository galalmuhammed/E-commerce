const jwt = require("jsonwebtoken");

exports.authMiddleware = async (req, res, next) => {
  const getToken = req.headers.authorization;
  const token = getToken && getToken.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Login required"
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userInfo = decodedToken; // { userId, username, role }
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Access denied, token is invalid or expired"
    });
  }
};
