import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../docs", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/") { res.writeHead(302, { Location: "/Studio/" }); res.end(); return; }
    if (!url.pathname.startsWith("/Studio/")) throw new Error("Not found");
    let file = resolve(root, "." + decodeURIComponent(url.pathname.slice(7)));
    if (file !== root && !file.startsWith(root + sep)) throw new Error("Not found");
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith("/")) { res.writeHead(301, { Location: url.pathname + "/" + url.search }); res.end(); return; }
      file = resolve(file, "index.html");
    }
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(4173, "127.0.0.1", () => console.log("Preview: http://localhost:4173/Studio/"));
