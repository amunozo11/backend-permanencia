import mongoose from 'mongoose'

const SoftwareSolicitudSchema = new mongoose.Schema({
  docente_tutor: { type: String, required: true },
  facultad: { type: String, required: true },
  estudiante_programa_academico: { type: String, required: true },
  nombre_asignatura: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('SoftwareSolicitud', SoftwareSolicitudSchema)
