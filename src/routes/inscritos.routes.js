import express from 'express';
import multer from 'multer';
import {
    importarDatos,
    getPorMunicipio,
    getTopMunicipios,
    getTotalInscritos
} from '../controllers/inscritosController.js';

const router = express.Router();

// Usamos multer para procesar form-data. Recomendable almacenar temporalmente.
const upload = multer({ dest: 'uploads/temp/' });

// Rutas de importación
router.post('/importar', upload.single('file'), importarDatos);

// Rutas de análisis
router.get('/por-municipio', getPorMunicipio);
router.get('/top', getTopMunicipios);
router.get('/total', getTotalInscritos);

export default router;
