import mongoose from 'mongoose'

const socioeconomicoSchema = new mongoose.Schema(
  {
    estudiante: { type: mongoose.Schema.Types.ObjectId, ref: 'Estudiante', required: true },
    tipo_vulnerabilidad: { type: String, maxlength: 50 },
    observaciones: { type: String, maxlength: 255 },
    monto_apoyo: { type: Number, min: 0 },
    tipo_apoyo: { type: String, enum: ['Beca', 'Auxilio económico', 'Subsidio transporte', 'Material académico', 'Otro'], default: 'Auxilio económico' },
    fecha_solicitud: { type: Date, default: Date.now },
    fecha_aprobacion: { type: Date },
    estado: { type: String, enum: ['Pendiente', 'Aprobado', 'Rechazado', 'Entregado'], default: 'Pendiente' },
    responsable: { type: String, maxlength: 100 },
    fecha_registro: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

socioeconomicoSchema.index({ estudiante: 1 })
socioeconomicoSchema.index({ estado: 1 })
socioeconomicoSchema.index({ fecha_solicitud: 1 })

export default mongoose.model('Socioeconomico', socioeconomicoSchema)
