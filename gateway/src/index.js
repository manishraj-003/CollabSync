/**
 * gateway/src/index.js
 * MAIN ENTRY FILE (Railway must run this)
 */

const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();

/* ================================
   🔴 CRITICAL: CORS (MUST BE FIRST)
   ================================ */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://collab-sync-alpha.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// Handle preflight requests
app.options("*", cors());

/* ================================
   Middleware
   ================================ */
app.use(express.json());

/* ================================
   Routes
   ================================ */
app.use("/auth", require("./routes/auth.routes"));
app.use("/document", require("./routes/document.routes"));

/* ================================
   Health check (VERY IMPORTANT)
   ================================ */
app.get("/", (req, res) => {
  res.json({ status: "CollabSync Gateway Running" });
});

/* ================================
   Create HTTP Server
   ================================ */
const server = http.createServer(app);

/* ================================
   Attach WebSocket Server
   ================================ */
const initWsServer = require("./wsServer");
initWsServer(server);

/* ================================
   Start Server (Railway compatible)
   ================================ */
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log("🚀 CollabSync Gateway running on port", PORT);
});
