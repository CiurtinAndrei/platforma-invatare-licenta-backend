const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subcapitole', {
    idsubcapitol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nume: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    idcapitol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'capitole',
        key: 'idcapitol'
      }
    }
  }, {
    sequelize,
    tableName: 'subcapitole',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "subcapitole_pkey",
        unique: true,
        fields: [
          { name: "idsubcapitol" },
        ]
      },
    ]
  });
};
