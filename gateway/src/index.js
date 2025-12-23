const express = require("express");
const http = require("http");

const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");

const app = express();
const server = http.createServer(app);

// 🔥 Attach WebSocket server (THIS WAS MISSING)
require("./wsServer")(server);

// Middleware
app.use(express.json());

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
