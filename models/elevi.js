const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('elevi', {
    idelev: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    idprofesor: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'profesori',
        key: 'idprofesor'
      }
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
      unique: "email_unique_elev"
    },
    telefon: {
      type: DataTypes.STRING(45),
      allowNull: true,
      unique: "telefon_unique_elev"
    },
    scoala: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    parola: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "parola_unique_elev"
    },
    clasa: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'elevi',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "elevi_pkey",
        unique: true,
        fields: [
          { name: "idelev" },
        ]
      },
      {
        name: "email_unique_elev",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "parola_unique_elev",
        unique: true,
        fields: [
          { name: "parola" },
        ]
      },
      {
        name: "telefon_unique_elev",
        unique: true,
        fields: [
          { name: "telefon" },
        ]
      },
    ]
  });
};
