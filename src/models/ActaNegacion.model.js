const mongoose = require('mongoose');

const ActaNegacionSchema = new mongoose.Schema({
  nombre_estudiante: { type: String, required: true },
  documento_tipo: { type: String, enum: ['C.C.', 'T.I.'], required: true },
  documento_numero: { type: String, required: true },
  documento_expedido_en: { type: String, required: true },
  estudiante_programa_academico: { type: String, required: true },
  semestre: { type: String, required: true },
  fecha_firma_dia: { type: String, required: true },
  fecha_firma_mes: { type: String, required: true },
  fecha_firma_anio: { type: String, required: true },
  firma_estudiante: { type: String, required: true },
  documento_firma_estudiante: { type: String, required: true },
  docente_permanencia: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActaNegacion', ActaNegacionSchema);
