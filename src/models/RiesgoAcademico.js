import mongoose from 'mongoose';

const riesgoAcademicoSchema = new mongoose.Schema({
    estudiante: {
        documento: { type: String, required: true },
        nombre: { type: String, required: true },
        email_institucional: String,
        email_personal: String,
        celular: String,
        municipio: String
    },
    programa: { type: String, required: true },
    periodoLectivo: { type: String, required: true }, // Ejemplo: "2025-2"
    metricas: {
        periodos_cronologicos: Number,
        periodos_matriculados: Number,
        promedio_semestre: Number,
        promedio_general: Number,
        creditos_aprobados: Number,
        materias_tomadas: Number
    },
    riesgo: {
        nivel_crudo: String, // Valor original del Excel (ej: "2. Riesgo Alto")
        nivel: {
            type: String,
            enum: ['ALTO', 'MEDIO', 'BAJO', 'SIN RIESGO'],
            required: true
        }
    }
}, { timestamps: true });

// Índices para búsquedas rápidas en dashboards
riesgoAcademicoSchema.index({ 'estudiante.documento': 1, periodoLectivo: 1 }, { unique: true });
riesgoAcademicoSchema.index({ programa: 1 });
riesgoAcademicoSchema.index({ 'riesgo.nivel': 1 });
riesgoAcademicoSchema.index({ periodoLectivo: 1 });

export default mongoose.model('RiesgoAcademico', riesgoAcademicoSchema);
