const pool = require("../db");

module.exports = {
  async addCollaborator(userId, docId, role = "editor") {
    await pool.query(
      `INSERT INTO collaborators (user_id, document_id, role)
       VALUES ($1, $2, $3)`,
      [userId, docId, role]
    );
  },

  async getCollaborators(docId) {
    const res = await pool.query(`
      SELECT users.id, users.name, collaborators.role
      FROM collaborators
      JOIN users ON users.id = collaborators.user_id
      WHERE collaborators.document_id = $1
    `, [docId]);

    return res.rows;
  }
};
