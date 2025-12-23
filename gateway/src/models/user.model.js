const pool = require("../db");

module.exports = {
  async createUser(name, email, hashedPassword) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hashedPassword]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    await pool.query(
      `UPDATE users SET status = $1 WHERE id = $2`,
      [status, id]
    );
  }
};
