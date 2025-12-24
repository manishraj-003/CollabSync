const express = require("express");
const http = require("http");

const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");
const app = express();
const server = http.createServer(app);

// 🔥 Attach WebSocket server (THIS WAS MISSING)
require("./wsServer")(server);

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://collab-sync-alpha.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Routes
app.use("/auth", authRoutes);
app.use("/document", documentRoutes);

// Health check (optional but recommended)
app.get("/", (req, res) => {
  res.send("CollabSync Gateway is running");
});

// 🔥 START SERVER (REQUIRED FOR RAILWAY)
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Gateway running on port ${PORT}`);
});
