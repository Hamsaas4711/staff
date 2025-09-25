const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

// Middleware to check auth token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, code, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
}

// Login
router.post("/login", async (req, res, next) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const { code, password } = req.body;
  try {
    const user = await db("users").where({ code }).first();
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, code: user.code, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Store token in DB
    await db("users").where({ id: user.id }).update({ token });

    res.json({
      token,
      user: { id: user.id, code: user.code, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// Reset password
router.post("/reset-password", authMiddleware, async (req, res, next) => {
  // Staff must provide current password
  // Admin can reset any user without current password
  const schema = Joi.object({
    code: Joi.string().required(),
    currentPassword: Joi.string().allow("", null),
    newPassword: Joi.string()
      .pattern(new RegExp("^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$"))
      .required()
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters, include uppercase, number, and special character",
      }),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const { code, currentPassword, newPassword } = req.body;

  try {
    const user = await db("users").where({ code }).first();
    if (!user) return res.status(404).json({ message: "User not found" });

    // If requester is admin → reset directly
    if (req.user.role === "admin") {
      const hash = await bcrypt.hash(newPassword, 10);
      await db("users").where({ code }).update({ password: hash });
      return res.json({ message: "Password reset by admin" });
    }

    // If self → check current password
    if (req.user.code !== code) {
      return res
        .status(403)
        .json({ message: "You can only reset your own password" });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password required" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await db("users").where({ code }).update({ password: hash });
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
