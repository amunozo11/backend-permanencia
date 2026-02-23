import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join('c:', 'Users', 'Alex', 'Desktop', 'Sistema-permanencia', 'backend-permanencia', 'uploads', 'excel', 'ALUMNOS MATRICULADOS POR RIESGO CRONOLOICO 2025-2.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('--- EXCEL PREVIEW (First 5 Rows) ---');
    data.slice(0, 5).forEach((row, index) => {
        console.log(`Row ${index}:`, JSON.stringify(row));
    });
    console.log('--- END PREVIEW ---');
} catch (error) {
    console.error('Error reading Excel file:', error.message);
}
