const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

// Middleware to check JWT and admin role
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Forbidden: Admins only" });

    req.user = decoded;
    next();
  });
}

// List all users (admin only)
router.get("/users", authenticateAdmin, async (req, res, next) => {
  try {
    const users = await db("users").select("id", "code", "role");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Delete user (admin only)
router.delete("/users/:id", authenticateAdmin, async (req, res, next) => {
  try {
    await db("users").where({ id: req.params.id }).del();
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

// Edit user (admin only)
router.put("/users/:id", authenticateAdmin, async (req, res, next) => {
  try {
    const { code, role } = req.body;
    await db("users").where({ id: req.params.id }).update({ code, role });
    res.json({ message: "User updated" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
