const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('capitole', {
    idcapitol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nume: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'capitole',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "capitole_pkey",
        unique: true,
        fields: [
          { name: "idcapitol" },
        ]
      },
    ]
  });
};
