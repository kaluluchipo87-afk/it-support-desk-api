// The five record routes, mounted at /api/records in server.js.
// The backend validates EVERY request itself. It never trusts the frontend,
// because any client (Postman, curl, another app) can send data directly.
const router = require("express").Router();
const db = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];

// Same rules as the Activity 6 frontend (checked after trimming spaces).
const RULES = [
  { field: "title", label: "Title", min: 3, max: 80 },
  { field: "category", label: "Category", min: 2, max: 40 },
  { field: "description", label: "Description", min: 5, max: 300 },
];

const COLUMNS = "id, title, category, description, status";

// ---------- Validation helpers ----------

// Creates an Error that the error handler will send with this HTTP status.
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// "7" -> 7. Rejects "abc", "0", "-3", "2.5", "1e3" and numbers too big to be exact.
function parseId(value) {
  if (!/^\d+$/.test(value)) {
    throw httpError(400, "Id must be a positive whole number.");
  }
  const id = Number(value);
  if (id < 1 || !Number.isSafeInteger(id)) {
    throw httpError(400, "Id must be a positive whole number.");
  }
  return id;
}

// Checks a POST/PUT body and returns the four clean (trimmed) values.
// Any "id" in the body is ignored: the database creates ids.
function validateRecord(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "Send a JSON object with title, category, description and status.");
  }

  const clean = {};
  const errors = [];

  for (const rule of RULES) {
    const value = body[rule.field];
    if (value === undefined || value === null) {
      errors.push(`${rule.label} is required.`);
      continue;
    }
    if (typeof value !== "string") {
      errors.push(`${rule.label} must be text.`);
      continue;
    }
    const trimmed = value.trim();
    if (trimmed.length < rule.min || trimmed.length > rule.max) {
      errors.push(`${rule.label} must have ${rule.min} to ${rule.max} characters.`);
      continue;
    }
    clean[rule.field] = trimmed;
  }

  if (typeof body.status !== "string") {
    errors.push("Status is required and must be text.");
  } else if (!STATUSES.includes(body.status.trim())) {
    errors.push("Status must be Pending, In progress or Completed.");
  } else {
    clean.status = body.status.trim();
  }

  if (errors.length > 0) {
    const error = httpError(400, errors[0]); // first problem as the main message
    error.errors = errors; // every problem, so a client can show them all
    throw error;
  }
  return clean;
}

// ---------- Routes ----------

// GET /api/records -> 200 and an array (or [] when empty)
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/records/:id -> 200 and one record, or 404
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const result = await db.query(`SELECT ${COLUMNS} FROM records WHERE id = ?`, [id]);
    if (result.rowCount === 0) {
      throw httpError(404, `Record ${id} was not found.`);
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/records -> 201 and the saved record with its new id
router.post("/", async (req, res, next) => {
  try {
    const record = validateRecord(req.body);
    const result = await db.query(
      `INSERT INTO records (title, category, description, status)
       VALUES (?, ?, ?, ?)
       RETURNING ${COLUMNS}`,
      [record.title, record.category, record.description, record.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/records/:id -> 200 and the updated record, or 404.
// Replaces all four editable fields. It never creates a missing record.
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const record = validateRecord(req.body);
    const result = await db.query(
      `UPDATE records
       SET title = ?, category = ?, description = ?, status = ?
       WHERE id = ?
       RETURNING ${COLUMNS}`,
      [record.title, record.category, record.description, record.status, id]
    );
    if (result.rowCount === 0) {
      throw httpError(404, `Record ${id} was not found.`);
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/records/:id -> 200 {"message":"Record deleted."}, or 404
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const result = await db.query("DELETE FROM records WHERE id = ? RETURNING id", [id]);
    if (result.rowCount === 0) {
      throw httpError(404, `Record ${id} was not found.`);
    }
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
