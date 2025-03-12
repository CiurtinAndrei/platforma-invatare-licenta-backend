const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('exercitii', {
    idexercitiu: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    clasa: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    capitol: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    subcapitol: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    punctaj: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cerinta: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rezolvare: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'exercitii',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "exercitii_pkey",
        unique: true,
        fields: [
          { name: "idexercitiu" },
        ]
      },
    ]
  });
};
