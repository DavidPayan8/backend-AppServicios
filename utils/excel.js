const ExcelJS = require('exceljs');

/**
 * Genera un Buffer de Excel a partir de columnas y datos.
 * @param {string} sheetName   Nombre de la hoja
 * @param {Array} columns      Columnas [{ header, key, width }]
 * @param {Array} data         Datos [{ key: value }]
 * @returns {Promise<Buffer>}  Buffer del archivo Excel
 */
async function generateExcelBuffer(sheetName, columns, data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  // Definir columnas
  sheet.columns = columns;

  // Agregar filas
  data.forEach(row => sheet.addRow(row));

  // Ajustar ancho automático
  sheet.columns.forEach(col => {
    let maxLength = col.header.length;
    col.eachCell({ includeEmpty: true }, cell => {
      const cellValue = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, cellValue.length);
    });
    col.width = maxLength + 2;
  });

  // Estilizar encabezado
  sheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF217346' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  return await workbook.xlsx.writeBuffer();
}

module.exports = { generateExcelBuffer };
