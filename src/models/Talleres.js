const mongoose = require("mongoose")

const talleresSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estudiante",
      required: true,
    },
    nombre_taller: {
      type: String,
      required: true,
      maxlength: 100,
    },
    fecha_taller: {
      type: Date,
      required: true,
    },
    observaciones: {
      type: String,
      maxlength: 255,
    },
    facilitador: {
      type: String,
      maxlength: 100,
    },
    duracion_horas: {
      type: Number,
      min: 1,
      default: 2,
    },
    asistencia: {
      type: Boolean,
      default: true,
    },
    calificacion: {
      type: Number,
      min: 1,
      max: 5,
    },
    estado: {
      type: String,
      enum: ["Programado", "En curso", "Completado", "Cancelado"],
      default: "Programado",
    },
    fecha_registro: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Índices
talleresSchema.index({ estudiante: 1 })
talleresSchema.index({ fecha_taller: 1 })
talleresSchema.index({ nombre_taller: 1 })

module.exports = mongoose.model("Talleres", talleresSchema)
