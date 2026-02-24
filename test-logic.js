import xlsx from 'xlsx';
const filePath = 'uploads/excel/INSCRITOS ADMITIDOS INGENIERIA DE SISTEMAS 2024-2.xlsx';
const periodo = '2024-2';

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

let municipiosRow = null;
let dataRow = null;

for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.includes('Etiquetas de fila') || r.includes('AGUSTÍN CODAZZI')) {
        municipiosRow = r;
    }
    if (r.includes('INGENIERIA DE SISTEMAS') || r.includes('Ingeniería de Sistemas')) {
        dataRow = r;
    }
}

// Fallback just in case
if (!municipiosRow || !dataRow) {
    if (rows.length >= 3) {
        municipiosRow = rows[1];
        dataRow = rows[2];
    }
}

const startIndex = 1;
let endIndex = municipiosRow.length - 1;

if (municipiosRow[endIndex] && typeof municipiosRow[endIndex] === 'string' &&
    municipiosRow[endIndex].toLowerCase().includes('total')) {
    endIndex--;
}

const documentos = [];

for (let j = startIndex; j <= endIndex; j++) {
    const municipio = municipiosRow[j];
    const cantidad = parseInt(dataRow[j], 10);

    if (municipio && !isNaN(cantidad)) {
        if (!municipio.toString().toLowerCase().includes('unnamed') && municipio !== 'Etiquetas de fila' && municipio !== 'Total general') {
            documentos.push({
                programa: "Ingeniería de Sistemas",
                municipio: municipio.toString().trim(),
                cantidad: cantidad,
                periodo: periodo
            });
        }
    }
}

console.log('Documentos extraidos:', JSON.stringify(documentos.slice(0, 5), null, 2));
console.log('Total documentos:', documentos.length);
