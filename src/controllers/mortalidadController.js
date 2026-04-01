import Mortalidad from '../models/Mortalidad.js';
import XLSX from 'xlsx';

/**
 * Importa y normaliza datos de mortalidad académica desde Excel
 */
export const importarMortalidad = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Archivo Excel requerido' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        if (data.length < 3) {
            return res.status(400).json({ success: false, message: 'El archivo Excel no tiene el formato esperado' });
        }

        const programaRaw = data[1][0] || 'Ingeniería';
        const programa = programaRaw.includes(':') ? programaRaw.split(':')[1].trim() : programaRaw;
        const periods = data[2].slice(1); // Fila 2, desde la columna 1 son los periodos
        const subjectRows = data.slice(3); // Desde la fila 3 son las asignaturas

        let count = 0;
        const operations = [];

        for (const row of subjectRows) {
            const asignatura = row[0];
            if (!asignatura) continue;

            for (let i = 0; i < periods.length; i++) {
                const periodo = String(periods[i]);
                const tasaMortalidad = Number(row[i + 1]);

                if (isNaN(tasaMortalidad)) continue;

                operations.push({
                    updateOne: {
                        filter: { asignatura, periodo, programa: 'Ingeniería' },
                        update: {
                            $set: {
                                programa: 'Ingeniería',
                                asignatura,
                                periodo,
                                tasaMortalidad
                            }
                        },
                        upsert: true
                    }
                });
                count++;
            }
        }

        if (operations.length > 0) {
            await Mortalidad.bulkWrite(operations);
        }

        res.json({
            success: true,
            message: `Importación completada. Se procesaron ${subjectRows.length} asignaturas y ${count} registros de mortalidad.`
        });
    } catch (error) {
        console.error('Error al importar mortalidad:', error);
        res.status(500).json({ success: false, message: 'Error al procesar el archivo Excel' });
    }
};

/**
 * Top 10 asignaturas con mayor mortalidad promedio
 */
export const obtenerTopAsignaturas = async (req, res) => {
    try {
        const stats = await Mortalidad.aggregate([
            {
                $group: {
                    _id: '$asignatura',
                    promedioMortalidad: { $avg: '$tasaMortalidad' },
                    registros: { $sum: 1 }
                }
            },
            { $sort: { promedioMortalidad: -1 } },
            { $limit: 10 },
            {
                $project: {
                    asignatura: '$_id',
                    promedioMortalidad: { $multiply: ['$promedioMortalidad', 100] }, // Convertir a porcentaje
                    _id: 0
                }
            }
        ]);

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error en obtenerTopAsignaturas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    }
};

/**
 * Evolución histórica de una asignatura específica
 */
export const obtenerEvolucionAsignatura = async (req, res) => {
    try {
        const { asignatura } = req.params;
        const evolucion = await Mortalidad.find({ asignatura: new RegExp(asignatura, 'i') })
            .sort({ periodo: 1 });

        const formattedData = evolucion.map(item => ({
            periodo: item.periodo,
            tasa: (item.tasaMortalidad * 100).toFixed(2)
        }));

        res.json({ success: true, data: formattedData });
    } catch (error) {
        console.error('Error en obtenerEvolucionAsignatura:', error);
        res.status(500).json({ success: false, message: 'Error al obtener evolución' });
    }
};

/**
 * Concentración Histórica de Mortalidad (Top 5 vs Otras)
 */
export const obtenerConcentracionHistorica = async (req, res) => {
    try {
        // En un modelo relativo donde la suma del periodo es 100%, calculamos el top 5 histórico
        const top5 = await Mortalidad.aggregate([
            {
                $group: {
                    _id: '$asignatura',
                    promedioMortalidad: { $avg: '$tasaMortalidad' }
                }
            },
            { $sort: { promedioMortalidad: -1 } },
            { $limit: 5 },
            { $project: { _id: 1 } }
        ]);

        const topAsignaturas = top5.map(t => t._id);

        // Ahora sacamos los datos para cada periodo
        const stats = await Mortalidad.aggregate([
            {
                $group: {
                    _id: {
                        periodo: '$periodo',
                        esTop: { $in: ['$asignatura', topAsignaturas] },
                        asignatura: '$asignatura'
                    },
                    tasa: { $sum: '$tasaMortalidad' }
                }
            },
            {
                $group: {
                    _id: '$_id.periodo',
                    detalles: {
                        $push: {
                            asignatura: '$_id.asignatura',
                            esTop: '$_id.esTop',
                            tasa: '$tasa'
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formattedData = stats.map(periodo => {
            const data = { periodo: periodo._id, 'Otras Materias': 0 };
            topAsignaturas.forEach(a => data[a] = 0);

            let sumaTotal = 0;
            periodo.detalles.forEach(d => {
                const porcentaje = d.tasa * 100;
                sumaTotal += porcentaje;
                if (d.esTop) {
                    data[d.asignatura] = Number(porcentaje.toFixed(2));
                } else {
                    data['Otras Materias'] += porcentaje;
                }
            });

            // Ajuste por redondeo para que Otras Materias complemente a 100%
            const sumaTop = topAsignaturas.reduce((acc, curr) => acc + data[curr], 0);
            data['Otras Materias'] = Number(Math.max(0, 100 - sumaTop).toFixed(2));

            return data;
        });

        res.json({ success: true, data: formattedData, topAsignaturas });
    } catch (error) {
        console.error('Error en obtenerConcentracionHistorica:', error);
        res.status(500).json({ success: false, message: 'Error al obtener concentración histórica' });
    }
};

/**
 * Riesgos Emergentes (Comparación último periodo vs histórico)
 */
export const obtenerRiesgosEmergentes = async (req, res) => {
    try {
        // Encontrar el último periodo
        const ultimoPeriodoObj = await Mortalidad.findOne().sort({ periodo: -1 }).select('periodo');
        if (!ultimoPeriodoObj) {
            return res.json({ success: true, data: [] });
        }
        const ultimoPeriodo = ultimoPeriodoObj.periodo;

        // Group by asignatura
        const stats = await Mortalidad.aggregate([
            {
                $group: {
                    _id: '$asignatura',
                    historico: {
                        $push: {
                            periodo: '$periodo',
                            tasa: '$tasaMortalidad'
                        }
                    }
                }
            }
        ]);

        const riesgosEmergentes = [];

        stats.forEach(materia => {
            const historico = materia.historico;
            const dataUltimoPeriodo = historico.find(h => h.periodo === ultimoPeriodo);

            if (dataUltimoPeriodo) {
                const otrosPeriodos = historico.filter(h => h.periodo !== ultimoPeriodo);

                if (otrosPeriodos.length > 0) {
                    const promedioAnterior = otrosPeriodos.reduce((acc, curr) => acc + curr.tasa, 0) / otrosPeriodos.length;
                    const tasaActual = dataUltimoPeriodo.tasa;

                    // Solo si la tasa actual es mayor y el aumento es significativo (ej. > 20% relativo y > 0.5% absoluto del semestre)
                    const variacionAbsoluta = (tasaActual - promedioAnterior) * 100;

                    if (variacionAbsoluta > 0.5) {
                        riesgosEmergentes.push({
                            asignatura: materia._id,
                            promedioHistorico: Number((promedioAnterior * 100).toFixed(2)),
                            tasaActual: Number((tasaActual * 100).toFixed(2)),
                            variacion: Number(variacionAbsoluta.toFixed(2))
                        });
                    }
                }
            }
        });

        // Ordenar por la mayor variación
        riesgosEmergentes.sort((a, b) => b.variacion - a.variacion);

        res.json({ success: true, data: riesgosEmergentes.slice(0, 10) });
    } catch (error) {
        console.error('Error en obtenerRiesgosEmergentes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener riesgos emergentes' });
    }
};

/**
 * Lista de todas las asignaturas para filtros
 */
export const obtenerListaAsignaturas = async (req, res) => {
    try {
        const asignaturas = await Mortalidad.distinct('asignatura');
        res.json({ success: true, data: asignaturas.sort() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener lista de asignaturas' });
    }
};
