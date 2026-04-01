import mongoose from 'mongoose'

const GrupalSolicitudSchema = new mongoose.Schema({
  fecha_solicitud: { type: Date, required: true },
  nombre_docente_permanencia: { type: String, required: true },
  celular_permanencia: { type: String, required: true },
  correo_permanencia: { type: String, required: true },
  estudiante_programa_academico_permanencia: { type: String, required: true },
  tipo_poblacion: { type: String, required: true },
  nombre_docente_asignatura: { type: String, required: true },
  celular_docente_asignatura: { type: String, required: true },
  correo_docente_asignatura: { type: String, required: true },
  estudiante_programa_academico_docente_asignatura: { type: String, required: true },
  asignatura_intervenir: { type: String, required: true },
  grupo: { type: Number, required: true },
  semestre: { type: Number, required: true },
  numero_estudiantes: { type: Number, required: true },
  tematica_sugerida: { type: String },
  fecha_estudiante_programa_academicoda: { type: Date, required: true },
  hora: { type: String, required: true },
  aula: { type: String, required: true },
  bloque: { type: String, required: true },
  sede: { type: String, required: true },
  estado: { type: String, enum: ['se hizo', 'no se hizo', 'espera', 'sin disponibilidad de tallerista'], required: true },
  motivo: { type: String },
})

export default mongoose.model('GrupalSolicitud', GrupalSolicitudSchema)
