import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { uploadFile, listFiles, getFileById, downloadFileById } from '../controllers/bucket.controller.js'

// Múltiples entornos sugieren tener `uploads` preparado temporalmente
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync('uploads/')) {
            fs.mkdirSync('uploads/')
        }
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
})

const upload = multer({ storage })

const router = Router()

// Protegiendo los endpoints con auth y role admin (como se acordó)
router.use(authMiddleware)
router.use(requireRole('admin'))

// POST /api/bucket/upload
router.post('/upload', upload.single('file'), uploadFile)

// GET /api/bucket/files
router.get('/files', listFiles)

// GET /api/bucket/files/:id
router.get('/files/:id', getFileById)

// GET /api/bucket/files/:id/download
router.get('/files/:id/download', downloadFileById)

export default router
