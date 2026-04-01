import multer from 'multer'
import csv from 'csv-parser'
import fs from 'fs'
import DatosPermanencia from '../models/DatosPermanencia.model.js'

// Configuración de multer
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
export const uploadCsv = upload.single('file')

const processCSVData = (csvData) => {
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) return []

  return csvData.map((row) => {
    // Mapeo inteligente de campos según Dataset-1.csv y formatos anteriores
    const semestre = Number.parseInt(row.estudiante_semestre || row.semestre || 0)
    const estrato = Number.parseInt(row.estudiante_estrato || row.estrato || 1)

    // Determinar servicio
    let servicio = ''
    if (row.tipo_remision === 'Tutorias' || row.requiere_tutoria === 'true') servicio = 'POA'
    else if (row.RemisionPsicologica_tipo_remision || row.tipo_intervencion?.includes('psico')) servicio = 'POPS'
    else if (row.ComedorUniversitario_condicion_socioeconomica || row.condicion_socioeconomica) servicio = 'Comedor'
    else if (row.POVAU_tipo_participante || row.tipo_participante) servicio = 'POVAU'
    else if (row.IntervencionGrupal_estado_solicitud) servicio = 'Intervención Grupal'
    else if (row.SolicitudAtencionIndividual_motivo_atencion) servicio = 'Atención Individual'
    else if (servicio === '' && row.tipo_intervencion) servicio = 'Otros'

    return {
      // El modelo requiere este campo, si falta en el CSV ponemos un valor genérico o 'POR DEFINIR'
      estudiante_programa_academico: row.estudiante_programa_academico || row.programa || 'INGENIERÍA DE SISTEMAS',
      semestre,
      periodo: row.RegistroBeneficio_periodo_academico_beneficiado || row.periodo || '2024-1',
      inscritos: parseInt(row.inscritos || 1),
      matriculados: parseInt(row.matriculados || 1),
      desertores: parseInt(row.desertores || row.Desertores || row.retirados || row.Retirados || row.desercion || 0),
      graduados: parseInt(row.graduados || row.Graduados || row.egresados || row.Egresados || row.egresado || row.termino || 0),
      estrato,
      riesgo_desercion: row.estudiante_riesgo_desercion || row.riesgo_desercion || row.nivel_riesgo || row.Riesgo || 'Bajo',
      tipo_vulnerabilidad: row.estudiante_tipo_vulnerabilidad || row.tipo_vulnerabilidad || 'Ninguna',
      requiere_tutoria: row.requiere_tutoria === 'true' || Boolean(row.POVAU_tipo_participante),
      tipo_intervencion: row.tipo_intervencion || row.RemisionPsicologica_tipo_remision || '',
      condicion_socioeconomica: row.condicion_socioeconomica || row.ComedorUniversitario_condicion_socioeconomica || '',
      aprobado: row.aprobado === 'true' || row.ComedorUniversitario_aprobado === 'True',
      cumplimiento_requisitos: row.cumplimiento_requisitos === 'true' || row.RegistroBeneficio_estado_solicitud === 'True',
      servicio,
      numero_documento: row.estudiante_numero_documento || row.id_estudiante || row.numero_documento || '',
      fecha_remision: row.fecha_remision || row.RemisionPsicologica_fecha_remision || '',
      intervencion_recepcion: row.intervencion_recepcion || row.IntervencionGrupal_fecha_solicitud || row.fecha_solicitud || '',
      intervencion_cedula_titular: row.intervencion_cedula_titular || row.IntervencionGrupal_cedula_titular || '',
      intervencion_estado: row.intervencion_estado || row.IntervencionGrupal_estado_solicitud || '',
      remision_fecha: row.remision_fecha || row.RemisionPsicologica_fecha_remision || '',
      remision_tipo: row.remision_tipo || row.RemisionPsicologica_tipo_remision || '',
      asistencia_numero: row.asistencia_numero || row.FormatoAsistencia_numero_asistencia || '',
      asistencia_fecha: row.asistencia_fecha || row.FormatoAsistencia_fecha || '',
    }
  })
}


export const processCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo' })
    }

    const results = []
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Filtrar filas vacías o con pocos datos
          const validData = results.filter((r) => Object.keys(r).length > 1)
          const processedData = processCSVData(validData)

          // Limpiar la colección antes de insertar nuevos datos si se desea
          // await DatosPermanencia.deleteMany({})

          const inserted = await DatosPermanencia.insertMany(processedData)

          // Borrar el archivo temporal
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
          }

          res.status(200).json({
            success: true,
            message: 'Archivo procesado e insertado correctamente',
            inserted: inserted.length,
            data: inserted
          })
        } catch (error) {
          console.error('Error al insertar datos CSV:', error)
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
          res.status(500).json({
            success: false,
            message: 'Error al guardar los datos en la base de datos',
            error: error.message
          })
        }
      })
      .on('error', (error) => {
        console.error('Error al parsear CSV:', error)
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
        res.status(400).json({ success: false, message: 'Error al procesar el archivo CSV' })
      })
  } catch (error) {
    console.error('Error en processCsv:', error)
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}


export const getAllData = async (req, res) => {
  try {
    const data = await DatosPermanencia.find()
    res.json(data)
  } catch (err) {
    console.error('Error al obtener datos:', err)
    res.status(500).json({ error: err.message })
  }
}

export const getStats = async (req, res) => {
  try {
    const data = await DatosPermanencia.find()

    const totals = {
      inscritos: data.reduce((sum, item) => sum + (item.inscritos || 0), 0),
      matriculados: data.reduce((sum, item) => sum + (item.matriculados || 0), 0),
      desertores: data.reduce((sum, item) => sum + (item.desertores || 0), 0),
      graduados: data.reduce((sum, item) => sum + (item.graduados || 0), 0),
    }

    const programaStats = {}
    data.forEach((item) => {
      if (!programaStats[item.programa]) {
        programaStats[item.programa] = { programa: item.programa, total: 0, riesgoAlto: 0, riesgoMedio: 0, riesgoBajo: 0 }
      }
      programaStats[item.programa].total += 1
      if (item.riesgo_desercion === 'Alto' || item.riesgo_desercion === 'Muy Alto') programaStats[item.programa].riesgoAlto += 1
      else if (item.riesgo_desercion === 'Medio') programaStats[item.programa].riesgoMedio += 1
      else if (item.riesgo_desercion === 'Bajo' || item.riesgo_desercion === 'Muy bajo') programaStats[item.programa].riesgoBajo += 1
    })

    const riesgos = {}
    data.forEach((item) => {
      if (item.riesgo_desercion) {
        riesgos[item.riesgo_desercion] = (riesgos[item.riesgo_desercion] || 0) + 1
      }
    })
    const riesgoDesercionData = Object.entries(riesgos).map(([riesgo, cantidad]) => ({ riesgo, cantidad }))

    let requiereTutoria = 0
    let noRequiereTutoria = 0
    data.forEach((item) => {
      if (item.requiere_tutoria) requiereTutoria += 1
      else noRequiereTutoria += 1
    })
    const tutoriaData = [
      { name: 'Requiere tutoría', value: requiereTutoria },
      { name: 'No requiere tutoría', value: noRequiereTutoria },
    ]

    const vulnerabilidades = {}
    data.forEach((item) => {
      if (item.tipo_vulnerabilidad) {
        vulnerabilidades[item.tipo_vulnerabilidad] = (vulnerabilidades[item.tipo_vulnerabilidad] || 0) + 1
      }
    })
    const vulnerabilidadData = Object.entries(vulnerabilidades).map(([tipo, cantidad]) => ({ tipo, cantidad }))

    const servicios = {}
    data.forEach((item) => {
      if (item.servicio) {
        servicios[item.servicio] = (servicios[item.servicio] || 0) + 1
      }
    })
    const serviciosData = Object.entries(servicios).map(([servicio, cantidad]) => ({ servicio, cantidad }))

    const estratoRiesgo = {}
    data.forEach((item) => {
      if (item.estrato && (item.riesgo_desercion === 'Alto' || item.riesgo_desercion === 'Muy Alto')) {
        const estrato = item.estrato.toString()
        estratoRiesgo[estrato] = (estratoRiesgo[estrato] || 0) + 1
      }
    })
    const edadDesertores = Object.entries(estratoRiesgo).map(([estrato, cantidad]) => ({ estrato: Number(estrato), desertores: cantidad }))

    const estratoCount = {}
    data.forEach((item) => {
      if (item.estrato) {
        const estrato = item.estrato.toString()
        estratoCount[estrato] = (estratoCount[estrato] || 0) + 1
      }
    })
    const estratoInscritos = Object.entries(estratoCount).map(([estrato, cantidad]) => ({ estrato: Number(estrato), inscritos: cantidad }))

    res.json({
      totals,
      programaStats: Object.values(programaStats),
      riesgoDesercionData,
      tutoriaData,
      vulnerabilidadData,
      serviciosData,
      edadDesertores,
      estratoInscritos,
    })
  } catch (err) {
    console.error('Error al obtener estadísticas:', err)
    res.status(500).json({ error: err.message })
  }
}
