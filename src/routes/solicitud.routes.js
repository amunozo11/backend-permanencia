import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import {
    crearSolicitud,
    misSolicitudes,
    todasSolicitudes,
    obtenerSolicitud,
    actualizarEstado,
} from '../controllers/solicitudController.js'

const router = Router()

// Estudiante: crear solicitud
router.post('/', authMiddleware, crearSolicitud)

// Estudiante: mis solicitudes
router.get('/mis', authMiddleware, misSolicitudes)

// Admin: todas las solicitudes
router.get('/', authMiddleware, requireRole('admin'), todasSolicitudes)

// Detalle de solicitud (admin o dueño)
router.get('/:id', authMiddleware, obtenerSolicitud)

// Admin: actualizar estado
router.put('/:id/estado', authMiddleware, requireRole('admin'), actualizarEstado)

export default router
