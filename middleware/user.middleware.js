import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  try {
    const refreshJwtToken =
      req.cookies.token ||
      req.headers["authorization"]?.split(" ")[1] || 
      req.headers["token"]?.split(" ")[0]; 
    if (!refreshJwtToken) {
      return res  
        .status(401)
        .json({ message: "Please log in to access this page. No token provided." });
    }

    const user = jwt.verify(refreshJwtToken, process.env.JWT_SECRET);

    if (!user || !user.id) {
      return res.status(403).json({ message: "Invalid token payload. Missing user ID." });
    }

    req.user = user;

    const newAccessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );
    req.newAccessToken = newAccessToken;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Your session has expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid refresh token." });
    }
    return res.status(500).json({ message: "An internal server error occurred during authentication." });
  }
};