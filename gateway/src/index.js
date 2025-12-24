const express = require("express");
const cors = require("cors");
const http = require("http");

const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");

const app = express();
const server = http.createServer(app);

/* 🔴 1. TRUST PROXY (Railway) */
app.set("trust proxy", 1);

/* 🔴 2. CORS MUST COME FIRST */
app.use(cors({
  origin: "https://collab-sync-alpha.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

/* 🔴 3. HANDLE PREFLIGHT EXPLICITLY */
app.options("*", cors({
  origin: "https://collab-sync-alpha.vercel.app",
  credentials: true
}));

/* 🔴 4. BODY PARSER AFTER CORS */
app.use(express.json());

/* 🔴 5. ROUTES */
app.use("/auth", authRoutes);
app.use("/document", documentRoutes);

/* 🔴 6. HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("CollabSync Gateway is running");
});

/* 🔴 7. WEBSOCKET ATTACHMENT */
require("./wsServer")(server);

/* 🔴 8. START SERVER */
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Gateway running on port ${PORT}`);
});
