import Notification from '../models/Notification.js'

export const obtenerNotificaciones = async (req, res) => {
    try {
        const notificaciones = await Notification.find({ usuario: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()

        res.json({ success: true, data: notificaciones })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}

export const contarNoLeidas = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ usuario: req.user.id, leida: false })
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
        await Notification.updateMany({ usuario: req.user.id, leida: false }, { leida: true })
        res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}
