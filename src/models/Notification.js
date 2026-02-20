import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        titulo: {
            type: String,
            required: true,
            maxlength: 150,
        },
        mensaje: {
            type: String,
            required: true,
            maxlength: 500,
        },
        tipo: {
            type: String,
            enum: ['solicitud_nueva', 'estado_actualizado', 'aprobado', 'rechazado', 'info'],
            default: 'info',
        },
        leida: {
            type: Boolean,
            default: false,
        },
        enlace: {
            type: String,
        },
        referencia: {
            type: mongoose.Schema.Types.ObjectId,
        },
    },
    { timestamps: true }
)

notificationSchema.index({ usuario: 1, leida: 1 })
notificationSchema.index({ createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
