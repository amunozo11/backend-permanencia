const mongoose = require("mongoose")

const vocacionalSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estudiante",
      required: true,
    },
    tipo_participante: {
      type: String,
      required: true,
      enum: ["Admitido", "Nuevo", "Media académica"],
    },
    riesgo_spadies: {
      type: String,
      required: true,
      enum: ["Bajo", "Medio", "Alto"],
    },
    fecha_ingreso_programa: {
      type: Date,
      required: true,
    },
    observaciones: {
      type: String,
      maxlength: 255,
    },
    orientador_asignado: {
      type: String,
      maxlength: 100,
    },
    estado: {
      type: String,
      enum: ["Activo", "Completado", "En seguimiento"],
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
vocacionalSchema.index({ estudiante: 1 })
vocacionalSchema.index({ tipo_participante: 1 })
vocacionalSchema.index({ riesgo_spadies: 1 })

module.exports = mongoose.model("Vocacional", vocacionalSchema)
