import mongoose from 'mongoose'

const DatosPermanenciaSchema = new mongoose.Schema({
  estudiante_programa_academico: { type: String, required: true },
  semestre: { type: Number, default: 0 },
  periodo: { type: String },
  inscritos: { type: Number, default: 0 },
  matriculados: { type: Number, default: 0 },
  desertores: { type: Number, default: 0 },
  graduados: { type: Number, default: 0 },
  estrato: { type: Number, default: 0 },
  riesgo_desercion: { type: String },
  tipo_vulnerabilidad: { type: String },
  requiere_tutoria: { type: Boolean, default: false },
  tipo_intervencion: { type: String },
  condicion_socioeconomica: { type: String },
  aprobado: { type: Boolean, default: false },
  cumplimiento_requisitos: { type: Boolean, default: false },
  servicio: { type: String },
  numero_documento: { type: String },
  fecha_remision: { type: String },
  intervencion_recepcion: { type: String },
  intervencion_cedula_titular: { type: String },
  intervencion_estado: { type: String },
  remision_fecha: { type: String },
  remision_tipo: { type: String },
  asistencia_numero: { type: String },
  asistencia_fecha: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('DatosPermanencia', DatosPermanenciaSchema)
