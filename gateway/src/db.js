const { Pool } = require("pg");

console.log("DATABASE_URL =", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode") ? { rejectUnauthorized: false } : false
});

module.exports = pool;
