const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('exercitii', {
    idexercitiu: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
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
    },
    capitol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'capitole',
        key: 'idcapitol'
      }
    },
    subcapitol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subcapitole',
        key: 'idsubcapitol'
      }
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
