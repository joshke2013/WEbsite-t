import { createServer } from "node:http";
import path from "node:path";
import express from "express";
import wisp from "wisp-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";

const app = express();
const publicDir = path.resolve("public");

// Ultraviolet 3.2.10 standard assets, exposed under the same /cdn names used by the supplied frontend.
app.get("/cdn/bundle.js", (_req, res) => res.sendFile(path.join(uvPath, "uv.bundle.js")));
app.get("/cdn/client.js", (_req, res) => res.sendFile(path.join(uvPath, "uv.client.js")));
app.get("/cdn/handler.js", (_req, res) => res.sendFile(path.join(uvPath, "uv.handler.js")));

app.use(express.static(publicDir, { extensions: ["html"] }));
app.get("/uu", (_req, res) => res.sendFile(path.join(publicDir, "uu.html")));
app.get("/home", (_req, res) => res.sendFile(path.join(publicDir, "uu.html")));

const server = createServer((req, res) => {
  // SharedArrayBuffer is used by Scramjet's sync-XHR bridge.
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  app(req, res);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

const port = Number(process.env.PORT || 8080);
server.listen(port, "0.0.0.0", () => {
  console.log(`Tung browser rebuild running on http://localhost:${port}/uu`);
});
