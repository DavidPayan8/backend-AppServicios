// models/PushBrowser.js
module.exports = (sequelize, DataTypes) => {
  const PushBrowser = sequelize.define("PushBrowser", {
    endpoint: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      unique: true,
    },
    p256dh: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    auth: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  PushBrowser.associate = (models) => {
    PushBrowser.belongsTo(models.USUARIOS, {
      foreignKey: "id_usuario",
      as: "user",
    });
  };

  return PushBrowser;
};
