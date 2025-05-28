const mongoose = require("mongoose")

const psicologiaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estudiante",
      required: true,
    },
    motivo_intervencion: {
      type: String,
      required: true,
      enum: [
        "Problemas familiares",
        "Dificultades emocionales",
        "Estrés académico",
        "Ansiedad / depresión",
        "Problemas de adaptación",
        "Otros",
      ],
    },
    tipo_intervencion: {
      type: String,
      required: true,
      enum: ["Asesoría", "Taller", "Otro"],
    },
    fecha_atencion: {
      type: Date,
      required: true,
    },
    seguimiento: {
      type: String,
      maxlength: 255,
    },
    psicologo_asignado: {
      type: String,
      maxlength: 100,
    },
    estado: {
      type: String,
      enum: ["En proceso", "Completado", "Derivado"],
      default: "En proceso",
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
psicologiaSchema.index({ estudiante: 1 })
psicologiaSchema.index({ fecha_atencion: 1 })
psicologiaSchema.index({ motivo_intervencion: 1 })

module.exports = mongoose.model("Psicologia", psicologiaSchema)
