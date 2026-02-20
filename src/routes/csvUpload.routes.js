import { Router } from 'express'
import { uploadCsv, processCsv, getAllData, getStats } from '../controllers/csvUpload.controller.js'

const router = Router()

router.post('/upload-csv', uploadCsv, processCsv)
router.get('/datos-permanencia', getAllData)
router.get('/estadisticas', getStats)

export default router
