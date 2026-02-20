import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'

// Routes
import authRoutes from './routes/auth.routes.js'
import solicitudRoutes from './routes/solicitud.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import csvUploadRoutes from './routes/csvUpload.routes.js'
import servicioRoutes from './routes/servicioRoutes.js'
import actaNegacionRoutes from './routes/actaNegacion.routes.js'
import asistenciaActividadRoutes from './routes/asistenciaActividad.routes.js'
import fichaDocenteRoutes from './routes/fichaDocente.routes.js'
import grupalSolicitudRoutes from './routes/grupalSolicitud.routes.js'
import remisionPsicologicaRoutes from './routes/remisionPsicologica.routes.js'
import softwareEstudianteRoutes from './routes/softwareEstudiante.routes.js'
import softwareSolicitudRoutes from './routes/softwareSolicitud.routes.js'

// Middleware
import { authMiddleware, requireRole } from './middleware/auth.js'

const app = express()

// Conectar a MongoDB
connectDB()

// Middleware global
app.use(cors())
app.use(express.json())

// Logger simple para depuración
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`)
    next()
})


// Health check (Public)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ──── Rutas públicas ────
app.use('/api/auth', authRoutes)

// ──── Rutas protegidas (autenticación requerida) ────
app.use('/api/solicitudes', authMiddleware, solicitudRoutes)
app.use('/api/notificaciones', authMiddleware, notificationRoutes)

// ──── Rutas de admin (autenticación + rol admin) ────
// Prefijo específico para evitar colisiones
const adminRouter = express.Router()
adminRouter.use(authMiddleware, requireRole('admin'))

app.use('/api/admin', adminRouter) // Para subidas de CSV y otros
adminRouter.use('/upload', csvUploadRoutes)
adminRouter.use('/servicios', servicioRoutes)
adminRouter.use('/acta-negacion', actaNegacionRoutes)
adminRouter.use('/asistencia-actividad', asistenciaActividadRoutes)
adminRouter.use('/ficha-docente', fichaDocenteRoutes)
adminRouter.use('/grupal-solicitud', grupalSolicitudRoutes)
adminRouter.use('/remision-psicologica', remisionPsicologicaRoutes)
adminRouter.use('/software-estudiante', softwareEstudianteRoutes)
adminRouter.use('/software-solicitud', softwareSolicitudRoutes)


export default app
