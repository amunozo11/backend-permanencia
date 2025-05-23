const SoftwareSolicitud = require('../models/SoftwareSolicitud.model');

exports.create = async (req, res) => {
  try {
    const doc = await SoftwareSolicitud.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  const docs = await SoftwareSolicitud.find();
  res.json(docs);
};

exports.getOne = async (req, res) => {
  try {
    const doc = await SoftwareSolicitud.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'No encontrado' });
    res.json(doc);
  } catch {
    res.status(400).json({ error: 'ID inválido' });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await SoftwareSolicitud.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  await SoftwareSolicitud.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
