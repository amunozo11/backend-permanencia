import Notification from '../models/Notification.js'
import mongoose from 'mongoose'

export const obtenerNotificaciones = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id.toString())
        const notificaciones = await Notification.find({ usuario: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()
        res.json({ success: true, data: notificaciones })
    } catch (error) {
        console.error("Error en obtenerNotificaciones:", error.message)
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}

export const contarNoLeidas = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id.toString())
        const count = await Notification.countDocuments({ usuario: userId, leida: false })
        res.json({ success: true, data: { count } })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}

export const marcarLeida = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { leida: true })
        res.json({ success: true, message: 'Notificación marcada como leída' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}

export const marcarTodasLeidas = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id.toString())
        await Notification.updateMany({ usuario: userId, leida: false }, { leida: true })
        res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}
