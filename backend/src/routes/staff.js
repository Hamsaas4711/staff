const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  authMiddleware,
  requireAdmin,
} = require("../middleware/authMiddleware");
const Joi = require("joi");

// public-ish: requires auth (any role) — returns staff records
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      const rows = await db("staff").select("*").orderBy("id", "desc");
      return res.json(rows);
    }
    const rows = await db("staff")
      .where({ college_code: req.user.code })
      .orderBy("id", "desc");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// create new staff record — any logged-in college user can create only for their code; admin can create for any code
router.post("/", authMiddleware, async (req, res, next) => {
  const schema = Joi.object({
    college_code: Joi.string().required(),
    college_name: Joi.string().allow("", null),
    district: Joi.string().allow("", null),
    taluk: Joi.string().allow("", null),
    designation: Joi.string().allow("", null),
    group: Joi.string().allow("", null),
    branch: Joi.string().allow("", null),
    sanctioned: Joi.number().integer().min(0).default(0),
    working: Joi.number().integer().min(0).default(0),
    vacant: Joi.number().integer().min(0).default(0),
    no_of_deputed: Joi.number().integer().min(0).default(0),
    deputed_college_code: Joi.string().allow("", null),
    remarks: Joi.string().allow("", null),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  try {
    // enforce: college user can only create records for their college
    if (req.user.role !== "admin" && req.user.code !== value.college_code) {
      return res
        .status(403)
        .json({ message: "Cannot create record for other college" });
    }

    const [id] = await db("staff").insert(value).returning("id");
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

// update staff record — admin or owner
router.put("/:id", authMiddleware, async (req, res, next) => {
  const schema = Joi.object({
    college_code: Joi.string().required(),
    college_name: Joi.string().allow("", null),
    district: Joi.string().allow("", null),
    taluk: Joi.string().allow("", null),
    designation: Joi.string().allow("", null),
    group: Joi.string().allow("", null),
    branch: Joi.string().allow("", null),
    sanctioned: Joi.number().integer().min(0).default(0),
    working: Joi.number().integer().min(0).default(0),
    vacant: Joi.number().integer().min(0).default(0),
    no_of_deputed: Joi.number().integer().min(0).default(0),
    deputed_college_code: Joi.string().allow("", null),
    remarks: Joi.string().allow("", null),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  try {
    const record = await db("staff").where({ id: req.params.id }).first();
    if (!record) return res.status(404).json({ message: "Record not found" });

    // owner check
    if (req.user.role !== "admin" && req.user.code !== record.college_code) {
      return res
        .status(403)
        .json({ message: "Cannot update record for other college" });
    }

    await db("staff")
      .where({ id: req.params.id })
      .update({ ...value, updated_at: db.fn.now() });
    res.json({ message: "Updated" });
  } catch (err) {
    next(err);
  }
});

// delete staff record — owner or admin
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const record = await db("staff").where({ id: req.params.id }).first();
    if (!record) return res.status(404).json({ message: "Record not found" });

    if (req.user.role !== "admin" && req.user.code !== record.college_code) {
      return res
        .status(403)
        .json({ message: "Cannot delete record for other college" });
    }

    await db("staff").where({ id: req.params.id }).del();
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
