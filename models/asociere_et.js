const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('asociere_et', {
    idasociere: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idtest: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'teste',
        key: 'idtest'
      }
    },
    idexercitiu: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'exercitii',
        key: 'idexercitiu'
      }
    },
    punctaj: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'asociere_et',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "asociere_et_pkey",
        unique: true,
        fields: [
          { name: "idasociere" },
        ]
      },
    ]
  });
};
