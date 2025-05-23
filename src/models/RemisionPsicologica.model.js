const mongoose = require('mongoose');

const RemisionPsicologicaSchema = new mongoose.Schema({
  nombre_estudiante: { type: String, required: true },
  numero_documento: { type: String, required: true },
  estudiante_programa_academico_academico: { type: String, required: true },
  semestre: { type: Number, required: true },
  motivo_remision: { type: String, required: true },
  docente_remite: { type: String, required: true },
  correo_docente: { type: String, required: true },
  telefono_docente: { type: String, required: true },
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  tipo_remision: { type: String, required: true },
  observaciones: { type: String }
});

module.exports = mongoose.model('RemisionPsicologica', RemisionPsicologicaSchema);
