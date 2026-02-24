import mongoose from 'mongoose';

const inscritoAdmitidoSchema = new mongoose.Schema({
    programa: {
        type: String,
        required: true,
        default: 'Ingeniería de Sistemas'
    },
    municipio: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        default: 0
    },
    periodo: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('InscritoAdmitido', inscritoAdmitidoSchema);
