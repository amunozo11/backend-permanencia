const mongoose = require("mongoose")

const tutoriaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estudiante",
      required: true,
    },
    nivel_riesgo: {
      type: String,
      required: true,
      enum: ["Muy bajo", "Bajo", "Medio", "Alto", "Muy alto"],
    },
    requiere_tutoria: {
      type: Boolean,
      required: true,
      default: true,
    },
    fecha_asignacion: {
      type: Date,
      required: true,
    },
    acciones_apoyo: {
      type: String,
      maxlength: 255,
    },
    tutor_asignado: {
      type: String,
      maxlength: 100,
    },
    estado: {
      type: String,
      enum: ["Activo", "Completado", "Cancelado"],
      default: "Activo",
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
tutoriaSchema.index({ estudiante: 1 })
tutoriaSchema.index({ fecha_asignacion: 1 })
tutoriaSchema.index({ estado: 1 })

module.exports = mongoose.model("Tutoria", tutoriaSchema)
