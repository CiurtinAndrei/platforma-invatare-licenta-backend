const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('teste', {
    idtest: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idprofesor: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'profesori',
        key: 'idprofesor'
      }
    },
    tip: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    datacreatie: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    notamaxima: {
      type: DataTypes.REAL,
      allowNull: false
    },
    document: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    barem: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'teste',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "teste_pkey",
        unique: true,
        fields: [
          { name: "idtest" },
        ]
      },
    ]
  });
};
