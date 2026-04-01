import FichaDocente from '../models/FichaDocente.model.js'

export const create = async (req, res) => {
  try {
    const doc = await FichaDocente.create(req.body)
    res.status(201).json(doc)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const getAll = async (req, res) => {
  const docs = await FichaDocente.find()
  res.json(docs)
}

export const getOne = async (req, res) => {
  try {
    const doc = await FichaDocente.findById(req.params.id)
    if (!doc) return res.status(404).json({ error: 'No encontrado' })
    res.json(doc)
  } catch {
    res.status(400).json({ error: 'ID inválido' })
  }
}

export const update = async (req, res) => {
  try {
    const doc = await FichaDocente.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(doc)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const remove = async (req, res) => {
  await FichaDocente.findByIdAndDelete(req.params.id)
  res.status(204).end()
}
