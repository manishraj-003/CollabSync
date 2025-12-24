const express = require("express");
const http = require("http");

const app = express();

/* 🔴 REQUIRED FOR RAILWAY / PROXIES */
app.set("trust proxy", true);

/* 🔴 HARD CORS HEADERS (BEFORE EVERYTHING) */
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://collab-sync-alpha.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use(express.json());

/* Routes */
app.use("/auth", require("./routes/auth.routes"));
app.use("/document", require("./routes/document.routes"));

/* Health check */
app.get("/", (req, res) => {
  res.json({ status: "CollabSync Gateway Running" });
});

/* HTTP + WS */
const server = http.createServer(app);
require("./wsServer")(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("🚀 CollabSync Gateway running on port", PORT);
});
