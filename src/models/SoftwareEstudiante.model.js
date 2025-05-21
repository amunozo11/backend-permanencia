const mongoose = require('mongoose');

const SoftwareEstudianteSchema = new mongoose.Schema({
  solicitud_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SoftwareSolicitud', required: true },
  numero_identificacion: { type: String, required: true },
  nombre_estudiante: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
  semestre: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoftwareEstudiante', SoftwareEstudianteSchema);