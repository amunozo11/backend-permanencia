import { Router } from 'express';
import multer from 'multer';
import { importarRiesgo, obtenerEstadisticas } from '../controllers/riesgoController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Importar Excel (Admin)
router.post('/import', upload.single('archivo'), importarRiesgo);

// Estadísticas para Dashboards (Admin)
router.get('/stats', obtenerEstadisticas);

export default router;
