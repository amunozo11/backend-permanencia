import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import {
    obtenerNotificaciones,
    contarNoLeidas,
    marcarLeida,
    marcarTodasLeidas,
} from '../controllers/notificationController.js'

const router = Router()

router.get('/', authMiddleware, obtenerNotificaciones)
router.get('/count', authMiddleware, contarNoLeidas)
router.put('/:id/leer', authMiddleware, marcarLeida)
router.put('/leer-todas', authMiddleware, marcarTodasLeidas)

export default router
