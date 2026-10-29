// Acceptance-only server: exercise the built app at the actual Pages subpath.
// Serve dist directly so a real second Vite build exercises new HTML, hashed
// application assets and the generated service-worker manifest together.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("dist"), base = "/woodshed/";
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    if (!url.pathname.startsWith(base)) { res.writeHead(404).end(); return; }
    const relative = decodeURIComponent(url.pathname.slice(base.length)) || "index.html";
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch (error) { res.writeHead(error.code === "ENOENT" ? 404 : 500).end(error.message); }
});
server.listen(4178, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
