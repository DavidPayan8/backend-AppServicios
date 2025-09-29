const {generateExcelBuffer} = require('../utils/excel');


/**
 * Exporta un Excel con columnas dinámicas
 */
const exportExcel = async (req, res) => {
    try {
        const { data, columns, fileName, sheetName } = req.body;

        // Valores por defecto si no vienen en el body
        const finalFileName = fileName || 'export.xlsx';
        const finalSheetName = sheetName || 'Datos';

        // Generar el Excel en memoria
        const buffer = await generateExcelBuffer(finalSheetName, columns, data);

        // Cabeceras para descarga
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${finalFileName}"`
        );

        // Enviar el buffer
        res.send(buffer);
    } catch (err) {
        console.error('Error exportando Excel:', err);
        res.status(500).json({ message: 'Error al generar el Excel' });
    }
};

module.exports = {
    exportExcel,
};
