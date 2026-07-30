import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:2121";

async function proxyToBackend(req: express.Request, res: express.Response) {
  const targetUrl = new URL(req.originalUrl, BACKEND_URL);
  const headers = new Headers();

  Object.entries(req.headers).forEach(([key, value]) => {
    if (value === undefined || ["host", "content-length"].includes(key.toLowerCase())) return;
    headers.set(key, Array.isArray(value) ? value.join(",") : value);
  });

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body),
    redirect: "manual",
  });

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = Buffer.from(await response.arrayBuffer());
  res.send(body);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  app.get(["/api/admin", "/api/admin/"], (req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
      next();
      return;
    }

    res.sendFile(path.join(process.cwd(), "dist", "index.html"));
  });

  app.use("/api", async (req, res, next) => {
    if (
      process.env.NODE_ENV !== "production" &&
      req.method === "GET" &&
      ["/api/admin", "/api/admin/"].includes(req.originalUrl)
    ) {
      next();
      return;
    }

    try {
      await proxyToBackend(req, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reach backend API";
      res.status(502).json({ success: false, message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CAR BYTE server running on http://localhost:${PORT}`);
    console.log(`Proxying /api requests to ${BACKEND_URL}`);
  });
}

startServer();
