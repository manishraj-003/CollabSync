// controllers/document.controller.js
const Document = require("../models/document.model");

exports.share = async (req, res) => {
  try {
    const { documentId, email, role } = req.body;

    if (!documentId || !email) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // prevent duplicate sharing
    const alreadyShared = doc.sharedWith.find(
      (u) => u.email === email
    );

    if (alreadyShared) {
      return res.status(400).json({ error: "Already shared" });
    }

    doc.sharedWith.push({
      email,
      role: role || "editor"
    });

    await doc.save();

    res.json({ message: "Document shared successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Share failed" });
  }
};
