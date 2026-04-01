import mongoose from 'mongoose'

const FichaDocenteSchema = new mongoose.Schema({
  nombres_apellidos: { type: String, required: true },
  documento_identidad: { type: String, required: true },
  fecha_nacimiento_dia: { type: Number, required: true },
  fecha_nacimiento_mes: { type: Number, required: true },
  fecha_nacimiento_ano: { type: Number, required: true },
  direccion_residencia: { type: String, required: true },
  celular: { type: String, required: true },
  correo_institucional: { type: String, required: true },
  correo_personal: { type: String, required: true },
  preferencia_correo: { type: String, enum: ['institucional', 'personal'], required: true },
  facultad: { type: String, required: true },
  estudiante_programa_academico: { type: String, required: true },
  asignaturas: { type: String, required: true },
  creditos_asignaturas: { type: Number, required: true },
  ciclo_formacion: { type: String, required: true },
  pregrado: { type: String, required: true },
  especializacion: { type: String },
  maestria: { type: String },
  doctorado: { type: String },
  grupo_investigacion: { type: String, enum: ['sí', 'no'], required: true },
  cual_grupo: { type: String },
  horas_semanales: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('FichaDocente', FichaDocenteSchema)
