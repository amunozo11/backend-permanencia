import mongoose from 'mongoose'

const solicitudSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tipo: {
            type: String,
            required: true,
            enum: [
                'acta_negacion',
                'asistencia_actividad',
                'ficha_docente',
                'intervencion_grupal',
                'remision_psicologica',
                'software_solicitud',
                'software_estudiante',
                'tutoria',
                'psicologia',
                'socioeconomico',
                'vocacional',
                'talleres',
                'seguimiento',
                'comedor',
                'software',
                'otro',
            ],
        },
        estado: {
            type: String,
            enum: ['pendiente', 'recibida', 'en_proceso', 'completada', 'rechazada', 'aprobada', 'en_revision'],
            default: 'pendiente',
        },
        datos: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        descripcion: {
            type: String,
            required: true,
        },
        observaciones_admin: {
            type: String,
            maxlength: 500,
        },
        documento: {
            type: Boolean,
            default: false,
        },
        historial_estados: [
            {
                estado: String,
                fecha: { type: Date, default: Date.now },
                comentario: String,
                documento: {
                    type: Boolean,
                    default: false,
                }
            },
        ],
    },
    { timestamps: true }
)

solicitudSchema.index({ usuario: 1 })
solicitudSchema.index({ estado: 1 })
solicitudSchema.index({ tipo: 1 })
solicitudSchema.index({ createdAt: -1 })

export default mongoose.model('Solicitud', solicitudSchema)
