const express = require("express");
const app = express();

const authRoutes = require("./routes/auth.routes");
const documentRoutes = require("./routes/document.routes");

app.use(express.json());

app.use("/", authRoutes);
app.use("/", documentRoutes);

module.exports = app;

// Auth routes
app.use("/", authRoutes);

// 🔥 Document routes
app.use("/document", documentRoutes);
