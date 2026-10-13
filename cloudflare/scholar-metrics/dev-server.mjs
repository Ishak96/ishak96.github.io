// Local stand-in for Cloudflare's runtime: serves worker.mjs on http://localhost:8787
// so live Scholar metrics also work with the local Jekyll server.
import http from "node:http";
import { readFileSync } from "node:fs";
import worker from "./worker.mjs";

const vars = Object.fromEntries(
  [...readFileSync(new URL("./wrangler.toml", import.meta.url), "utf8").matchAll(/^([A-Z_]+)\s*=\s*"([^"]*)"/gm)].map((match) => [match[1], match[2]])
);
const port = Number(process.env.PORT || 8787);

http
  .createServer(async (req, res) => {
    try {
      const request = new Request(`http://localhost:${port}${req.url}`, { method: req.method, headers: req.headers });
      const response = await worker.fetch(request, vars, { waitUntil() {} });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(String(error));
    }
  })
  .listen(port, () => console.log(`Scholar metrics worker listening on http://localhost:${port}`));
