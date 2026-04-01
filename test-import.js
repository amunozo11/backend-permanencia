import connectDB from './src/config/db.js';
import { importarDatos } from './src/controllers/inscritosController.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Ensure the file is not deleted so the user doesn't lose it, copy it to temp
fs.copyFileSync('uploads/excel/INSCRITOS ADMITIDOS INGENIERIA DE SISTEMAS 2024-2.xlsx', 'uploads/test_excel.xlsx');

const req = {
    file: { path: 'uploads/test_excel.xlsx' },
    body: { periodo: '2024-2' }
};

const res = {
    status: (code) => {
        console.log(`Status: ${code}`);
        return res;
    },
    json: (data) => {
        console.log('Response:', JSON.stringify(data, null, 2));
        return res;
    }
};

const run = async () => {
    await connectDB();
    await importarDatos(req, res);
    mongoose.disconnect();
};

run();
