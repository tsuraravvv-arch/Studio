import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../docs", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8", ".mp3": "audio/mpeg" };
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/") { res.writeHead(302, { Location: "/Studio/" }); res.end(); return; }
    if (!url.pathname.startsWith("/Studio/")) throw new Error("Not found");
    let file = resolve(root, "." + decodeURIComponent(url.pathname.slice(7)));
    if (file !== root && !file.startsWith(root + sep)) throw new Error("Not found");
    let info = await stat(file);
    if (info.isDirectory()) {
      if (!url.pathname.endsWith("/")) { res.writeHead(301, { Location: url.pathname + "/" + url.search }); res.end(); return; }
      file = resolve(file, "index.html"); info = await stat(file);
    }
    const headers = { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Accept-Ranges": "bytes" };
    let start = 0, end = info.size - 1;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) { res.writeHead(416, { "Content-Range": `bytes */${info.size}` }); res.end(); return; }
      start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
      if (start > end || start >= info.size) { res.writeHead(416, { "Content-Range": `bytes */${info.size}` }); res.end(); return; }
      headers["Content-Range"] = `bytes ${start}-${end}/${info.size}`;
    }
    res.writeHead(req.headers.range ? 206 : 200, { ...headers, "Content-Length": Math.max(0,end-start+1) });
    if (req.method === "HEAD" || !info.size) { res.end(); return; }
    const stream = createReadStream(file, { start, end });
    stream.on("error", () => res.destroy()); res.on("close", () => stream.destroy()); stream.pipe(res);
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(4173, "127.0.0.1", () => console.log("Preview: http://localhost:4173/Studio/"));
