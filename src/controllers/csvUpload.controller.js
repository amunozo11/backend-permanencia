const multer = require("multer")
const csv = require("csv-parser")
const fs = require("fs")
const DatosPermanencia = require("../models/DatosPermanencia.model")

// Configuración de multer (almacena el archivo en /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegurarse de que el directorio existe
    if (!fs.existsSync("uploads/")) {
      fs.mkdirSync("uploads/")
    }
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
})

const upload = multer({ storage })

// Middleware para express
exports.uploadCsv = upload.single("file")

// Procesar datos del CSV
const processCSVData = (csvData) => {
  if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
    return []
  }

  // Procesar cada fila del CSV
  return csvData.map((row) => {
    // Mapear los campos del CSV a los campos del modelo
    // Convertir campos numéricos
    const semestre = Number.parseInt(row.estudiante_semestre || 0)
    const estrato = Number.parseInt(row.estudiante_estrato || 0)

    // Extraer valores de inscritos, matriculados, desertores, graduados
    // Si no existen, intentamos usar campos relacionados o establecemos en 0
    const inscritos = row.inscritos
      ? Number.parseInt(row.inscritos)
      : row.RegistroBeneficio_estado_solicitud === "True"
        ? 1
        : 0

    const matriculados = row.matriculados
      ? Number.parseInt(row.matriculados)
      : row.RegistroBeneficio_periodo_academico_beneficiado
        ? 1
        : 0

    const desertores = row.desertores
      ? Number.parseInt(row.desertores)
      : row.estudiante_riesgo_desercion === "Alto" || row.estudiante_riesgo_desercion === "Muy Alto"
        ? 1
        : 0

    const graduados = row.graduados ? Number.parseInt(row.graduados) : 0

    // Normalizar valores booleanos
    const requiereTutoria = row.tipo_remision === "Tutorias" || row.POA_nombre_asignatura || row.POA_fecha

    const aprobado = row.ComedorUniversitario_aprobado === "True" || row.RegistroBeneficio_estado_solicitud === "True"

    const cumplimientoRequisitos = row.RegistroBeneficio_estado_solicitud === "True"

    // Determinar el periodo si no existe
    const periodo = row.RegistroBeneficio_periodo_academico_beneficiado || row.periodo || "2020-1" // Valor por defecto

    // Determinar el servicio basado en los campos disponibles
    let servicio = ""
    if (row.tipo_remision === "Tutorias") servicio = "POA"
    else if (row.RemisionPsicologica_tipo_remision) servicio = "POPS"
    else if (row.ComedorUniversitario_condicion_socioeconomica) servicio = "Comedor"
    else if (row.POVAU_tipo_participante) servicio = "POVAU"
    else if (row.IntervencionGrupal_estado_solicitud) servicio = "Intervención Grupal"
    else if (row.SolicitudAtencionIndividual_motivo_atencion) servicio = "Atención Individual"

    // Determinar el tipo de vulnerabilidad
    const tipoVulnerabilidad = row.estudiante_tipo_vulnerabilidad || ""

    // Determinar el riesgo de deserción
    const riesgoDesercion = row.estudiante_riesgo_desercion || ""

    // Retornar objeto normalizado
    return {
      estudiante_programa_academico: row.estudiante_programa_academico || "",
      semestre,
      periodo: row.RegistroBeneficio_periodo_academico_beneficiado || "2020-1",
      inscritos,
      matriculados: parseInt(row.matriculados || 0),
      desertores: parseInt(row.desertores || 0),
      graduados: parseInt(row.graduados || 0),
      estrato,
      riesgo_desercion: row.estudiante_riesgo_desercion || "",
      tipo_vulnerabilidad: row.estudiante_tipo_vulnerabilidad || "",
      requiere_tutoria: Boolean(row.POVAU_tipo_participante),
      tipo_intervencion: row.RemisionPsicologica_tipo_remision
        ? "Psicológica"
        : row.IntervencionGrupal_estado_solicitud
          ? "Grupal"
          : "",
      condicion_socioeconomica: row.ComedorUniversitario_condicion_socioeconomica || "",
      aprobado: row.ComedorUniversitario_aprobado === "True",
      cumplimiento_requisitos: row.RegistroBeneficio_estado_solicitud === "True",
      servicio: servicio,
      numero_documento: row.estudiante_numero_documento || "",
      fecha_remision: row.RemisionPsicologica_fecha_remision || row.fecha_remision || "",
      // Aquí los campos nuevos:
      intervencion_recepcion: row.IntervencionGrupal_fecha_solicitud || "",
      intervencion_cedula_titular: row.IntervencionGrupal_cedula_titular || "",
      intervencion_estado: row.IntervencionGrupal_estado_solicitud || "",
      remision_fecha: row.RemisionPsicologica_fecha_remision || "",
      remision_tipo: row.RemisionPsicologica_tipo_remision || "",
      asistencia_numero: row.FormatoAsistencia_numero_asistencia || "",
      asistencia_fecha: row.FormatoAsistencia_fecha || "",
    }
  })
}

// Lógica de parseo y guardado
exports.processCsv = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Archivo no enviado" })

  const results = []
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", data => results.push(data))
    .on("end", async () => {
      try {
        // mapeo completo incluyendo los nuevos campos
        const processedData = processCSVData(results.filter(r => Object.keys(r).length > 1))
        await DatosPermanencia.deleteMany({})
        const docs = await DatosPermanencia.insertMany(processedData)
        fs.unlinkSync(req.file.path)
        res.json({ success: true, inserted: docs.length })
      } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
      }
    })
}

// Obtener todos los datos de permanencia
exports.getAllData = async (req, res) => {
  try {
    const data = await DatosPermanencia.find()
    res.json(data)
  } catch (err) {
    console.error("Error al obtener datos:", err)
    res.status(500).json({ error: err.message })
  }
}

// Obtener estadísticas calculadas
exports.getStats = async (req, res) => {
  try {
    const data = await DatosPermanencia.find()

    // Calcular totales
    const totals = {
      inscritos: data.reduce((sum, item) => sum + (item.inscritos || 0), 0),
      matriculados: data.reduce((sum, item) => sum + (item.matriculados || 0), 0),
      desertores: data.reduce((sum, item) => sum + (item.desertores || 0), 0),
      graduados: data.reduce((sum, item) => sum + (item.graduados || 0), 0),
    }

    // Agrupar por programa
    const programaStats = {}
    data.forEach((item) => {
      if (!programaStats[item.programa]) {
        programaStats[item.programa] = {
          programa: item.programa,
          total: 0,
          riesgoAlto: 0,
          riesgoMedio: 0,
          riesgoBajo: 0,
        }
      }

      programaStats[item.programa].total += 1

      if (item.riesgo_desercion === "Alto" || item.riesgo_desercion === "Muy Alto") {
        programaStats[item.programa].riesgoAlto += 1
      } else if (item.riesgo_desercion === "Medio") {
        programaStats[item.programa].riesgoMedio += 1
      } else if (item.riesgo_desercion === "Bajo" || item.riesgo_desercion === "Muy bajo") {
        programaStats[item.programa].riesgoBajo += 1
      }
    })

    // Riesgo de deserción
    const riesgos = {}
    data.forEach((item) => {
      if (item.riesgo_desercion) {
        if (!riesgos[item.riesgo_desercion]) {
          riesgos[item.riesgo_desercion] = 0
        }
        riesgos[item.riesgo_desercion] += 1
      }
    })
    const riesgoDesercionData = Object.entries(riesgos).map(([riesgo, cantidad]) => ({
      riesgo,
      cantidad,
    }))

    // Tutoría
    let requiereTutoria = 0
    let noRequiereTutoria = 0
    data.forEach((item) => {
      if (item.requiere_tutoria) {
        requiereTutoria += 1
      } else {
        noRequiereTutoria += 1
      }
    })
    const tutoriaData = [
      { name: "Requiere tutoría", value: requiereTutoria },
      { name: "No requiere tutoría", value: noRequiereTutoria },
    ]

    // Vulnerabilidad
    const vulnerabilidades = {}
    data.forEach((item) => {
      if (item.tipo_vulnerabilidad) {
        if (!vulnerabilidades[item.tipo_vulnerabilidad]) {
          vulnerabilidades[item.tipo_vulnerabilidad] = 0
        }
        vulnerabilidades[item.tipo_vulnerabilidad] += 1
      }
    })
    const vulnerabilidadData = Object.entries(vulnerabilidades).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
    }))

    // Servicios
    const servicios = {}
    data.forEach((item) => {
      if (item.servicio) {
        if (!servicios[item.servicio]) {
          servicios[item.servicio] = 0
        }
        servicios[item.servicio] += 1
      }
    })
    const serviciosData = Object.entries(servicios).map(([servicio, cantidad]) => ({
      servicio,
      cantidad,
    }))

    // Estrato vs Riesgo
    const estratoRiesgo = {}
    data.forEach((item) => {
      if (item.estrato && (item.riesgo_desercion === "Alto" || item.riesgo_desercion === "Muy Alto")) {
        const estrato = item.estrato.toString()
        if (!estratoRiesgo[estrato]) {
          estratoRiesgo[estrato] = 0
        }
        estratoRiesgo[estrato] += 1
      }
    })
    const edadDesertores = Object.entries(estratoRiesgo).map(([estrato, cantidad]) => ({
      estrato: Number(estrato),
      desertores: cantidad,
    }))

    // Estrato vs Inscritos
    const estratoCount = {}
    data.forEach((item) => {
      if (item.estrato) {
        const estrato = item.estrato.toString()
        if (!estratoCount[estrato]) {
          estratoCount[estrato] = 0
        }
        estratoCount[estrato] += 1
      }
    })
    const estratoInscritos = Object.entries(estratoCount).map(([estrato, cantidad]) => ({
      estrato: Number(estrato),
      inscritos: cantidad,
    }))

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
    console.error("Error al obtener estadísticas:", err)
    res.status(500).json({ error: err.message })
  }
}
