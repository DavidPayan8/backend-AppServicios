const SequelizeAuto = require('sequelize-auto');

console.log('🔧 Iniciando generación de modelos...');

const auto = new SequelizeAuto('AppPruebas', 'Kong', 'SQLKong1972.', {
  host: '85.215.191.245',
  dialect: 'mssql',
  port: 1433,
  directory: './model',
  additional: {
    timestamps: false,
  },
  dialectOptions: {
    options: {
      encrypt: false,
    },
  },
  logging: console.log,
});

auto.run()
  .then(data => {
    console.log('✅ Modelos generados correctamente.');
    console.log(Object.keys(data.tables));
  })
  .catch(err => {
    console.error('❌ Error al generar modelos:', err);
  });
