var DataTypes = require("sequelize").DataTypes;
var _ARTICULOS = require("./ARTICULOS");
var _CABECERA = require("./CABECERA");
var _CALENDARIO = require("./CALENDARIO");
var _CAPITULOS = require("./CAPITULOS");
var _CLIENTES = require("./CLIENTES");
var _CONFIGURACIONES = require("./CONFIGURACIONES");
var _CONFIG_EMPRESA = require("./CONFIG_EMPRESA");
var _CONTRATO = require("./CONTRATO");
var _CONTROL_ASISTENCIAS = require("./CONTROL_ASISTENCIAS");
var _CONTROL_ASISTENCIAS_BACKUP = require("./CONTROL_ASISTENCIAS_BACKUP");
var _DESCUENTOS = require("./DESCUENTOS");
var _DETALLES_CONTRATO = require("./DETALLES_CONTRATO");
var _DETALLES_DOC = require("./DETALLES_DOC");
var _DIAS_VACACION = require("./DIAS_VACACION");
var _EMPRESA = require("./EMPRESA");
var _EMPRESAS_MODULOS = require("./EMPRESAS_MODULOS");
var _EMPRESAS_SUBMODULOS = require("./EMPRESAS_SUBMODULOS");
var _LISTA_ARTICULOS_PARTES = require("./LISTA_ARTICULOS_PARTES");
var _MODULOS = require("./MODULOS");
var _NOTIFICACIONES = require("./NOTIFICACIONES");
var _NOTIFICACIONES_USUARIOS = require("./NOTIFICACIONES_USUARIOS");
var _ORDEN_TRABAJO = require("./ORDEN_TRABAJO");
var _PARTES_MATERIALES = require("./PARTES_MATERIALES");
var _PARTES_TRABAJO = require("./PARTES_TRABAJO");
var _PARTIDAS = require("./PARTIDAS");
var _PROYECTOS = require("./PROYECTOS");
var _SUBMODULOS = require("./SUBMODULOS");
var _TIPOS_IVA = require("./TIPOS_IVA");
var _TIPOS_VACACION = require("./TIPOS_VACACION");
var _USUARIOS = require("./USUARIOS");
var _VACACIONES = require("./VACACIONES");
var _VACACIONES_ESTADOS = require("./VACACIONES_ESTADOS");
var _VEHICULOS = require("./VEHICULOS");

function initModels(sequelize) {
  var ARTICULOS = _ARTICULOS(sequelize, DataTypes);
  var CABECERA = _CABECERA(sequelize, DataTypes);
  var CALENDARIO = _CALENDARIO(sequelize, DataTypes);
  var CAPITULOS = _CAPITULOS(sequelize, DataTypes);
  var CLIENTES = _CLIENTES(sequelize, DataTypes);
  var CONFIGURACIONES = _CONFIGURACIONES(sequelize, DataTypes);
  var CONFIG_EMPRESA = _CONFIG_EMPRESA(sequelize, DataTypes);
  var CONTRATO = _CONTRATO(sequelize, DataTypes);
  var CONTROL_ASISTENCIAS = _CONTROL_ASISTENCIAS(sequelize, DataTypes);
  var CONTROL_ASISTENCIAS_BACKUP = _CONTROL_ASISTENCIAS_BACKUP(
    sequelize,
    DataTypes
  );
  var DESCUENTOS = _DESCUENTOS(sequelize, DataTypes);
  var DETALLES_CONTRATO = _DETALLES_CONTRATO(sequelize, DataTypes);
  var DETALLES_DOC = _DETALLES_DOC(sequelize, DataTypes);
  var DIAS_VACACION = _DIAS_VACACION(sequelize, DataTypes);
  var EMPRESA = _EMPRESA(sequelize, DataTypes);
  var EMPRESAS_MODULOS = _EMPRESAS_MODULOS(sequelize, DataTypes);
  var EMPRESAS_SUBMODULOS = _EMPRESAS_SUBMODULOS(sequelize, DataTypes);
  var LISTA_ARTICULOS_PARTES = _LISTA_ARTICULOS_PARTES(sequelize, DataTypes);
  var MODULOS = _MODULOS(sequelize, DataTypes);
  var NOTIFICACIONES = _NOTIFICACIONES(sequelize, DataTypes);
  var NOTIFICACIONES_USUARIOS = _NOTIFICACIONES_USUARIOS(sequelize, DataTypes);
  var ORDEN_TRABAJO = _ORDEN_TRABAJO(sequelize, DataTypes);
  var PARTES_MATERIALES = _PARTES_MATERIALES(sequelize, DataTypes);
  var PARTES_TRABAJO = _PARTES_TRABAJO(sequelize, DataTypes);
  var PARTIDAS = _PARTIDAS(sequelize, DataTypes);
  var PROYECTOS = _PROYECTOS(sequelize, DataTypes);
  var SUBMODULOS = _SUBMODULOS(sequelize, DataTypes);
  var TIPOS_IVA = _TIPOS_IVA(sequelize, DataTypes);
  var TIPOS_VACACION = _TIPOS_VACACION(sequelize, DataTypes);
  var USUARIOS = _USUARIOS(sequelize, DataTypes);
  var VACACIONES = _VACACIONES(sequelize, DataTypes);
  var VACACIONES_ESTADOS = _VACACIONES_ESTADOS(sequelize, DataTypes);
  var VEHICULOS = _VEHICULOS(sequelize, DataTypes);

  return {
    ARTICULOS,
    CABECERA,
    CALENDARIO,
    CAPITULOS,
    CLIENTES,
    CONFIGURACIONES,
    CONFIG_EMPRESA,
    CONTRATO,
    CONTROL_ASISTENCIAS,
    CONTROL_ASISTENCIAS_BACKUP,
    DESCUENTOS,
    DETALLES_CONTRATO,
    DETALLES_DOC,
    DIAS_VACACION,
    EMPRESA,
    EMPRESAS_MODULOS,
    EMPRESAS_SUBMODULOS,
    LISTA_ARTICULOS_PARTES,
    MODULOS,
    NOTIFICACIONES,
    NOTIFICACIONES_USUARIOS,
    ORDEN_TRABAJO,
    PARTES_MATERIALES,
    PARTES_TRABAJO,
    PARTIDAS,
    PROYECTOS,
    SUBMODULOS,
    TIPOS_IVA,
    TIPOS_VACACION,
    USUARIOS,
    VACACIONES,
    VACACIONES_ESTADOS,
    VEHICULOS,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
