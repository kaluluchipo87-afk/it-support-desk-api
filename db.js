// Database connection for the IT Support Desk API.
//
// Uses SQLite through @libsql/client, which can open:
//   - a local SQLite file:      DATABASE_URL=file:records.db
//   - a hosted SQLite database: DATABASE_URL=libsql://your-db.turso.io  (+ DATABASE_AUTH_TOKEN)
// The rest of the app does not care which one is used.
const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

const client = createClient({
  url: process.env.DATABASE_URL || "file:records.db",
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});

// Run one SQL statement with ? placeholders and an array of values.
// The values are sent separately from the SQL text, so user input can never
// change the SQL itself (this prevents SQL injection).
// Returns { rows, rowCount } (the same shape the pg library uses).
async function query(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  const rows = result.rows.map((row) =>
    Object.fromEntries(result.columns.map((column, index) => [column, row[index]]))
  );
  return { rows, rowCount: rows.length, rowsAffected: result.rowsAffected };
}

// Create the table and add the starting records ONLY the first time.
// If every record is later deleted, the table still exists, so it is not re-seeded.
async function initDatabase() {
  const existing = await query(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'records'"
  );
  if (existing.rowCount > 0) {
    return { created: false };
  }

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
  await client.executeMultiple(schema);
  await client.executeMultiple(seed);
  return { created: true };
}

module.exports = { query, initDatabase };
