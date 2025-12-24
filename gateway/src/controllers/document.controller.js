const Document = require("../models/document.model");

/**
 * CREATE DOCUMENT
 */
exports.create = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const userId = req.user.id; // from JWT

    const doc = await Document.create(userId, title);

    return res.status(201).json(doc);
  } catch (err) {
    console.error("Create document error:", err);
    return res.status(500).json({ error: "Failed to create document" });
  }
};

/**
 * LIST USER DOCUMENTS
 */
exports.list = async (req, res) => {
  try {
    const userId = req.user.id;

    const docs = await Document.getUserDocs(userId);

    return res.json(docs);
  } catch (err) {
    console.error("List documents error:", err);
    return res.status(500).json({ error: "Failed to list documents" });
  }
};

/**
 * LOAD SINGLE DOCUMENT
 */
exports.load = async (req, res) => {
  try {
    const doc = await Document.getDocument(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.json(doc);
  } catch (err) {
    console.error("Load document error:", err);
    return res.status(500).json({ error: "Failed to load document" });
  }
};

/**
 * RENAME DOCUMENT
 */
exports.rename = async (req, res) => {
  try {
    const { id, title } = req.body;

    await Document.rename(id, title);

    return res.json({ success: true });
  } catch (err) {
    console.error("Rename document error:", err);
    return res.status(500).json({ error: "Failed to rename document" });
  }
};

/**
 * DELETE DOCUMENT
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.body;

    await Document.delete(id);

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete document error:", err);
    return res.status(500).json({ error: "Failed to delete document" });
  }
};

/**
 * SHARE DOCUMENT
 */
exports.share = async (req, res) => {
  try {
    // your existing share logic
    return res.json({ success: true });
  } catch (err) {
    console.error("Share document error:", err);
    return res.status(500).json({ error: "Failed to share document" });
  }
};
