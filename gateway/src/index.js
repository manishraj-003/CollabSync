const express = require("express");
const http = require("http");
require("dotenv").config();

const app = express();

/* ================================
   🔴 FORCE CORS HEADERS (NO DEPENDENCY)
   ================================ */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://collab-sync-alpha.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

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
   Health check
   ================================ */
app.get("/", (req, res) => {
  res.json({ status: "CollabSync Gateway Running" });
});

/* ================================
   HTTP + WebSocket Server
   ================================ */
const server = http.createServer(app);
require("./wsServer")(server);

/* ================================
   Start Server
   ================================ */
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("🚀 CollabSync Gateway running on port", PORT);
});
