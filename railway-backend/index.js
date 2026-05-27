"use strict";

require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const { getUserToken, getCreditReport } = require("./services/array");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────────────────────────
// ALLOWED_ORIGIN accepts a comma-separated list so you can whitelist both
// the Replit dev URL and the deployed .replit.app domain.
const allowedOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls (no Origin header) and whitelisted origins
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ── Internal auth middleware ──────────────────────────────────────────────────
// Protected routes require: Authorization: Bearer <INTERNAL_API_SECRET>
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "";

function requireInternalSecret(req, res, next) {
  if (!INTERNAL_SECRET) {
    // Secret not configured — reject all requests for safety
    return res.status(503).json({ error: "INTERNAL_API_SECRET not configured on this server" });
  }
  const authHeader = req.headers["authorization"] || "";
  const provided   = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (provided !== INTERNAL_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ── Health check (no auth — Railway uses this) ────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "scoreshift-array-proxy",
    env: process.env.ARRAY_PRODUCTION_MODE === "true" ? "production" : "sandbox",
    timestamp: new Date().toISOString(),
  });
});

// ── POST /array/token ─────────────────────────────────────────────────────────
// Body: { userId: string, appKey?: string }
// Returns: { token: string } | { error: string }
app.post("/array/token", requireInternalSecret, async (req, res) => {
  const { userId, appKey } = req.body || {};

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const result = await getUserToken(userId, appKey);
    if (result.error) {
      console.error(`[/array/token] Failed for userId=${userId}:`, result.error);
      return res.status(502).json({ error: result.error });
    }
    return res.json({ token: result.token });
  } catch (err) {
    console.error("[/array/token] Unexpected error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /array/credit-report ──────────────────────────────────────────────────
// Query: ?userToken=<short-lived-token>
// Returns the raw Array credit-report JSON, or { error }
app.get("/array/credit-report", requireInternalSecret, async (req, res) => {
  const { userToken } = req.query;

  if (!userToken) {
    return res.status(400).json({ error: "userToken query param is required" });
  }

  try {
    const result = await getCreditReport(userToken);
    if (result.error) {
      console.error(`[/array/credit-report] Failed:`, result.error);
      return res.status(result.status || 502).json({ error: result.error });
    }
    return res.json(result.data);
  } catch (err) {
    console.error("[/array/credit-report] Unexpected error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ── 404 fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[scoreshift-array-proxy] Listening on port ${PORT}`);
  console.log(`[scoreshift-array-proxy] Mode: ${process.env.ARRAY_PRODUCTION_MODE === "true" ? "PRODUCTION" : "sandbox"}`);
  console.log(`[scoreshift-array-proxy] CORS origins: ${allowedOrigins.join(", ") || "(all — dev mode)"}`);
});
