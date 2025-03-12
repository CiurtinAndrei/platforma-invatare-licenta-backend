var DataTypes = require("sequelize").DataTypes;
var _asociere_et = require("./asociere_et");
var _elevi = require("./elevi");
var _exercitii = require("./exercitii");
var _formulare = require("./formulare");
var _profesori = require("./profesori");
var _teme = require("./teme");
var _teste = require("./teste");

function initModels(sequelize) {
  var asociere_et = _asociere_et(sequelize, DataTypes);
  var elevi = _elevi(sequelize, DataTypes);
  var exercitii = _exercitii(sequelize, DataTypes);
  var formulare = _formulare(sequelize, DataTypes);
  var profesori = _profesori(sequelize, DataTypes);
  var teme = _teme(sequelize, DataTypes);
  var teste = _teste(sequelize, DataTypes);

  teme.belongsTo(elevi, { as: "idelev_elevi", foreignKey: "idelev"});
  elevi.hasMany(teme, { as: "temes", foreignKey: "idelev"});
  asociere_et.belongsTo(exercitii, { as: "idexercitiu_exercitii", foreignKey: "idexercitiu"});
  exercitii.hasMany(asociere_et, { as: "asociere_ets", foreignKey: "idexercitiu"});
  elevi.belongsTo(profesori, { as: "idprofesor_profesori", foreignKey: "idprofesor"});
  profesori.hasMany(elevi, { as: "elevis", foreignKey: "idprofesor"});
  teste.belongsTo(profesori, { as: "idprofesor_profesori", foreignKey: "idprofesor"});
  profesori.hasMany(teste, { as: "testes", foreignKey: "idprofesor"});
  asociere_et.belongsTo(teste, { as: "idtest_teste", foreignKey: "idtest"});
  teste.hasMany(asociere_et, { as: "asociere_ets", foreignKey: "idtest"});
  formulare.belongsTo(teste, { as: "idtest_teste", foreignKey: "idtest"});
  teste.hasMany(formulare, { as: "formulares", foreignKey: "idtest"});

  return {
    asociere_et,
    elevi,
    exercitii,
    formulare,
    profesori,
    teme,
    teste,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
