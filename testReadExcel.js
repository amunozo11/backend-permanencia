import xlsx from 'xlsx';

const workbook = xlsx.readFile('uploads/excel/INSCRITOS ADMITIDOS INGENIERIA DE SISTEMAS 2024-2.xlsx');
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

console.log('--- FIRST 20 ROWS ---');
console.log(JSON.stringify(data.slice(0, 20), null, 2));
