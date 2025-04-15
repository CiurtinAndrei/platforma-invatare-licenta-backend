var DataTypes = require("sequelize").DataTypes;
var _asociere_et = require("./asociere_et");
var _capitole = require("./capitole");
var _elevi = require("./elevi");
var _exercitii = require("./exercitii");
var _profesori = require("./profesori");
var _subcapitole = require("./subcapitole");
var _teme = require("./teme");
var _teste = require("./teste");

function initModels(sequelize) {
  var asociere_et = _asociere_et(sequelize, DataTypes);
  var capitole = _capitole(sequelize, DataTypes);
  var elevi = _elevi(sequelize, DataTypes);
  var exercitii = _exercitii(sequelize, DataTypes);
  var profesori = _profesori(sequelize, DataTypes);
  var subcapitole = _subcapitole(sequelize, DataTypes);
  var teme = _teme(sequelize, DataTypes);
  var teste = _teste(sequelize, DataTypes);

  exercitii.belongsTo(capitole, { as: "capitol_capitole", foreignKey: "capitol"});
  capitole.hasMany(exercitii, { as: "exercitiis", foreignKey: "capitol"});
  subcapitole.belongsTo(capitole, { as: "idcapitol_capitole", foreignKey: "idcapitol"});
  capitole.hasMany(subcapitole, { as: "subcapitoles", foreignKey: "idcapitol"});
  teme.belongsTo(elevi, { as: "idelev_elevi", foreignKey: "idelev"});
  elevi.hasMany(teme, { as: "temes", foreignKey: "idelev"});
  asociere_et.belongsTo(exercitii, { as: "idexercitiu_exercitii", foreignKey: "idexercitiu"});
  exercitii.hasMany(asociere_et, { as: "asociere_ets", foreignKey: "idexercitiu"});
  elevi.belongsTo(profesori, { as: "idprofesor_profesori", foreignKey: "idprofesor"});
  profesori.hasMany(elevi, { as: "elevis", foreignKey: "idprofesor"});
  teste.belongsTo(profesori, { as: "idprofesor_profesori", foreignKey: "idprofesor"});
  profesori.hasMany(teste, { as: "testes", foreignKey: "idprofesor"});
  exercitii.belongsTo(subcapitole, { as: "subcapitol_subcapitole", foreignKey: "subcapitol"});
  subcapitole.hasMany(exercitii, { as: "exercitiis", foreignKey: "subcapitol"});
  asociere_et.belongsTo(teste, { as: "idtest_teste", foreignKey: "idtest"});
  teste.hasMany(asociere_et, { as: "asociere_ets", foreignKey: "idtest"});
  teme.belongsTo(teste, { as: "idtest_teste", foreignKey: "idtest"});
  teste.hasMany(teme, { as: "temes", foreignKey: "idtest"});

  return {
    asociere_et,
    capitole,
    elevi,
    exercitii,
    profesori,
    subcapitole,
    teme,
    teste,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
