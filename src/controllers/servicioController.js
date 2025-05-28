const Estudiante = require("../models/Estudiante")
const Tutoria = require("../models/Tutoria")
const Psicologia = require("../models/Psicologia")
const Comedor = require("../models/Comedor")
const Vocacional = require("../models/Vocacional")
const Socioeconomico = require("../models/Socioeconomico")
const Talleres = require("../models/Talleres")
const Seguimiento = require("../models/Seguimiento")

// Función auxiliar para crear o encontrar estudiante
const crearOEncontrarEstudiante = async (datosEstudiante) => {
  try {
    // Buscar estudiante existente por número de documento
    let estudiante = await Estudiante.findOne({
      numero_documento: datosEstudiante.numero_documento,
    })

    if (estudiante) {
      // Actualizar datos del estudiante si ya existe
      estudiante = await Estudiante.findByIdAndUpdate(estudiante._id, datosEstudiante, {
        new: true,
        runValidators: true,
      })
    } else {
      // Crear nuevo estudiante
      estudiante = new Estudiante(datosEstudiante)
      await estudiante.save()
    }

    return estudiante
  } catch (error) {
    throw error
  }
}

// Función auxiliar para validar datos
const validarDatos = (datos, camposRequeridos) => {
  const errores = {}

  camposRequeridos.forEach((campo) => {
    if (!datos[campo] || datos[campo] === "") {
      errores[campo] = `El campo ${campo} es requerido`
    }
  })

  return errores
}

// Controlador para Tutoría (POA)
const registrarTutoria = async (req, res) => {
  try {
    const datos = req.body

    // Validar campos requeridos
    const camposRequeridos = [
      "tipo_documento",
      "numero_documento",
      "nombres",
      "apellidos",
      "correo",
      "programa_academico",
      "semestre",
      "riesgo_desercion",
      "estrato",
      "nivel_riesgo",
      "fecha_asignacion",
    ]

    const errores = validarDatos(datos, camposRequeridos)
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        message: errores,
      })
    }

    // Separar datos del estudiante y del servicio
    const datosEstudiante = {
      tipo_documento: datos.tipo_documento,
      numero_documento: datos.numero_documento,
      nombres: datos.nombres.toUpperCase(),
      apellidos: datos.apellidos.toUpperCase(),
      correo: datos.correo,
      telefono: datos.telefono,
      direccion: datos.direccion,
      programa_academico: datos.programa_academico,
      semestre: Number.parseInt(datos.semestre),
      riesgo_desercion: datos.riesgo_desercion,
      estrato: Number.parseInt(datos.estrato),
    }

    const datosTutoria = {
      nivel_riesgo: datos.nivel_riesgo,
      requiere_tutoria: datos.requiere_tutoria || true,
      fecha_asignacion: new Date(datos.fecha_asignacion),
      acciones_apoyo: datos.acciones_apoyo,
    }

    // Crear o encontrar estudiante
    const estudiante = await crearOEncontrarEstudiante(datosEstudiante)

    // Verificar si ya existe una tutoría activa para este estudiante
    const tutoriaExistente = await Tutoria.findOne({
      estudiante: estudiante._id,
      estado: "Activo",
    })

    if (tutoriaExistente) {
      return res.status(400).json({
        success: false,
        error: "Tutoría duplicada",
        message: "El estudiante ya tiene una tutoría activa",
      })
    }

    // Crear nueva tutoría
    datosTutoria.estudiante = estudiante._id
    const tutoria = new Tutoria(datosTutoria)
    await tutoria.save()

    res.status(201).json({
      success: true,
      message: "Tutoría registrada exitosamente",
      data: {
        estudiante: estudiante,
        tutoria: tutoria,
      },
    })
  } catch (error) {
    console.error("Error al registrar tutoría:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    })
  }
}

// Controlador para Psicología (POPS)
const registrarPsicologia = async (req, res) => {
  try {
    const datos = req.body

    const camposRequeridos = [
      "tipo_documento",
      "numero_documento",
      "nombres",
      "apellidos",
      "correo",
      "programa_academico",
      "semestre",
      "riesgo_desercion",
      "estrato",
      "motivo_intervencion",
      "tipo_intervencion",
      "fecha_atencion",
    ]

    const errores = validarDatos(datos, camposRequeridos)
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        message: errores,
      })
    }

    const datosEstudiante = {
      tipo_documento: datos.tipo_documento,
      numero_documento: datos.numero_documento,
      nombres: datos.nombres.toUpperCase(),
      apellidos: datos.apellidos.toUpperCase(),
      correo: datos.correo,
      telefono: datos.telefono,
      direccion: datos.direccion,
      programa_academico: datos.programa_academico,
      semestre: Number.parseInt(datos.semestre),
      riesgo_desercion: datos.riesgo_desercion,
      estrato: Number.parseInt(datos.estrato),
    }

    const datosPsicologia = {
      motivo_intervencion: datos.motivo_intervencion,
      tipo_intervencion: datos.tipo_intervencion,
      fecha_atencion: new Date(datos.fecha_atencion),
      seguimiento: datos.seguimiento,
    }

    const estudiante = await crearOEncontrarEstudiante(datosEstudiante)

    datosPsicologia.estudiante = estudiante._id
    const psicologia = new Psicologia(datosPsicologia)
    await psicologia.save()

    res.status(201).json({
      success: true,
      message: "Atención psicológica registrada exitosamente",
      data: {
        estudiante: estudiante,
        psicologia: psicologia,
      },
    })
  } catch (error) {
    console.error("Error al registrar psicología:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    })
  }
}

// Controlador para Comedor
const registrarComedor = async (req, res) => {
  try {
    const datos = req.body

    const camposRequeridos = [
      "tipo_documento",
      "numero_documento",
      "nombres",
      "apellidos",
      "correo",
      "programa_academico",
      "semestre",
      "riesgo_desercion",
      "estrato",
      "condicion_socioeconomica",
      "fecha_solicitud",
      "tipo_comida",
      "raciones_asignadas",
    ]

    const errores = validarDatos(datos, camposRequeridos)
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        message: errores,
      })
    }

    const datosEstudiante = {
      tipo_documento: datos.tipo_documento,
      numero_documento: datos.numero_documento,
      nombres: datos.nombres.toUpperCase(),
      apellidos: datos.apellidos.toUpperCase(),
      correo: datos.correo,
      telefono: datos.telefono,
      direccion: datos.direccion,
      programa_academico: datos.programa_academico,
      semestre: Number.parseInt(datos.semestre),
      riesgo_desercion: datos.riesgo_desercion,
      estrato: Number.parseInt(datos.estrato),
    }

    const datosComedor = {
      condicion_socioeconomica: datos.condicion_socioeconomica,
      fecha_solicitud: new Date(datos.fecha_solicitud),
      aprobado: Boolean(datos.aprobado),
      tipo_comida: datos.tipo_comida,
      raciones_asignadas: Number.parseInt(datos.raciones_asignadas),
      observaciones: datos.observaciones,
    }

    const estudiante = await crearOEncontrarEstudiante(datosEstudiante)

    // Verificar si ya existe una solicitud activa
    const comedorExistente = await Comedor.findOne({
      estudiante: estudiante._id,
      estado: { $in: ["Pendiente", "Aprobado", "Activo"] },
    })

    if (comedorExistente) {
      return res.status(400).json({
        success: false,
        error: "Solicitud duplicada",
        message: "El estudiante ya tiene una solicitud de comedor activa",
      })
    }

    datosComedor.estudiante = estudiante._id
    datosComedor.estado = datosComedor.aprobado ? "Aprobado" : "Pendiente"

    const comedor = new Comedor(datosComedor)
    await comedor.save()

    res.status(201).json({
      success: true,
      message: "Solicitud de comedor registrada exitosamente",
      data: {
        estudiante: estudiante,
        comedor: comedor,
      },
    })
  } catch (error) {
    console.error("Error al registrar comedor:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    })
  }
}

// Controlador para Orientación Vocacional (POVAU)
const registrarVocacional = async (req, res) => {
  try {
    const datos = req.body

    const camposRequeridos = [
      "tipo_documento",
      "numero_documento",
      "nombres",
      "apellidos",
      "correo",
      "programa_academico",
      "semestre",
      "riesgo_desercion",
      "estrato",
      "tipo_participante",
      "riesgo_spadies",
      "fecha_ingreso_programa",
    ]

    const errores = validarDatos(datos, camposRequeridos)
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        message: errores,
      })
    }

    const datosEstudiante = {
      tipo_documento: datos.tipo_documento,
      numero_documento: datos.numero_documento,
      nombres: datos.nombres.toUpperCase(),
      apellidos: datos.apellidos.toUpperCase(),
      correo: datos.correo,
      telefono: datos.telefono,
      direccion: datos.direccion,
      programa_academico: datos.programa_academico,
      semestre: Number.parseInt(datos.semestre),
      riesgo_desercion: datos.riesgo_desercion,
      estrato: Number.parseInt(datos.estrato),
    }

    const datosVocacional = {
      tipo_participante: datos.tipo_participante,
      riesgo_spadies: datos.riesgo_spadies,
      fecha_ingreso_programa: new Date(datos.fecha_ingreso_programa),
      observaciones: datos.observaciones,
    }

    const estudiante = await crearOEncontrarEstudiante(datosEstudiante)

    datosVocacional.estudiante = estudiante._id
    const vocacional = new Vocacional(datosVocacional)
    await vocacional.save()

    res.status(201).json({
      success: true,
      message: "Orientación vocacional registrada exitosamente",
      data: {
        estudiante: estudiante,
        vocacional: vocacional,
      },
    })
  } catch (error) {
    console.error("Error al registrar orientación vocacional:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    })
  }
}

// Controlador para Apoyo Socioeconómico
const registrarSocioeconomico = async (req, res) => {
  try {
    const datos = req.body

    const camposRequeridos = [
      "tipo_documento",
      "numero_documento",
      "nombres",
      "apellidos",
      "correo",
      "programa_academico",
      "semestre",
      "riesgo_desercion",
      "estrato",
    ]

    const errores = validarDatos(datos, camposRequeridos)
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        message: errores,
      })
    }

    const datosEstudiante = {
      tipo_documento: datos.tipo_documento,
      numero_documento: datos.numero_documento,
      nombres: datos.nombres.toUpperCase(),
      apellidos: datos.apellidos.toUpperCase(),
      correo: datos.correo,
      telefono: datos.telefono,
      direccion: datos.direccion,
      programa_academico: datos.programa_academico,
      semestre: Number.parseInt(datos.semestre),
      riesgo_desercion: datos.riesgo_desercion,
      estrato: Number.parseInt(datos.estrato),
    }

    const datosSocioeconomico = {
      tipo_vulnerabilidad: datos.tipo_vulnerabilidad,
      observaciones: datos.observaciones,
    }

    const estudiante = await crearOEncontrarEstudiante(datosEstudiante)

    datosSocioeconomico.estudiante = estudiante._id
    const socioeconomico = new Socioeconomico(datosSocioeconomico)
    await socioeconomico.save()

    res.status(201).json({
      success: true,
      message: "Apoyo socioeconómico registrado exitosamente",
      data: {
        estudiante: estudiante,
        socioeconomico: socioeconomico,
      },
    })
  } catch (error) {
    console.error("Error al registrar apoyo socioeconómico:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    })
  }
}

// Controlador para Talleres
const registrarTalleres = async (req, res) => {
  try {
    const datos = req.body

    const camposRequeridos = [
      "tipo_documento",
      "numero_documento",
      "nombres",
      "apellidos",
      "correo",
      "programa_academico",
      "semestre",
      "riesgo_desercion",
      "estrato",
      "nombre_taller",
      "fecha_taller",
    ]

    const errores = validarDatos(datos, camposRequeridos)
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        message: errores,
      })
    }

    const datosEstudiante = {
      tipo_documento: datos.tipo_documento,
      numero_documento: datos.numero_documento,
      nombres: datos.nombres.toUpperCase(),
      apellidos: datos.apellidos.toUpperCase(),
      correo: datos.correo,
      telefono: datos.telefono,
      direccion: datos.direccion,
      programa_academico: datos.programa_academico,
      semestre: Number.parseInt(datos.semestre),
      riesgo_desercion: datos.riesgo_desercion,
      estrato: Number.parseInt(datos.estrato),
    }

    const datosTalleres = {
      nombre_taller: datos.nombre_taller,
      fecha_taller: new Date(datos.fecha_taller),
      observaciones: datos.observaciones,
    }

    const estudiante = await crearOEncontrarEstudiante(datosEstudiante)

    datosTalleres.estudiante = estudiante._id
    const taller = new Talleres(datosTalleres)
    await taller.save()

    res.status(201).json({
      success: true,
      message: "Taller registrado exitosamente",
      data: {
        estudiante: estudiante,
        taller: taller,
      },
    })
  } catch (error) {
    console.error("Error al registrar taller:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    })
  }
}

// Controlador para Seguimiento
const registrarSeguimiento = async (req, res) => {
  try {
    const datos = req.body

    const camposRequeridos = [
      "tipo_documento",
      "numero_documento",
      "nombres",
      "apellidos",
      "correo",
      "programa_academico",
      "semestre",
      "riesgo_desercion",
      "estrato",
      "estado_participacion",
      "observaciones_permanencia",
    ]

    const errores = validarDatos(datos, camposRequeridos)
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        message: errores,
      })
    }

    const datosEstudiante = {
      tipo_documento: datos.tipo_documento,
      numero_documento: datos.numero_documento,
      nombres: datos.nombres.toUpperCase(),
      apellidos: datos.apellidos.toUpperCase(),
      correo: datos.correo,
      telefono: datos.telefono,
      direccion: datos.direccion,
      programa_academico: datos.programa_academico,
      semestre: Number.parseInt(datos.semestre),
      riesgo_desercion: datos.riesgo_desercion,
      estrato: Number.parseInt(datos.estrato),
    }

    const datosSeguimiento = {
      estado_participacion: datos.estado_participacion,
      observaciones_permanencia: datos.observaciones_permanencia,
    }

    const estudiante = await crearOEncontrarEstudiante(datosEstudiante)

    datosSeguimiento.estudiante = estudiante._id
    const seguimiento = new Seguimiento(datosSeguimiento)
    await seguimiento.save()

    res.status(201).json({
      success: true,
      message: "Seguimiento registrado exitosamente",
      data: {
        estudiante: estudiante,
        seguimiento: seguimiento,
      },
    })
  } catch (error) {
    console.error("Error al registrar seguimiento:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    })
  }
}

// Función para obtener todos los estudiantes con sus servicios
const obtenerEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Estudiante.find({ activo: true })
      .populate("tutoria")
      .populate("psicologia")
      .populate("comedor")
      .populate("vocacional")
      .populate("socioeconomico")
      .populate("talleres")
      .populate("seguimiento")
      .sort({ fecha_registro: -1 })

    res.status(200).json({
      success: true,
      data: estudiantes,
      total: estudiantes.length,
    })
  } catch (error) {
    console.error("Error al obtener estudiantes:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    })
  }
}

module.exports = {
  registrarTutoria,
  registrarPsicologia,
  registrarComedor,
  registrarVocacional,
  registrarSocioeconomico,
  registrarTalleres,
  registrarSeguimiento,
  obtenerEstudiantes,
}
