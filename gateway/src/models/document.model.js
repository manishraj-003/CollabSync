const pool = require("../db");

module.exports = {
  async create(ownerId, title) {
    const result = await pool.query(
      `INSERT INTO documents (owner_id, title)
       VALUES ($1, $2) RETURNING *`,
      [ownerId, title]
    );
    return result.rows[0];
  },

  async getUserDocs(userId) {
    const result = await pool.query(`
      SELECT d.*
      FROM documents d
      LEFT JOIN collaborators c ON c.document_id = d.id
      WHERE d.owner_id = $1 OR c.user_id = $1
      ORDER BY d.updated_at DESC
    `, [userId]);

    return result.rows;
  },

  async getDocument(id) {
    const res = await pool.query(`SELECT * FROM documents WHERE id = $1`, [id]);
    return res.rows[0];
  },

  async updateContent(id, content) {
    await pool.query(
      `UPDATE documents SET content = $1, updated_at = NOW() WHERE id = $2`,
      [content, id]
    );
  },

  async rename(id, title) {
    await pool.query(
      `UPDATE documents SET title = $1 WHERE id = $2`,
      [title, id]
    );
  },

  async delete(id) {
    await pool.query(`DELETE FROM documents WHERE id = $1`, [id]);
  }
};
