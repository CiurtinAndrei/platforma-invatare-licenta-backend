const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('profesori', {
    idprofesor: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    nume: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    prenume: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    adresa: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: "email_unique_prof"
    },
    telefon: {
      type: DataTypes.STRING(45),
      allowNull: true,
      unique: "telefon_unique_prof"
    },
    scoala: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    parola: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "parola_unique_prof"
    },
    dateistorice: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'profesori',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "email_unique_prof",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "parola_unique_prof",
        unique: true,
        fields: [
          { name: "parola" },
        ]
      },
      {
        name: "profesori_pkey",
        unique: true,
        fields: [
          { name: "idprofesor" },
        ]
      },
      {
        name: "telefon_unique_prof",
        unique: true,
        fields: [
          { name: "telefon" },
        ]
      },
    ]
  });
};
