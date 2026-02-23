import RiesgoAcademico from '../models/RiesgoAcademico.js';
import XLSX from 'xlsx';

/**
 * Normaliza el nivel de riesgo del formato Excel a valores Enum
 */
const normalizarRiesgo = (raw) => {
    if (!raw) return 'SIN RIESGO';
    const clean = raw.toLowerCase();
    if (clean.includes('alto')) return 'ALTO';
    if (clean.includes('medio')) return 'MEDIO';
    if (clean.includes('bajo')) return 'BAJO';
    return 'SIN RIESGO';
};

/**
 * Importa datos desde un archivo Excel
 */
export const importarRiesgo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Archivo Excel requerido' });
        }

        const { periodoLectivo } = req.body;
        if (!periodoLectivo) {
            return res.status(400).json({ success: false, message: 'Periodo lectivo requerido (ej: 2025-2)' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        // Saltar encabezados (Fila 0)
        const rows = data.slice(1);
        let count = 0;

        for (const row of rows) {
            if (!row[0]) continue; // Saltar filas vacías

            const record = {
                estudiante: {
                    documento: String(row[0]),
                    nombre: row[1],
                    municipio: row[3],
                    email_institucional: row[5],
                    email_personal: row[6],
                    celular: String(row[7])
                },
                programa: row[2],
                periodoLectivo,
                metricas: {
                    periodos_cronologicos: Number(row[9]),
                    periodos_matriculados: Number(row[10]),
                    promedio_semestre: Number(row[11]),
                    promedio_general: Number(row[12]),
                    creditos_aprobados: Number(row[13]),
                    materias_tomadas: Number(row[14])
                },
                riesgo: {
                    nivel_crudo: row[15],
                    nivel: normalizarRiesgo(row[15])
                }
            };

            // Upsert por documento y periodo
            await RiesgoAcademico.findOneAndUpdate(
                { 'estudiante.documento': record.estudiante.documento, periodoLectivo },
                record,
                { upsert: true, new: true }
            );
            count++;
        }

        res.json({ success: true, message: `Se procesaron ${count} registros exitosamente` });
    } catch (error) {
        console.error('Error al importar riesgo:', error);
        res.status(500).json({ success: false, message: 'Error al procesar el archivo Excel' });
    }
};

/**
 * Genera estadísticas agregadas para el Dashboard
 */
export const obtenerEstadisticas = async (req, res) => {
    try {
        const { periodoLectivo } = req.query;
        const filter = periodoLectivo ? { periodoLectivo } : {};

        // 1. Distribución Global de Riesgo
        const distribucionGlobal = await RiesgoAcademico.aggregate([
            { $match: filter },
            { $group: { _id: '$riesgo.nivel', count: { $sum: 1 } } }
        ]);

        // 2. Riesgo por Programa
        const riesgoPorPrograma = await RiesgoAcademico.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$programa',
                    alto: { $sum: { $cond: [{ $eq: ['$riesgo.nivel', 'ALTO'] }, 1, 0] } },
                    medio: { $sum: { $cond: [{ $eq: ['$riesgo.nivel', 'MEDIO'] }, 1, 0] } },
                    bajo: { $sum: { $cond: [{ $eq: ['$riesgo.nivel', 'BAJO'] }, 1, 0] } },
                    total: { $sum: 1 }
                }
            },
            { $sort: { alto: -1 } }
        ]);

        // 3. Correlación Promedio vs Riesgo (Muestra para Scatter Plot)
        const correlacion = await RiesgoAcademico.find(filter, {
            'riesgo.nivel': 1,
            'metricas.promedio_general': 1,
            'metricas.periodos_cronologicos': 1,
            programa: 1
        }).limit(500);

        res.json({
            success: true,
            data: {
                distribucionGlobal,
                riesgoPorPrograma,
                correlacion
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ success: false, message: 'Error al generar indicadores' });
    }
};
