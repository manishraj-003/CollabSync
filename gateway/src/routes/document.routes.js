const express = require("express");
const router = express.Router();

const docController = require("../controllers/document.controller");
const Document = require("../models/document.model");
const auth = require("../middleware/auth");

/**
 * CRUD & Management (controller-based)
 */
router.post("/create", auth, docController.create);
router.get("/list", auth, docController.list);
router.get("/:id", auth, docController.load);
router.post("/rename", auth, docController.rename);
router.post("/delete", auth, docController.delete);
router.post("/share", auth, docController.share);

/**
 * GET document content only (used by editor load)
 * GET /document/:id/content
 */
router.get("/:id/content", auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).select("content");

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({ content: doc.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

module.exports = router;
