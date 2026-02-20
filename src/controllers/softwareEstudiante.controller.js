import SoftwareEstudiante from '../models/SoftwareEstudiante.model.js'

export const create = async (req, res) => {
  try {
    const doc = await SoftwareEstudiante.create(req.body)
    res.status(201).json(doc)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const getAll = async (req, res) => {
  const docs = await SoftwareEstudiante.find().populate('solicitud_id')
  res.json(docs)
}

export const getOne = async (req, res) => {
  try {
    const doc = await SoftwareEstudiante.findById(req.params.id).populate('solicitud_id')
    if (!doc) return res.status(404).json({ error: 'No encontrado' })
    res.json(doc)
  } catch {
    res.status(400).json({ error: 'ID inválido' })
  }
}

export const update = async (req, res) => {
  try {
    const doc = await SoftwareEstudiante.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(doc)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const remove = async (req, res) => {
  await SoftwareEstudiante.findByIdAndDelete(req.params.id)
  res.status(204).end()
}
