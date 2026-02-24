import XLSX from 'xlsx';
import path from 'path';

const filePath = 'C:/Users/Alex/Desktop/Sistema-permanencia/backend-permanencia/uploads/excel/EVOLUCION ASIGNATURAS CON MAYOR TASA DE MORTALIDAD (INGENIERIA).xlsx';

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
