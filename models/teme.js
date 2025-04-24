const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('teme', {
    idtema: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idelev: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'elevi',
        key: 'idelev'
      }
    },
    datatrimitere: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    datacorectare: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    nota: {
      type: DataTypes.REAL,
      allowNull: true
    },
    idtest: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'teste',
        key: 'idtest'
      }
    },
    raportprofesor: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    'feedback ': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rezolvare: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'teme',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "teme_pkey",
        unique: true,
        fields: [
          { name: "idtema" },
        ]
      },
    ]
  });
};
