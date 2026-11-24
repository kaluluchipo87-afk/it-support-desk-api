// IT Support Desk API: entry point.
// Order matters in Express: middleware -> routes -> 404 handler -> error handler.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const { renderGuide } = require("./guide");

const app = express();

// Render (and most hosts) sit behind a proxy. This makes req.protocol report
// "https" correctly, so the API guide shows the real public URL.
app.set("trust proxy", 1);

// CORS: only these browser origins may read responses (API clients like Postman are not affected).
const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
app.use(cors({ origin: origins }));

// Reads JSON request bodies into req.body.
app.use(express.json());

// ---------- Routes ----------

// GET / -> HTML guide for the marker
app.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.status(200).type("html").send(renderGuide(baseUrl));
});

// GET /health -> checks that the server AND the database respond
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({ status: "error", database: "unreachable", message: "The database is not responding." });
  }
});

// The five record routes
app.use("/api/records", require("./routes/records"));

// ---------- Error handling (must come after the routes) ----------

// Any request that did not match a route above.
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} was not found.` });
});

// Error middleware: Express recognises it because it has FOUR parameters.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  // Malformed JSON sent by the client, e.g. {"title": "abc",}
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "The request body is not valid JSON." });
  }

  // Errors we created on purpose (400 / 404) or other client errors (e.g. 413 too large).
  if (error.status >= 400 && error.status < 500) {
    const body = { message: error.message };
    if (error.errors) body.errors = error.errors;
    return res.status(error.status).json(body);
  }

  // Anything else is unexpected: log details for us, send a safe message to the client.
  console.error("Unexpected error:", error);
  res.status(500).json({ message: "Something went wrong on the server. Please try again." });
});

// ---------- Start ----------
const port = process.env.PORT || 3000;

db.initDatabase()
  .then(({ created }) => {
    console.log(created ? "Database created and seeded with starting records." : "Database ready.");
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Could not start: the database failed to open.", error);
    process.exit(1);
  });
