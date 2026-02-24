import { Router } from 'express';
import multer from 'multer';
import {
    importarMortalidad,
    obtenerTopAsignaturas,
    obtenerEvolucionAsignatura,
    obtenerConcentracionHistorica,
    obtenerRiesgosEmergentes,
    obtenerListaAsignaturas
} from '../controllers/mortalidadController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/importar', upload.single('file'), importarMortalidad);
router.get('/top-asignaturas', obtenerTopAsignaturas);
router.get('/evolucion/:asignatura', obtenerEvolucionAsignatura);
router.get('/concentracion-historica', obtenerConcentracionHistorica);
router.get('/riesgos-emergentes', obtenerRiesgosEmergentes);
router.get('/asignaturas', obtenerListaAsignaturas);

export default router;
