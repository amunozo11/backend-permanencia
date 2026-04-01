import fs from 'fs';
import xlsx from 'xlsx';
import InscritoAdmitido from '../models/InscritoAdmitido.js';

export const importarDatos = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        const filePath = req.file.path;
        console.log(`Procesando archivo: ${filePath}`);

        const periodo = req.body.periodo || "2024-2";

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        // Normalización para tabla dinámica
        let municipiosRow = null;
        let dataRow = null;

        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            // Buscamos la fila de los municipios
            if (r.includes('Etiquetas de fila') || r.includes('AGUSTÍN CODAZZI')) {
                municipiosRow = r;
            }
            // Buscamos la fila de la cantidad
            if (r.includes('INGENIERIA DE SISTEMAS') || r.includes('Ingeniería de Sistemas')) {
                dataRow = r;
            }
        }

        if (!municipiosRow || !dataRow) {
            // Fallback
            if (rows.length >= 3) {
                municipiosRow = rows[1];
                dataRow = rows[2];
            } else {
                return res.status(400).json({ message: 'No se pudo detectar la estructura de la tabla dinámica o no se encontró INGENIERIA DE SISTEMAS.' });
            }
        }

        const startIndex = 1; // "Etiquetas de fila" suele estar en 0
        let endIndex = municipiosRow.length - 1;

        if (municipiosRow[endIndex] && typeof municipiosRow[endIndex] === 'string' &&
            municipiosRow[endIndex].toLowerCase().includes('total')) {
            endIndex--;
        }

        const documentos = [];

        for (let j = startIndex; j <= endIndex; j++) {
            const municipio = municipiosRow[j];
            const cantidad = parseInt(dataRow[j], 10);

            if (municipio && !isNaN(cantidad)) {
                if (!municipio.toString().toLowerCase().includes('unnamed') && municipio !== 'Etiquetas de fila' && municipio !== 'Total general') {
                    documentos.push({
                        programa: "Ingeniería de Sistemas",
                        municipio: municipio.toString().trim(),
                        cantidad: cantidad,
                        periodo: periodo
                    });
                }
            }
        }

        if (documentos.length === 0) {
            return res.status(400).json({ message: 'No se extrajeron municipios válidos.' });
        }

        await InscritoAdmitido.deleteMany({ periodo: periodo, programa: "Ingeniería de Sistemas" });
        await InscritoAdmitido.insertMany(documentos);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return res.status(200).json({
            message: 'Datos importados y normalizados con éxito',
            totalRegistros: documentos.length,
            periodo: periodo
        });

    } catch (error) {
        console.error('Error importando inscritos:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

export const getPorMunicipio = async (req, res) => {
    try {
        const { periodo } = req.query;
        let query = {};
        if (periodo) query.periodo = periodo;

        const estadisticas = await InscritoAdmitido.aggregate([
            { $match: query },
            { $group: { _id: "$municipio", total: { $sum: "$cantidad" } } },
            { $sort: { total: -1 } }
        ]);

        const result = estadisticas.map(e => ({ name: e._id, value: e.total }));
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getPorMunicipio:', error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

export const getTopMunicipios = async (req, res) => {
    try {
        let limit = parseInt(req.query.limit, 10);
        if (isNaN(limit) || limit <= 0) limit = 5;

        const { periodo } = req.query;
        let query = {};
        if (periodo) query.periodo = periodo;

        const estadisticas = await InscritoAdmitido.aggregate([
            { $match: query },
            { $group: { _id: "$municipio", total: { $sum: "$cantidad" } } },
            { $sort: { total: -1 } },
            { $limit: limit }
        ]);

        const result = estadisticas.map((e, index) => ({ rank: index + 1, municipio: e._id, total: e.total }));
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getTopMunicipios:', error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

export const getTotalInscritos = async (req, res) => {
    try {
        const { periodo } = req.query;
        let query = {};
        if (periodo) query.periodo = periodo;

        const estadisticas = await InscritoAdmitido.aggregate([
            { $match: query },
            { $group: { _id: null, totalGlobal: { $sum: "$cantidad" }, uniqueMunicipios: { $addToSet: "$municipio" } } }
        ]);

        if (estadisticas.length === 0) {
            return res.status(200).json({ total: 0, municipiosCubiertos: 0 });
        }

        const data = estadisticas[0];
        return res.status(200).json({
            total: data.totalGlobal,
            municipiosCubiertos: data.uniqueMunicipios.length
        });

    } catch (error) {
        console.error('Error en getTotalInscritos:', error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
