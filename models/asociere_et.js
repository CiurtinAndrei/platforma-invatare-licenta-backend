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
      allowNull: false,
      references: {
        model: 'teste',
        key: 'idtest'
      }
    },
    idexercitiu: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'exercitii',
        key: 'idexercitiu'
      }
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
