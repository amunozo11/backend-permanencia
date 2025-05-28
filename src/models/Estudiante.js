const mongoose = require("mongoose")

const estudianteSchema = new mongoose.Schema(
  {
    tipo_documento: {
      type: String,
      required: true,
      enum: ["CC", "TI", "CE", "Pasaporte"],
    },
    numero_documento1: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{7,10}$/,
    },
    nombres: {
      type: String,
      required: true,
      maxlength: 50,
      uppercase: true,
      match: /^[A-ZÁÉÍÓÚÑ ]{2,50}$/,
    },
    apellidos: {
      type: String,
      required: true,
      maxlength: 50,
      uppercase: true,
      match: /^[A-ZÁÉÍÓÚÑ ]{2,50}$/,
    },
    correo1: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
      match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    telefono: {
      type: String,
      maxlength: 10,
      match: /^3\d{9}$/,
    },
    direccion: {
      type: String,
      maxlength: 100,
    },
    programa_academico: {
      type: String,
      required: true,
      enum: [
        "ADMINISTRACIÓN DE EMPRESAS",
        "ADMINISTRACIÓN DE EMPRESAS TURÍSTICAS Y HOTELERAS",
        "COMERCIO INTERNACIONAL",
        "CONTADURÍA PÚBLICA",
        "DERECHO",
        "ECONOMÍA",
        "ENFERMERÍA",
        "INGENIERÍA AGROINDUSTRIAL",
        "INGENIERIA AMBIENTAL Y SANITARIA",
        "INGENIERÍA ELECTRÓNICA",
        "INGENIERÍA DE SISTEMAS",
        "INSTRUMENTACIÓN QUIRÚRGICA",
        "LICENCIATURA EN ARTE Y FOLCLOR",
        "LICENCIATURA EN CIENCIAS NATURALES Y EDUCACIÓN AMBIENTAL",
        "LICENCIATURA EN EDUCACIÓN FISICA, RECREACIÓN Y DEPORTES",
        "LICENCIATURA EN LENGUA CASTELLANA E INGLÉS",
        "LICENCIATURA EN MATEMÁTICAS",
        "MICROBIOLOGÍA",
        "SOCIOLOGÍA",
      ],
    },
    semestre: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    riesgo_desercion: {
      type: String,
      required: true,
      enum: ["Muy bajo", "Bajo", "Medio", "Alto", "Muy alto"],
    },
    estrato: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    fecha_registro: {
      type: Date,
      default: Date.now,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Índices para mejorar el rendimiento
estudianteSchema.index({ numero_documento1: 1 })
estudianteSchema.index({ correo1: 1 })
estudianteSchema.index({ programa_academico: 1 })
estudianteSchema.index({ riesgo_desercion: 1 })

module.exports = mongoose.model("Estudiante", estudianteSchema)
