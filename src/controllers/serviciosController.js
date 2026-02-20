import Estudiante from '../models/Estudiante.js'
import Tutoria from '../models/Tutoria.js'
import Psicologia from '../models/Psicologia.js'
import Comedor from '../models/Comedor.js'
import Vocacional from '../models/Vocacional.js'
import Socioeconomico from '../models/Socioeconomico.js'
import Talleres from '../models/Talleres.js'
import Seguimiento from '../models/Seguimiento.js'

const crearOEncontrarEstudiante = async (datosEstudiante) => {
  let estudiante = await Estudiante.findOne({ numero_documento1: datosEstudiante.numero_documento1 })
  if (estudiante) {
    estudiante = await Estudiante.findByIdAndUpdate(estudiante._id, datosEstudiante, { new: true, runValidators: true })
  } else {
    estudiante = new Estudiante(datosEstudiante)
    await estudiante.save()
  }
  return estudiante
}

const validarDatos = (datos, camposRequeridos) => {
  const errores = {}
  camposRequeridos.forEach((campo) => {
    if (!datos[campo] || datos[campo] === '') errores[campo] = `El campo ${campo} es requerido`
  })
  return errores
}

const extractEstudianteData = (datos) => ({
  tipo_documento: datos.tipo_documento,
  numero_documento1: datos.numero_documento1,
  nombres: datos.nombres.toUpperCase(),
  apellidos: datos.apellidos.toUpperCase(),
  correo1: datos.correo1,
  telefono: datos.telefono,
  direccion: datos.direccion,
  programa_academico: datos.programa_academico,
  semestre: Number.parseInt(datos.semestre),
  riesgo_desercion: datos.riesgo_desercion,
  estrato: Number.parseInt(datos.estrato),
})

const baseFields = ['tipo_documento', 'numero_documento1', 'nombres', 'apellidos', 'correo1', 'programa_academico', 'semestre', 'riesgo_desercion', 'estrato']

export const registrarTutoria = async (req, res) => {
  try {
    const datos = req.body
    const errores = validarDatos(datos, [...baseFields, 'nivel_riesgo', 'fecha_asignacion'])
    if (Object.keys(errores).length > 0) return res.status(400).json({ success: false, error: 'Datos inválidos', message: errores })

    const estudiante = await crearOEncontrarEstudiante(extractEstudianteData(datos))
    const tutoriaExistente = await Tutoria.findOne({ estudiante: estudiante._id, estado: 'Activo' })
    if (tutoriaExistente) return res.status(400).json({ success: false, error: 'Tutoría duplicada', message: 'El estudiante ya tiene una tutoría activa' })

    const tutoria = new Tutoria({ estudiante: estudiante._id, nivel_riesgo: datos.nivel_riesgo, requiere_tutoria: datos.requiere_tutoria || true, fecha_asignacion: new Date(datos.fecha_asignacion), acciones_apoyo: datos.acciones_apoyo })
    await tutoria.save()
    res.status(201).json({ success: true, message: 'Tutoría registrada exitosamente', data: { estudiante, tutoria } })
  } catch (error) {
    console.error('Error al registrar tutoría:', error)
    res.status(500).json({ success: false, error: 'Error interno del servidor', message: error.message })
  }
}

export const registrarPsicologia = async (req, res) => {
  try {
    const datos = req.body
    const errores = validarDatos(datos, [...baseFields, 'motivo_intervencion', 'tipo_intervencion', 'fecha_atencion'])
    if (Object.keys(errores).length > 0) return res.status(400).json({ success: false, error: 'Datos inválidos', message: errores })

    const estudiante = await crearOEncontrarEstudiante(extractEstudianteData(datos))
    const psicologia = new Psicologia({ estudiante: estudiante._id, motivo_intervencion: datos.motivo_intervencion, tipo_intervencion: datos.tipo_intervencion, fecha_atencion: new Date(datos.fecha_atencion), seguimiento: datos.seguimiento })
    await psicologia.save()
    res.status(201).json({ success: true, message: 'Atención psicológica registrada exitosamente', data: { estudiante, psicologia } })
  } catch (error) {
    console.error('Error al registrar psicología:', error)
    res.status(500).json({ success: false, error: 'Error interno del servidor', message: error.message })
  }
}

export const registrarComedor = async (req, res) => {
  try {
    const datos = req.body
    const errores = validarDatos(datos, [...baseFields, 'condicion_socioeconomica', 'fecha_solicitud', 'tipo_comida', 'raciones_asignadas'])
    if (Object.keys(errores).length > 0) return res.status(400).json({ success: false, error: 'Datos inválidos', message: errores })

    const estudiante = await crearOEncontrarEstudiante(extractEstudianteData(datos))
    const comedorExistente = await Comedor.findOne({ estudiante: estudiante._id, estado: { $in: ['Pendiente', 'Aprobado', 'Activo'] } })
    if (comedorExistente) return res.status(400).json({ success: false, error: 'Solicitud duplicada', message: 'El estudiante ya tiene una solicitud de comedor activa' })

    const datosComedor = {
      estudiante: estudiante._id,
      condicion_socioeconomica: datos.condicion_socioeconomica,
      fecha_solicitud: new Date(datos.fecha_solicitud),
      aprobado: Boolean(datos.aprobado),
      tipo_comida: datos.tipo_comida,
      raciones_asignadas: Number.parseInt(datos.raciones_asignadas),
      observaciones: datos.observaciones,
      estado: Boolean(datos.aprobado) ? 'Aprobado' : 'Pendiente',
    }
    const comedor = new Comedor(datosComedor)
    await comedor.save()
    res.status(201).json({ success: true, message: 'Solicitud de comedor registrada exitosamente', data: { estudiante, comedor } })
  } catch (error) {
    console.error('Error al registrar comedor:', error)
    res.status(500).json({ success: false, error: 'Error interno del servidor', message: error.message })
  }
}

export const registrarVocacional = async (req, res) => {
  try {
    const datos = req.body
    const errores = validarDatos(datos, [...baseFields, 'tipo_participante', 'riesgo_spadies', 'fecha_ingreso_programa'])
    if (Object.keys(errores).length > 0) return res.status(400).json({ success: false, error: 'Datos inválidos', message: errores })

    const estudiante = await crearOEncontrarEstudiante(extractEstudianteData(datos))
    const vocacional = new Vocacional({ estudiante: estudiante._id, tipo_participante: datos.tipo_participante, riesgo_spadies: datos.riesgo_spadies, fecha_ingreso_programa: new Date(datos.fecha_ingreso_programa), observaciones: datos.observaciones })
    await vocacional.save()
    res.status(201).json({ success: true, message: 'Orientación vocacional registrada exitosamente', data: { estudiante, vocacional } })
  } catch (error) {
    console.error('Error al registrar orientación vocacional:', error)
    res.status(500).json({ success: false, error: 'Error interno del servidor', message: error.message })
  }
}

export const registrarSocioeconomico = async (req, res) => {
  try {
    const datos = req.body
    const errores = validarDatos(datos, baseFields)
    if (Object.keys(errores).length > 0) return res.status(400).json({ success: false, error: 'Datos inválidos', message: errores })

    const estudiante = await crearOEncontrarEstudiante(extractEstudianteData(datos))
    const socioeconomico = new Socioeconomico({ estudiante: estudiante._id, tipo_vulnerabilidad: datos.tipo_vulnerabilidad, observaciones: datos.observaciones })
    await socioeconomico.save()
    res.status(201).json({ success: true, message: 'Apoyo socioeconómico registrado exitosamente', data: { estudiante, socioeconomico } })
  } catch (error) {
    console.error('Error al registrar apoyo socioeconómico:', error)
    res.status(500).json({ success: false, error: 'Error interno del servidor', message: error.message })
  }
}

export const registrarTalleres = async (req, res) => {
  try {
    const datos = req.body
    const errores = validarDatos(datos, [...baseFields, 'nombre_taller', 'fecha_taller'])
    if (Object.keys(errores).length > 0) return res.status(400).json({ success: false, error: 'Datos inválidos', message: errores })

    const estudiante = await crearOEncontrarEstudiante(extractEstudianteData(datos))
    const taller = new Talleres({ estudiante: estudiante._id, nombre_taller: datos.nombre_taller, fecha_taller: new Date(datos.fecha_taller), observaciones: datos.observaciones })
    await taller.save()
    res.status(201).json({ success: true, message: 'Taller registrado exitosamente', data: { estudiante, taller } })
  } catch (error) {
    console.error('Error al registrar taller:', error)
    res.status(500).json({ success: false, error: 'Error interno del servidor', message: error.message })
  }
}

export const registrarSeguimiento = async (req, res) => {
  try {
    const datos = req.body
    const errores = validarDatos(datos, [...baseFields, 'estado_participacion', 'observaciones_permanencia'])
    if (Object.keys(errores).length > 0) return res.status(400).json({ success: false, error: 'Datos inválidos', message: errores })

    const estudiante = await crearOEncontrarEstudiante(extractEstudianteData(datos))
    const seguimiento = new Seguimiento({ estudiante: estudiante._id, estado_participacion: datos.estado_participacion, observaciones_permanencia: datos.observaciones_permanencia })
    await seguimiento.save()
    res.status(201).json({ success: true, message: 'Seguimiento registrado exitosamente', data: { estudiante, seguimiento } })
  } catch (error) {
    console.error('Error al registrar seguimiento:', error)
    res.status(500).json({ success: false, error: 'Error interno del servidor', message: error.message })
  }
}

export const obtenerEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Estudiante.find({ activo: true }).sort({ fecha_registro: -1 })
    res.status(200).json({ success: true, data: estudiantes, total: estudiantes.length })
  } catch (error) {
    console.error('Error al obtener estudiantes:', error)
    res.status(500).json({ success: false, error: 'Error interno del servidor', message: error.message })
  }
}
