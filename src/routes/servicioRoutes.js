import { Router } from 'express'
import Tutoria from '../models/Tutoria.js'
import Psicologia from '../models/Psicologia.js'
import Comedor from '../models/Comedor.js'
import Vocacional from '../models/Vocacional.js'
import Socioeconomico from '../models/Socioeconomico.js'
import Talleres from '../models/Talleres.js'
import Seguimiento from '../models/Seguimiento.js'
import {
  registrarTutoria,
  registrarPsicologia,
  registrarComedor,
  registrarVocacional,
  registrarSocioeconomico,
  registrarTalleres,
  registrarSeguimiento,
  obtenerEstudiantes,
} from '../controllers/serviciosController.js'

const router = Router()

// Rutas para registrar servicios
router.post('/tutoria', registrarTutoria)
router.post('/psicologia', registrarPsicologia)
router.post('/comedor', registrarComedor)
router.post('/vocacional', registrarVocacional)
router.post('/socioeconomico', registrarSocioeconomico)
router.post('/talleres', registrarTalleres)
router.post('/seguimiento', registrarSeguimiento)

// Ruta para obtener estudiantes
router.get('/estudiantes', obtenerEstudiantes)

// Rutas adicionales para consultas específicas
router.get('/tutoria', async (req, res) => {
  try {
    const tutorias = await Tutoria.find().populate('estudiante').sort({ fecha_asignacion: -1 })
    res.json({ success: true, data: tutorias })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get('/psicologia', async (req, res) => {
  try {
    const psicologias = await Psicologia.find().populate('estudiante').sort({ fecha_atencion: -1 })
    res.json({ success: true, data: psicologias })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get('/comedor', async (req, res) => {
  try {
    const comedores = await Comedor.find().populate('estudiante').sort({ fecha_solicitud: -1 })
    res.json({ success: true, data: comedores })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get('/vocacional', async (req, res) => {
  try {
    const vocacionales = await Vocacional.find().populate('estudiante').sort({ fecha_ingreso_programa: -1 })
    res.json({ success: true, data: vocacionales })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get('/socioeconomico', async (req, res) => {
  try {
    const socioeconomicos = await Socioeconomico.find().populate('estudiante').sort({ fecha_solicitud: -1 })
    res.json({ success: true, data: socioeconomicos })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get('/talleres', async (req, res) => {
  try {
    const talleres = await Talleres.find().populate('estudiante').sort({ fecha_taller: -1 })
    res.json({ success: true, data: talleres })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

router.get('/seguimiento', async (req, res) => {
  try {
    const seguimientos = await Seguimiento.find().populate('estudiante').sort({ fecha_seguimiento: -1 })
    res.json({ success: true, data: seguimientos })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
