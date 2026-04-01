import mongoose from 'mongoose';
import { obtenerConcentracionHistorica, obtenerRiesgosEmergentes } from './src/controllers/mortalidadController.js';

const URI = 'mongodb+srv://admin_db_user:amZyESZW1UKFzlwf@cluster0.fdrdgxy.mongodb.net/Cluster0?retryWrites=true&w=majority';

mongoose.connect(URI)
    .then(async () => {
        console.log('Connected');
        await obtenerConcentracionHistorica({}, {
            json: (data) => console.log('Concentracion:', JSON.stringify(data).substring(0, 100)),
            status: (code) => ({ json: (err) => console.error('Status', code, err) })
        });
        await obtenerRiesgosEmergentes({}, {
            json: (data) => console.log('Emergentes:', data),
            status: (code) => ({ json: (err) => console.error('Status', code, err) })
        });
        process.exit(0);
    })
    .catch(console.error);
