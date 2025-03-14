const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('formulare', {
    idformular: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idtest: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'teste',
        key: 'idtest'
      }
    },
    raport: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    datacreatie: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    uuidtema: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'formulare',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "formulare_pkey",
        unique: true,
        fields: [
          { name: "idformular" },
        ]
      },
    ]
  });
};
