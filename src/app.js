const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Rutas
const csvUploadRoutes = require('./routes/csvUpload.routes');
const softwareSolicitudRoutes = require('./routes/softwareSolicitud.routes');
const softwareEstudianteRoutes = require('./routes/softwareEstudiante.routes');
const grupalSolicitudRoutes = require('./routes/grupalSolicitud.routes');
const actaNegacionRoutes = require('./routes/actaNegacion.routes');
const fichaDocenteRoutes = require('./routes/fichaDocente.routes');
const remisionPsicologicaRoutes = require('./routes/remisionPsicologica.routes');
const asistenciaActividadRoutes = require('./routes/asistenciaActividad.routes');

// Conexión DB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Prefijos de rutas
app.use('/api', csvUploadRoutes);
app.use('/api/software-solicitudes', softwareSolicitudRoutes);
app.use('/api/software-estudiantes', softwareEstudianteRoutes);
app.use('/api/intervenciones-grupales', grupalSolicitudRoutes);
app.use('/api/actas-negacion', actaNegacionRoutes);
app.use('/api/fichas-docente', fichaDocenteRoutes);
app.use('/api/remisiones-psicologicas', remisionPsicologicaRoutes);
app.use('/api/asistencias-actividades', asistenciaActividadRoutes);

module.exports = app;
