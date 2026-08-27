const express = require('express');
const router = express.Router();
const documentController = require('../../controllers/documentController');

// Generate pre-filled scheme application PDF document
router.post('/generate', documentController.generateDocument);

// Get document download details and relative path
router.get('/download/:docId', documentController.downloadDocument);

// Stream actual generated PDF binary
router.get('/file/:docId', documentController.streamDocumentFile);

module.exports = router;
