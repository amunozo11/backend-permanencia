const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Ajusta estas referencias a tus modelos según el CSV
const SoftwareSolicitud = require('../models/SoftwareSolicitud.model');

// Configuración de multer (almacena el archivo en /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Middleware para express
exports.uploadCsv = upload.single('file');

// Lógica de parseo y guardado
exports.processCsv = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo no enviado' });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // Ejemplo: insertar todos los registros en SoftwareSolicitud
        const docs = await SoftwareSolicitud.insertMany(results);
        // Elimina el archivo temporal
        fs.unlinkSync(req.file.path);
        res.json({ inserted: docs.length, docs });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
};