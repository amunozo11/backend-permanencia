const express = require("express")
const router = express.Router()
const controller = require("../controllers/csvUpload.controller")

// Endpoint: POST /api/upload-csv
router.post("/upload-csv", controller.uploadCsv, controller.processCsv)

// Endpoint: GET /api/datos-permanencia
router.get("/datos-permanencia", controller.getAllData)

// Endpoint: GET /api/estadisticas
router.get("/estadisticas", controller.getStats)

module.exports = router
