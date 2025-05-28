const mongoose = require("mongoose")

const comedorSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estudiante",
      required: true,
    },
    condicion_socioeconomica: {
      type: String,
      required: true,
      maxlength: 100,
    },
    fecha_solicitud: {
      type: Date,
      required: true,
    },
    aprobado: {
      type: Boolean,
      required: true,
      default: false,
    },
    tipo_comida: {
      type: String,
      required: true,
      enum: ["Almuerzo"],
      default: "Almuerzo",
    },
    raciones_asignadas: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    observaciones: {
      type: String,
      maxlength: 255,
    },
    fecha_inicio_beneficio: {
      type: Date,
    },
    fecha_fin_beneficio: {
      type: Date,
    },
    estado: {
      type: String,
      enum: ["Pendiente", "Aprobado", "Rechazado", "Activo", "Finalizado"],
      default: "Pendiente",
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
comedorSchema.index({ estudiante: 1 })
comedorSchema.index({ fecha_solicitud: 1 })
comedorSchema.index({ estado: 1 })
comedorSchema.index({ aprobado: 1 })

module.exports = mongoose.model("Comedor", comedorSchema)
