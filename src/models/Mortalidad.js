import mongoose from 'mongoose';

const MortalidadSchema = new mongoose.Schema({
    programa: {
        type: String,
        required: true,
        default: 'Ingeniería'
    },
    asignatura: {
        type: String,
        required: true,
        index: true
    },
    periodo: {
        type: String,
        required: true,
        index: true
    },
    tasaMortalidad: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Índice compuesto para evitar duplicados si se carga el mismo periodo/asignatura
MortalidadSchema.index({ asignatura: 1, periodo: 1, programa: 1 }, { unique: true });

export default mongoose.model('Mortalidad', MortalidadSchema);
