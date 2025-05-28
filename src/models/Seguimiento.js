const mongoose = require("mongoose")

const seguimientoSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estudiante",
      required: true,
    },
    estado_participacion: {
      type: String,
      required: true,
      enum: ["Activo", "Inactivo", "Finalizado"],
    },
    observaciones_permanencia: {
      type: String,
      required: true,
      maxlength: 200,
    },
    promedio_academico: {
      type: Number,
      min: 0,
      max: 5,
    },
    materias_perdidas: {
      type: Number,
      min: 0,
      default: 0,
    },
    fecha_seguimiento: {
      type: Date,
      default: Date.now,
    },
    responsable_seguimiento: {
      type: String,
      maxlength: 100,
    },
    recomendaciones: {
      type: String,
      maxlength: 300,
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
seguimientoSchema.index({ estudiante: 1 })
seguimientoSchema.index({ estado_participacion: 1 })
seguimientoSchema.index({ fecha_seguimiento: 1 })

module.exports = mongoose.model("Seguimiento", seguimientoSchema)
