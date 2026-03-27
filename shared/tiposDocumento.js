const TIPOS_DOCUMENTO = Object.freeze({
  NOMINAS: 'nominas',
  DOCUMENTACION: 'documentacion',
  IDENTIFICACION: 'identificacion',
  OT: 'OT',
  GENERAL: 'General',
  CONTACTO: 'contacto',
  NOTA_GASTO: 'NotaGasto',
});

const TIPOS_VALIDOS = Object.values(TIPOS_DOCUMENTO);

module.exports = { TIPOS_DOCUMENTO, TIPOS_VALIDOS };
