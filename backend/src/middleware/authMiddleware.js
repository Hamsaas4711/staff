const jwt = require("jsonwebtoken");
const db = require("../db");

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header)
    return res.status(401).json({ message: "Missing authorization header" });

  const token = header.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Invalid authorization header" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally fetch fresh user from DB
    const user = await db("users").where({ id: payload.id }).first();
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = { id: user.id, code: user.code, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Requires admin role" });
  next();
};

module.exports = { authMiddleware, requireAdmin };
