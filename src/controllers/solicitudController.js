import Solicitud from '../models/Solicitud.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { getIO } from '../config/socket.js'

// Labels legibles para los tipos de solicitud
const tipoLabels = {
    acta_negacion: 'Acta de Negación',
    asistencia_actividad: 'Asistencia a Actividad',
    ficha_docente: 'Ficha Docente',
    intervencion_grupal: 'Intervención Grupal',
    remision_psicologica: 'Remisión Psicológica',
    software_solicitud: 'Solicitud Software',
    software_estudiante: 'Estudiante Software',
    tutoria: 'Tutoría (POA)',
    psicologia: 'Atención Psicológica (POPS)',
    socioeconomico: 'Apoyo Socioeconómico',
    vocacional: 'Orientación Vocacional (POVAU)',
    talleres: 'Talleres de Habilidades',
    seguimiento: 'Seguimiento Académico',
    comedor: 'Comedor Universitario',
    software: 'Software Educativo',
    otro: 'Otro',
}

const estadoLabels = {
    pendiente: 'Pendiente',
    recibida: 'Recibida',
    en_proceso: 'En Proceso',
    completada: 'Completada',
    rechazada: 'Rechazada',
    aprobada: 'Aprobada',
    en_revision: 'En Revisión',
}

// Estudiante crea solicitud
export const crearSolicitud = async (req, res) => {
    try {
        const { tipo, datos } = req.body

        if (!tipo || !datos) {
            return res.status(400).json({ success: false, message: 'Tipo y datos son requeridos' })
        }

        const solicitud = new Solicitud({
            usuario: req.user.id,
            tipo,
            datos,
            descripcion: datos.descripcion || 'Sin descripción',
            historial_estados: [{ estado: 'pendiente', comentario: 'Solicitud creada' }],
        })

        await solicitud.save()

        const solicitudCompleta = await Solicitud.findById(solicitud._id).populate('usuario', 'nombre apellidos email')
        const io = getIO()
        if (io) {
            io.emit('nueva_solicitud', solicitudCompleta)
        }

        // Notificar a todos los admins
        const admins = await User.find({ role: 'admin', activo: true })
        const user = await User.findById(req.user.id)

        for (const admin of admins) {
            await Notification.create({
                usuario: admin._id,
                titulo: 'Nueva solicitud recibida',
                mensaje: `${user.nombre} ${user.apellidos} ha enviado una solicitud de ${tipoLabels[tipo] || tipo}`,
                tipo: 'solicitud_nueva',
                enlace: `/admin/solicitudes`,
                referencia: solicitud._id,
            })
        }

        res.status(201).json({
            success: true,
            message: 'Solicitud enviada exitosamente',
            data: solicitud,
        })
    } catch (error) {
        console.error('Error al crear solicitud:', error)
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}

// Estudiante ve SUS solicitudes
export const misSolicitudes = async (req, res) => {
    try {
        const solicitudes = await Solicitud.find({ usuario: req.user.id })
            .sort({ createdAt: -1 })
            .lean()

        res.json({ success: true, data: solicitudes })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}

// Admin ve TODAS las solicitudes
export const todasSolicitudes = async (req, res) => {
    try {
        const { estado, tipo } = req.query
        const filter = {}
        if (estado) filter.estado = estado
        if (tipo) filter.tipo = tipo

        const solicitudes = await Solicitud.find(filter)
            .populate('usuario', 'nombre apellidos email')
            .sort({ createdAt: -1 })
            .lean()

        res.json({ success: true, data: solicitudes })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}

// Obtener una solicitud por ID
export const obtenerSolicitud = async (req, res) => {
    try {
        const solicitud = await Solicitud.findById(req.params.id)
            .populate('usuario', 'nombre apellidos email')

        if (!solicitud) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
        }

        // Verificar permisos: admin ve todo, estudiante solo las suyas
        if (req.user.role !== 'admin' && solicitud.usuario._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'No autorizado' })
        }

        res.json({ success: true, data: solicitud })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}

// Admin actualiza estado
export const actualizarEstado = async (req, res) => {
    try {
        const { estado, observacionesAdmin, observaciones_admin, documento } = req.body
        const finalObservaciones = observacionesAdmin || observaciones_admin

        if (!estado) {
            return res.status(400).json({ success: false, message: 'Estado es requerido' })
        }

        const solicitud = await Solicitud.findById(req.params.id)
        if (!solicitud) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' })
        }

        solicitud.estado = estado
        if (finalObservaciones) solicitud.observaciones_admin = finalObservaciones
        if (typeof documento === 'boolean') solicitud.documento = documento

        solicitud.historial_estados.push({
            estado,
            comentario: finalObservaciones || `Estado actualizado a ${estadoLabels[estado]}`,
            documento: typeof documento === 'boolean' ? documento : (solicitud.documento || false),
        })

        await solicitud.save()

        const solicitudPopulated = await Solicitud.findById(solicitud._id).populate('usuario', 'nombre apellidos email')
        const io = getIO()
        if (io) {
            io.emit('solicitud_actualizada', solicitudPopulated)
        }

        // Notificar al estudiante
        await Notification.create({
            usuario: solicitud.usuario,
            titulo: `Solicitud ${estadoLabels[estado]}`,
            mensaje: `Tu solicitud de ${tipoLabels[solicitud.tipo] || solicitud.tipo} ha sido actualizada a: ${estadoLabels[estado]}${finalObservaciones ? '. Observaciones: ' + finalObservaciones : ''}`,
            tipo: (estado === 'completada' || estado === 'aprobada') ? 'aprobado' : estado === 'rechazada' ? 'rechazado' : 'estado_actualizado',
            enlace: `/estudiante/solicitudes`,
            referencia: solicitud._id,
        })

        res.json({
            success: true,
            message: `Estado actualizado a ${estadoLabels[estado]}`,
            data: solicitud,
        })
    } catch (error) {
        console.error('Error al actualizar estado:', error)
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}
