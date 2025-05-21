const mongoose = require('mongoose');

const AsistenciaActividadSchema = new mongoose.Schema({
  nombre_estudiante: { type: String, required: true },
  numero_documento: { type: String, required: true },
  programa_academico: { type: String, required: true },
  semestre: { type: Number, required: true },
  nombre_actividad: { type: String, required: true },
  modalidad: { type: String, required: true },
  tipo_actividad: { type: String, required: true },
  fecha_actividad: { type: Date, required: true },
  hora_inicio: { type: String, required: true },
  hora_fin: { type: String, required: true },
  modalidad_registro: { type: String, required: true },
  observaciones: { type: String }
});

module.exports = mongoose.model('AsistenciaActividad', AsistenciaActividadSchema);