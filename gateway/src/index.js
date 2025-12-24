const express = require("express");
const cors = require("cors");

const app = express();

/* 🔴 TEMPORARY CORS TEST — ALLOW EVERYTHING */
app.use(cors({
  origin: "*"
}));

/* 🔴 HANDLE PREFLIGHT */
app.options("*", cors());

app.use(express.json());

/* routes */
app.use("/auth", require("./routes/auth.routes"));
app.use("/document", require("./routes/document.routes"));
