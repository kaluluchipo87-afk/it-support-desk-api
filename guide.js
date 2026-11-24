// Builds the HTML API guide shown at GET /  (documentation for the marker).

// The base URL comes from the request's Host header, which a client controls,
// so it is escaped before being placed in HTML.
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const EXAMPLE_BODY = `{
  "title": "Printer jams on Ground Floor",
  "category": "Printing",
  "description": "The shared printer jams on every second page.",
  "status": "Pending"
}`;

function renderGuide(baseUrl) {
  const base = escapeHtml(baseUrl);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>IT Support Desk API</title>
  <style>
    :root { --teal: #0f766e; --teal-dark: #134e4a; --soft: #e0f2ef; --text: #17302d; --muted: #4a605c; --border: #d3e3e0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.55; color: var(--text); background: #f2f7f6; }
    header { padding: 2.5rem 1rem; color: #fff; background: linear-gradient(135deg, var(--teal-dark), var(--teal)); }
    .wrap { width: min(960px, 100%); margin-inline: auto; padding-inline: 1rem; }
    header .wrap { padding: 0; }
    h1 { margin: 0 0 .4rem; font-size: clamp(1.8rem, 4vw, 2.6rem); }
    header p { margin: .2rem 0; color: #e6f6f3; }
    main { padding-block: 2rem 3rem; }
    section { margin-bottom: 1.5rem; padding: 1.4rem; background: #fff; border: 1px solid var(--border); border-radius: 14px; }
    h2 { margin: 0 0 .8rem; font-size: 1.3rem; }
    a { color: var(--teal); font-weight: 600; }
    a:focus-visible { outline: 3px solid #b45309; outline-offset: 2px; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .92em; }
    code { padding: .1em .35em; background: var(--soft); border-radius: 4px; }
    pre { margin: 0; padding: 1rem; overflow-x: auto; color: #e6f6f3; background: var(--teal-dark); border-radius: 10px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: .55rem .6rem; text-align: left; vertical-align: top; border-bottom: 1px solid var(--border); }
    th { font-size: .85rem; text-transform: uppercase; letter-spacing: .03em; color: var(--muted); }
    .method { display: inline-block; min-width: 4.2rem; padding: .1rem .45rem; font-size: .8rem; font-weight: 700; text-align: center; border-radius: 6px; color: #fff; background: var(--teal); }
    .post { background: #166534; } .put { background: #92400e; } .delete { background: #b42318; }
    .base { display: inline-block; padding: .35rem .7rem; color: #fff; background: rgba(255,255,255,.15); border-radius: 8px; word-break: break-all; }
    .note { padding: .8rem 1rem; color: #92400e; background: #fef3c7; border-radius: 10px; }
    ul { margin: 0; padding-left: 1.2rem; }
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <h1>IT Support Desk API</h1>
      <p>A Node.js, Express and SQLite API that stores requests for computer support
         (Network, Software, Hardware, Accounts, Printing).</p>
      <p>Chipo Kalulu &middot; Student number 202508518 &middot; ICT251 Activity 7: Backend Development</p>
      <p>Base URL: <span class="base">${base}</span></p>
    </div>
  </header>

  <main class="wrap">
    <section>
      <h2>Quick links</h2>
      <ul>
        <li><a href="${base}/health">${base}/health</a> (server and database check)</li>
        <li><a href="${base}/api/records">${base}/api/records</a> (all records as JSON)</li>
      </ul>
    </section>

    <section>
      <h2>Routes</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Method</th><th>Route</th><th>Purpose</th><th>Success</th></tr></thead>
          <tbody>
            <tr><td><span class="method">GET</span></td><td><code>/</code></td><td>This API guide</td><td>200 HTML</td></tr>
            <tr><td><span class="method">GET</span></td><td><code>/health</code></td><td>Check that the server and database respond</td><td>200</td></tr>
            <tr><td><span class="method">GET</span></td><td><code>/api/records</code></td><td>Read all records (an array, or <code>[]</code>)</td><td>200</td></tr>
            <tr><td><span class="method">GET</span></td><td><code>/api/records/:id</code></td><td>Read one record</td><td>200</td></tr>
            <tr><td><span class="method post">POST</span></td><td><code>/api/records</code></td><td>Create a record; returns it with its new id</td><td>201</td></tr>
            <tr><td><span class="method put">PUT</span></td><td><code>/api/records/:id</code></td><td>Replace all four editable fields; returns the record</td><td>200</td></tr>
            <tr><td><span class="method delete">DELETE</span></td><td><code>/api/records/:id</code></td><td>Delete a record; returns <code>{"message":"Record deleted."}</code></td><td>200</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Record fields</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Field</th><th>Rule</th></tr></thead>
          <tbody>
            <tr><td><code>id</code></td><td>Positive whole number, created by the database. Do not send it; it is ignored.</td></tr>
            <tr><td><code>title</code></td><td>Text, 3 to 80 characters (after trimming spaces)</td></tr>
            <tr><td><code>category</code></td><td>Text, 2 to 40 characters, e.g. Network, Software, Hardware, Accounts, Printing</td></tr>
            <tr><td><code>description</code></td><td>Text, 5 to 300 characters</td></tr>
            <tr><td><code>status</code></td><td>Exactly <code>Pending</code>, <code>In progress</code> or <code>Completed</code></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Example POST and PUT body</h2>
      <p>Send with the header <code>Content-Type: application/json</code>. POST and PUT both need all four fields.</p>
      <pre>${escapeHtml(EXAMPLE_BODY)}</pre>
    </section>

    <section>
      <h2>Status codes</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td>200</td><td>Success (GET, PUT, DELETE)</td></tr>
            <tr><td>201</td><td>Record created (POST)</td></tr>
            <tr><td>400</td><td>Invalid input, invalid id or malformed JSON</td></tr>
            <tr><td>404</td><td>Record or route does not exist</td></tr>
            <tr><td>500</td><td>Unexpected server error</td></tr>
            <tr><td>503</td><td>Database not reachable (from <code>/health</code>)</td></tr>
          </tbody>
        </table>
      </div>
      <p>Every error is JSON with a <code>message</code> field, for example
         <code>{"message":"Title must have 3 to 80 characters."}</code></p>
    </section>

    <p class="note"><strong>Note:</strong> this service runs on a free hosting plan. If it has been idle,
       the first request can take up to a minute while it starts. Later requests are fast.</p>
  </main>
</body>
</html>`;
}

module.exports = { renderGuide };
