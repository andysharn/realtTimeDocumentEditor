const express = require('express');
const router = express.Router();
const { createDocument, getDocuments, getDocument, joinDocument } = require('../controller/documentController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, createDocument);
router.get('/', authenticateToken, getDocuments);
router.get('/:id', authenticateToken, getDocument);
router.post('/:id/join', authenticateToken, joinDocument);

module.exports = router;