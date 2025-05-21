const express = require('express');
const router = express.Router();
const controller = require('../controllers/csvUpload.controller');

// Endpoint: POST /api/upload-csv
router.post('/upload-csv', controller.uploadCsv, controller.processCsv);

module.exports = router;